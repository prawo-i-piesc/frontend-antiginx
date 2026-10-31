/**
 * Admin operations: backend-antiginx docs/Backend/Auth.md, "Admin operations".
 *
 * Every route re-reads the caller's role from the database, so hiding the
 * panel from other accounts is a courtesy, not the boundary. A demotion takes
 * effect on the next request, which then fails with FORBIDDEN.
 */

import type { ScanStatus } from "@/app/lib/api";
import { apiErrorFromResponse } from "@/app/lib/authErrors";
import { authorizedFetch } from "@/app/lib/session";

export type Role = "user" | "admin";
export type ScanType = "free" | "premium";

export const SCAN_STATUSES: readonly ScanStatus[] = ["PENDING", "RUNNING", "COMPLETED", "FAILED"];
export const SCAN_TYPES: readonly ScanType[] = ["free", "premium"];

/** The backend accepts 1–100 and defaults to 25. */
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
  email_verified: boolean;
  totp_enabled: boolean;
}

export interface AdminUserDetails {
  user: AdminUser;
  password_set: boolean;
  passkey_mode: "second_factor" | "passwordless";
  active_sessions: number;
  providers: string[];
  passkeys: number;
  recovery_codes_remaining: number;
  premium_scans: number;
}

export interface AdminScan {
  id: string;
  target_url: string;
  status: ScanStatus;
  created_at: string;
  type: ScanType;
  /** Premium scans only: free scans are anonymous. */
  user_id?: string;
  /** The owner's address; missing once the account is gone. */
  user_email?: string;
}

/** One engine check. The message is the engine's own, in English. */
export interface AdminScanResult {
  id: number;
  scan_id: string;
  test_name: string;
  severity: string;
  passed: boolean;
  message: string;
}

export interface AdminScanDetails extends AdminScan {
  started_at: string | null;
  completed_at: string | null;
  results: AdminScanResult[];
}

interface PageInfo {
  total: number;
  limit: number;
  offset: number;
}

export interface UsersPage extends PageInfo {
  users: AdminUser[];
}

export interface ScansPage extends PageInfo {
  scans: AdminScan[];
}

export interface AdminWidgets {
  total_users: number;
  all_time_scans: number;
  detected_threats: number;
  recent_scans: { id: string; target_url: string; status: string; created_at: string; type: ScanType }[];
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authorizedFetch(path, init);
  if (!response.ok) throw await apiErrorFromResponse(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export function getWidgets(signal?: AbortSignal): Promise<AdminWidgets> {
  return request<AdminWidgets>("/api/admin/widgets", { signal });
}

/** Newest first. `q` matches email or full name, case-insensitively. */
export function listUsers(
  params: { q?: string; limit: number; offset: number },
  signal?: AbortSignal,
): Promise<UsersPage> {
  return request<UsersPage>(`/api/admin/users${query(params)}`, { signal });
}

export function getUser(id: string, signal?: AbortSignal): Promise<AdminUserDetails> {
  return request<AdminUserDetails>(`/api/admin/users/${encodeURIComponent(id)}`, { signal });
}

/** Refused with ADMIN_SELF_ACTION for the caller's own account and LAST_ADMIN for the last admin. */
export function setUserRole(id: string, role: Role): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

/**
 * Revokes every refresh session. Access tokens already issued keep working
 * until they expire, which is minutes, not immediately.
 */
export function logoutUser(id: string): Promise<void> {
  return request<void>(`/api/admin/users/${encodeURIComponent(id)}/logout`, { method: "POST" });
}

/** Also closes the account's Stripe subscription; BILLING_UNAVAILABLE when Stripe is down. */
export function deleteUser(id: string): Promise<void> {
  return request<void>(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/**
 * Free and premium scans together, newest first. `user_id` keeps one
 * account's scans, which are all premium; `q` matches part of the target
 * address, case-insensitively.
 */
export function listScans(
  params: { type?: ScanType; status?: ScanStatus; user_id?: string; q?: string; limit: number; offset: number },
  signal?: AbortSignal,
): Promise<ScansPage> {
  return request<ScansPage>(`/api/admin/scans${query(params)}`, { signal });
}

/** Any scan, free or premium and whoever owns it, with its results. */
export function getScan(id: string, signal?: AbortSignal): Promise<AdminScanDetails> {
  return request<AdminScanDetails>(`/api/admin/scans/${encodeURIComponent(id)}`, { signal });
}

/** Deletes the scan together with its results. */
export function deleteScan(id: string): Promise<void> {
  return request<void>(`/api/admin/scans/${encodeURIComponent(id)}`, { method: "DELETE" });
}
