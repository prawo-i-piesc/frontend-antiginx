import { authorizedFetch } from "@/app/lib/session";
import { riskScore } from "@/app/lib/risk";
import { query, request } from "@/app/lib/request";
import { normalizeTargetUrl } from "@/app/lib/scanTarget";

// API configuration and types based on backend specification

// Types based on backend response structure
export type ScanStatus = "PENDING" | "COMPLETED" | "FAILED" | "RUNNING";
export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface ScanResultItem {
  id: number;
  scan_id: string;
  test_name: string;
  /** As the engine reports it: High, Info, None… */
  severity: string;
  passed: boolean;
  /** An engine notice (a test aborted or blocked), not an outcome. */
  notice?: boolean;
  message: string;
  /** What the test recorded; its shape differs from test to test. */
  metadata?: unknown;
}

type PartialScanResult = Partial<ScanResultItem> | null | undefined;

export function isFinishedStatus(status: ScanStatus): boolean {
  return status === "COMPLETED" || status === "FAILED";
}

function normalizeSeverity(severity: unknown): SeverityLevel | null {
  if (typeof severity !== "string") return null;
  const upper = severity.trim().toUpperCase();

  // Mapowanie "NONE" bezpośrednio na "INFO"
  if (upper === "NONE") {
    return "INFO";
  }

  if (
    upper === "CRITICAL" ||
    upper === "HIGH" ||
    upper === "MEDIUM" ||
    upper === "LOW" ||
    upper === "INFO"
  ) {
    return upper as SeverityLevel;
  }
  return null;
}

function isCompletedScanResult(
  result: PartialScanResult,
): result is ScanResultItem {
  if (!result || typeof result !== "object") return false;

  const hasName =
    typeof result.test_name === "string" && result.test_name.trim().length > 0;
  const hasPassStatus = typeof result.passed === "boolean";
  const severity = normalizeSeverity(result.severity);

  return hasName && hasPassStatus && severity !== null;
}

function getCompletedScanResults(
  results: PartialScanResult[] = [],
): ScanResultItem[] {
  return results.filter(isCompletedScanResult).map((result) => ({
    ...result,

    severity: normalizeSeverity(result.severity) as SeverityLevel,
  }));
}
export interface ScanResponse {
  id: string;
  target_url: string;
  status: ScanStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  /** The engine test ids asked for; null on scans from before this was kept. */
  tests?: string[] | null;
  results: ScanResultItem[];
  /** Hash of the site's icon (see SiteIcon); null until the backend has fetched it. */
  favicon?: string | null;
}

interface CreateScanRequest {
  target_url: string;
  tests?: string[];
  anti_bot_detection?: boolean;
}

// Zmodyfikowana struktura opcji testu
export interface ScanTestOption {
  id: string;
  label: string;
  /** Needs the Pro plan; the backend refuses it on any other. */
  pro: boolean;
}

// Nowy interfejs reprezentujący pojedynczą kategorię
export interface TestCategory {
  category: string;
  tests: ScanTestOption[];
}

// Odpowiedź z konfiguracją to teraz tablica kategorii
export type PremiumScanConfigResponse = TestCategory[];

export interface CreateScanResponse {
  scanId: string;
  status: ScanStatus;
}

export type ScanAccessMode = "free" | "premium";

export interface ScanRequestOptions {
  mode?: ScanAccessMode;
  authorizedTester?: boolean;
  signal?: AbortSignal;
}

export class ApiRequestError extends Error {
  status?: number;
  code?: string;

  constructor(
    message: string,
    options?: { status?: number; code?: string; cause?: unknown },
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status;
    this.code = options?.code;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

function scanPath(mode: ScanAccessMode): string {
  return mode === "premium" ? "/api/scans" : "/api/freescans";
}

async function readErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const payload = await response
    .json()
    .catch(() => ({ error: fallbackMessage }));

  if (typeof payload?.error === "string" && payload.error.trim().length > 0) {
    return payload.error;
  }

  return `${fallbackMessage} (HTTP ${response.status})`;
}

/**
 * Premium routes carry the session and get a refresh-aware fetch; free scans
 * must stay anonymous, so they never touch the session store.
 */
function scanFetch(mode: ScanAccessMode, path: string, init: RequestInit): Promise<Response> {
  return mode === "premium" ? authorizedFetch(path, init) : fetch(path, init);
}

// API functions
export async function createScan(
  targetUrl: string,
  tests?: string[],
  options?: ScanRequestOptions,
): Promise<CreateScanResponse> {
  const mode = options?.mode ?? "free";
  const payload: CreateScanRequest = { target_url: normalizeTargetUrl(targetUrl) };
  if (tests && tests.length > 0) {
    payload.tests = tests;
  }

  if (options?.authorizedTester) {
    payload.anti_bot_detection = options.authorizedTester;
  }

  let response: Response;
  try {
    response = await scanFetch(mode, scanPath(mode), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new ApiRequestError("Cannot connect to scanner service", {
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (!response.ok) {
    // The backend's own code where it sent one: 403 alone cannot tell a lapsed
    // session from a plan that does not include the test.
    const body = (await response.clone().json().catch(() => null)) as { code?: unknown } | null;
    throw new ApiRequestError(
      await readErrorMessage(response, "Failed to create scan"),
      {
        status: response.status,
        code: typeof body?.code === "string" ? body.code : `HTTP_${response.status}`,
      },
    );
  }

  return response.json();
}

export async function getPremiumScanConfig(): Promise<PremiumScanConfigResponse> {
  let response: Response;
  try {
    response = await authorizedFetch("/api/utils/tests", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    throw new ApiRequestError("Cannot connect to scanner service", {
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(
        response,
        "Failed to fetch scan test configuration",
      ),
      {
        status: response.status,
        code: `HTTP_${response.status}`,
      },
    );
  }

  // Oczekujemy tablicy obiektów z backendu
  const payload = (await response.json()) as unknown;
  const rawCategories = Array.isArray(payload) ? payload : [];

  // Mapujemy surowe stringi z "tests" na pełne obiekty { id, label }
  return rawCategories.map((item: unknown) => {
    const entry = (item ?? {}) as { category?: unknown; tests?: unknown; pro_tests?: unknown };
    const rawTests: unknown[] = Array.isArray(entry.tests) ? entry.tests : [];
    const proTests: unknown[] = Array.isArray(entry.pro_tests) ? entry.pro_tests : [];

    return {
      // Translated on screen; an empty name shows there as "Other".
      category: typeof entry.category === "string" ? entry.category : "",
      tests: rawTests
        .filter((test): test is string => typeof test === "string")
        .map((id) => ({
          id,
          label: humanizeTestId(id), // Automatyczne nadawanie ładnych nazw z Twojego słownika
          pro: proTests.includes(id),
        })),
    };
  });
}

function humanizeTestId(id: string): string {
  const names: Record<string, string> = {
    https: "HTTPS",
    hsts: "HSTS",
    "serv-h-a": "Server Header",
    csp: "Content Security Policy",
    "cookie-sec": "Cookie Security",
    "js-obf": "JavaScript Obfuscation",
    xframe: "X-Frame-Options",
    "permissions-policy": "Permissions Policy",
    "x-content-type-options": "X-Content-Type-Options",
    "referrer-policy": "Referrer Policy",
    "cross-origin-x": "Cross-Origin",
    "cache-control": "Cache-Control",
    "robots-txt": "Robots.txt",
    urlhaus: "URLhaus",
    "dir-listing": "Directory Listing",
    "sensitive-files": "Sensitive Files",
  };

  return names[id] ?? id;
}

export async function getScan(
  scanId: string,
  options?: ScanRequestOptions,
): Promise<ScanResponse> {
  const mode = options?.mode ?? "free";
  let response: Response;
  try {
    response = await scanFetch(mode, `${scanPath(mode)}/${scanId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: options?.signal,
    });
  } catch (error) {
    throw new ApiRequestError("Cannot connect to scanner service", {
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response, "Failed to fetch scan status"),
      {
        status: response.status,
        code: `HTTP_${response.status}`,
      },
    );
  }

  return response.json();
}

/** A scan on the account's list: what the list shows, without the results. */
export interface ScanListItem {
  id: string;
  target_url: string;
  status: ScanStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  /** The engine test ids asked for; null on scans from before this was kept. */
  tests?: string[] | null;
  /** Tests that have answered so far: the scan's progress. */
  answered: number;
  /** 0–100 from the backend's risk model; null until the scan has a test outcome. */
  risk: number | null;
  /** Hash of the site's icon (see SiteIcon); null until the backend has fetched it. */
  favicon?: string | null;
}

/** "active" is a scan still on its way: PENDING or RUNNING. */
export const SCAN_LIST_STATUSES = ["active", "COMPLETED", "FAILED"] as const;
export type ScanListStatus = (typeof SCAN_LIST_STATUSES)[number];

export interface ScanListPage {
  scans: ScanListItem[];
  total: number;
  limit: number;
  offset: number;
}

/** One page of the account's scans, newest first, paged and filtered by the backend. */
export function getUserScans(
  params: { q?: string; status?: ScanListStatus; limit: number; offset: number },
  signal?: AbortSignal,
): Promise<ScanListPage> {
  return request<ScanListPage>(
    `/api/users/scans${query({ q: params.q, status: params.status, limit: params.limit, offset: params.offset })}`,
    { signal },
  );
}

/** The scan's risk, 0–100, by the model in lib/risk.ts that the charts share. */
export function calculateThreatLevel(results: ScanResultItem[]): number {
  const findings = getCompletedScanResults(results)
    .filter((result) => result.passed === false && !result.notice)
    .map((result) => ({ test: result.test_name, severity: result.severity }));
  return Math.round(riskScore(findings));
}
