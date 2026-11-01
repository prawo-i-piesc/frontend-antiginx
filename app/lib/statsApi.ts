/**
 * Dashboard statistics and account preferences: backend-antiginx
 * docs/Backend/Dashboard.md.
 *
 * The database aggregates everything over the account's premium scans inside
 * a window of `days`, so no view downloads scan results to count them itself.
 * Only completed scans count towards risk, severity and tests.
 */

import type { SeverityLevel } from "@/app/lib/api";
import { query, request } from "@/app/lib/request";

/** The windows the charts offer, in days; the API accepts 1–365. */
export const PERIODS = [30, 90, 365] as const;
export type Period = (typeof PERIODS)[number];

/** Most severe first, the order the API lists them in. */
export const SEVERITY_LEVELS: readonly SeverityLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export interface StatsWindow {
  /** 1–365. */
  days: number;
  /** Exactly as the scan's target_url; empty or missing for every domain. */
  domain?: string;
}

export interface StatsSummary {
  days: number;
  /** Every scan of the account by status, all time. */
  scans: { total: number; pending: number; running: number; completed: number; failed: number };
  /** Domains with a completed scan in the window. */
  domains: number;
  tests: { run: number; failed: number };
  /** 0–100; null when the window holds no completed scan, which is not the same as no risk. */
  risk: { average: number | null; latest: number | null };
}

/** One completed scan. */
export interface RiskPoint {
  scan_id: string;
  target_url: string;
  created_at: string;
  tests: number;
  failed: number;
  /** The average weight of the failed results, 0–100; 0 when everything passed. */
  risk: number;
}

export interface SeverityBreakdown {
  days: number;
  /** Failed results per severity; every level is present. */
  failed: Record<SeverityLevel, number>;
  passed: number;
}

/** A test that failed at least once, under the name the engine reports. */
export interface TestFailures {
  test_name: string;
  runs: number;
  failures: number;
}

export interface ScannedDomain {
  target_url: string;
  /** Completed scans, all time. */
  scans: number;
}

/** The keys an account may save; anything else is refused. */
export type PreferenceKey = "dashboard.widgets" | "admin.widgets";

function windowQuery(params: StatsWindow): string {
  return query({ days: params.days, domain: params.domain });
}

export function getSummary(params: StatsWindow, signal?: AbortSignal): Promise<StatsSummary> {
  return request<StatsSummary>(`/api/users/stats/summary${windowQuery(params)}`, { signal });
}

/** Oldest scan first. */
export async function getRiskTrend(params: StatsWindow, signal?: AbortSignal): Promise<RiskPoint[]> {
  const body = await request<{ points: RiskPoint[] }>(`/api/users/stats/risk${windowQuery(params)}`, { signal });
  return body.points;
}

export function getSeverity(params: StatsWindow, signal?: AbortSignal): Promise<SeverityBreakdown> {
  return request<SeverityBreakdown>(`/api/users/stats/severity${windowQuery(params)}`, { signal });
}

/** Most failures first; `limit` is 1–50. */
export async function getFailedTests(
  params: StatsWindow & { limit?: number },
  signal?: AbortSignal,
): Promise<TestFailures[]> {
  const search = query({ days: params.days, domain: params.domain, limit: params.limit });
  const body = await request<{ tests: TestFailures[] }>(`/api/users/stats/tests${search}`, { signal });
  return body.tests;
}

/** Every target with a completed scan, most recently scanned first. */
export async function getDomains(signal?: AbortSignal): Promise<ScannedDomain[]> {
  const body = await request<{ domains: ScannedDomain[] }>("/api/users/stats/domains", { signal });
  return body.domains;
}

/** The saved value, or null when the account has not saved one. */
export async function getPreference(key: PreferenceKey, signal?: AbortSignal): Promise<unknown> {
  const body = await request<{ value: unknown }>(`/api/users/preferences/${key}`, { signal });
  return body.value ?? null;
}

/** How a preference write is sent; `keepalive` lets it finish after the page is closed. */
export interface PreferenceWrite {
  keepalive?: boolean;
}

/** Replaces the saved value, a JSON array of at most 16 KiB. */
export async function putPreference(key: PreferenceKey, value: unknown, options: PreferenceWrite = {}): Promise<void> {
  await request(`/api/users/preferences/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
    keepalive: options.keepalive,
  });
}

/** Forgets the saved value, so the account follows the defaults again, including later changes to them. */
export async function deletePreference(key: PreferenceKey, options: PreferenceWrite = {}): Promise<void> {
  await request(`/api/users/preferences/${key}`, { method: "DELETE", keepalive: options.keepalive });
}

/** The overview's counters and latest scans: GET /api/users/widgets. */
export interface UserWidgets {
  total_scans: number;
  safe_sites: number;
  detected_threats: number;
  recent_scans: { id: string; target_url: string; status: string; created_at: string; type: string }[];
}

export function getUserWidgets(signal?: AbortSignal): Promise<UserWidgets> {
  return request<UserWidgets>("/api/users/widgets", { signal });
}
