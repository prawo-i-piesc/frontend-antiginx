// API configuration and types based on backend specification

import { API_CONFIG } from "@/app/config/constants";

const BACKEND_URL = API_CONFIG.BACKEND_URL;

// Types based on backend response structure
export type ScanStatus = "PENDING" | "COMPLETED" | "FAILED" | "RUNNING";
export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface ScanResultItem {
  id: number;
  scan_id: string;
  test_id: string;
  test_name: string;
  category: string;
  severity: SeverityLevel;
  passed: boolean;
  message: string;
  reference: string;
  remediation: string;
}

type PartialScanResult = Partial<ScanResultItem> | null | undefined;

function normalizeSeverity(severity: unknown): SeverityLevel | null {
  if (typeof severity !== "string") return null;
  const upper = severity.trim().toUpperCase();
  if (
    upper === "CRITICAL" ||
    upper === "HIGH" ||
    upper === "MEDIUM" ||
    upper === "LOW" ||
    upper === "INFO"
  ) {
    return upper;
  }
  return null;
}

export function isCompletedScanResult(
  result: PartialScanResult,
): result is ScanResultItem {
  if (!result || typeof result !== "object") return false;

  const hasName =
    typeof result.test_name === "string" && result.test_name.trim().length > 0;
  const hasPassStatus = typeof result.passed === "boolean";
  const severity = normalizeSeverity(result.severity);

  return hasName && hasPassStatus && severity !== null;
}

export function getCompletedScanResults(
  results: PartialScanResult[] = [],
): ScanResultItem[] {
  return results.filter(isCompletedScanResult);
}

export interface ScanResponse {
  id: string;
  target_url: string;
  status: ScanStatus;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  results: ScanResultItem[];
}

export interface UserScanResponse extends ScanResponse {
  user_id: string;
}

export interface CreateScanRequest {
  target_url: string;
  tests?: string[];
}

export interface CreateScanResponse {
  scanId: string;
  status: ScanStatus;
}

export type ScanAccessMode = "free" | "premium";

export interface ScanRequestOptions {
  mode?: ScanAccessMode;
  token?: string | null;
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

// API functions
export async function createScan(
  targetUrl: string,
  tests?: string[],
  options?: ScanRequestOptions,
): Promise<CreateScanResponse> {
  const mode = options?.mode ?? "free";
  const payload: CreateScanRequest = { target_url: targetUrl };
  if (tests && tests.length > 0) {
    payload.tests = tests;
  }

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${scanPath(mode)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(options?.token),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new ApiRequestError("Cannot connect to scanner service", {
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response, "Failed to create scan"),
      {
        status: response.status,
        code: `HTTP_${response.status}`,
      },
    );
  }

  return response.json();
}

export async function getScan(
  scanId: string,
  options?: ScanRequestOptions,
): Promise<ScanResponse> {
  const mode = options?.mode ?? "free";
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}${scanPath(mode)}/${scanId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(options?.token),
      },
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

export async function getUserScans(token: string): Promise<UserScanResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/users/scans`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
    });
  } catch (error) {
    throw new ApiRequestError("Cannot connect to scanner service", {
      code: "NETWORK_ERROR",
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiRequestError(
      await readErrorMessage(response, "Failed to fetch user scans"),
      {
        status: response.status,
        code: `HTTP_${response.status}`,
      },
    );
  }

  return response.json();
}

// Polling function to wait for scan completion
export async function pollScanUntilComplete(
  scanId: string,
  onProgress?: (scan: ScanResponse) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000,
  shouldAbort?: () => boolean,
  options?: ScanRequestOptions,
): Promise<ScanResponse> {
  const mode = options?.mode ?? "free";
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Check if polling should be aborted
    if (shouldAbort && shouldAbort()) {
      const scan = await getScan(scanId, options);
      return scan; // Return current state and stop polling
    }

    const scan = await getScan(scanId, options);

    if (onProgress) {
      onProgress(scan);
    }

    if (scan.status === "COMPLETED" || scan.status === "FAILED") {
      return scan;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  const timeoutSeconds = Math.round((maxAttempts * intervalMs) / 1000);
  throw new ApiRequestError(
    `Scan timeout after ${timeoutSeconds}s (${mode} mode)`,
    { code: "SCAN_TIMEOUT" },
  );
}

// Helper functions for UI
export function getSeverityColor(severity: SeverityLevel): string {
  switch (severity) {
    case "CRITICAL":
      return "text-red-500";
    case "HIGH":
      return "text-red-400";
    case "MEDIUM":
      return "text-orange-400";
    case "LOW":
      return "text-yellow-400";
    case "INFO":
      return "text-blue-400";
    default:
      return "text-zinc-400";
  }
}

export function getSeverityBgColor(severity: SeverityLevel): string {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-900/30 border-red-600/50";
    case "HIGH":
      return "bg-red-900/20 border-red-600/30";
    case "MEDIUM":
      return "bg-orange-900/20 border-orange-600/30";
    case "LOW":
      return "bg-yellow-900/20 border-yellow-600/30";
    case "INFO":
      return "bg-blue-900/20 border-blue-600/30";
    default:
      return "bg-zinc-800/50 border-zinc-700/50";
  }
}

export function calculateThreatLevel(results: ScanResultItem[]): number {
  const completedResults = getCompletedScanResults(results);
  if (completedResults.length === 0) return 0;

  const severityWeights: Record<SeverityLevel, number> = {
    CRITICAL: 100,
    HIGH: 75,
    MEDIUM: 50,
    LOW: 25,
    INFO: 5,
  };

  const failedTests = completedResults.filter((r) => r.passed === false);
  if (failedTests.length === 0) return 0;

  const totalWeight = failedTests.reduce((sum, result) => {
    const normalized = normalizeSeverity(result.severity);
    if (!normalized) return sum;
    return sum + severityWeights[normalized];
  }, 0);

  // Calculate weighted average and cap at 100
  const avgWeight = totalWeight / failedTests.length;
  return Math.min(Math.round(avgWeight), 100);
}

export function getStatusColor(status: ScanStatus): string {
  switch (status) {
    case "COMPLETED":
      return "text-green-400";
    case "FAILED":
      return "text-red-400";
    case "RUNNING":
      return "text-yellow-400";
    case "PENDING":
      return "text-blue-400";
    default:
      return "text-zinc-400";
  }
}

// ----------------------
// Authentication API
// ----------------------

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_in: number;
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: "Registration failed" }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Login failed" }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export function authHeader(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface MeResponse {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
}

export async function getMe(token: string): Promise<MeResponse> {
  if (!BACKEND_URL) throw new Error("BACKEND_URL not configured");
  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: "Failed to fetch user" }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }

  return res.json();
}
