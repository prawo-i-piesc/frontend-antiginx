/**
 * Admin operations: backend-antiginx docs/Backend/Auth.md, "Admin operations".
 *
 * Every route re-reads the caller's role from the database, so hiding the
 * panel from other accounts is a courtesy, not the boundary. A demotion takes
 * effect on the next request, which then fails with FORBIDDEN.
 */

import type { ScanStatus } from "@/app/lib/api";
import type { Plan } from "@/app/lib/billingApi";
import { query, request } from "@/app/lib/request";
import type { TestFailures } from "@/app/lib/statsApi";

export type Role = "user" | "admin";
export type ScanType = "free" | "premium";

export const SCAN_STATUSES: readonly ScanStatus[] = ["PENDING", "RUNNING", "COMPLETED", "FAILED"];
export const SCAN_TYPES: readonly ScanType[] = ["free", "premium"];


export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
  email_verified: boolean;
  totp_enabled: boolean;
  /** Sent with the list; the details carry the whole `plan` instead. */
  plan?: Plan;
}

/** An account's plan as the admin panel sees it: where Pro comes from, if it has it. */
export interface AdminPlan {
  plan: Plan;
  /** Stripe's side, as last synced; null for an account that never started a payment. */
  subscription: {
    status: string;
    current_period_end: string | null;
    cancel_at: string | null;
    stripe_customer_id: string;
    synced_at: string;
  } | null;
  /** Pro granted by an administrator, while it lasts. */
  grant: {
    granted_at: string;
    /** Null for a grant with no end. */
    expires_at: string | null;
    granted_by: string;
    /** Null once that administrator's account is gone. */
    granted_by_email: string | null;
  } | null;
  /** No paid subscription runs, so Pro can be granted. The grant itself checks Stripe again. */
  can_grant: boolean;
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
  plan: AdminPlan;
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
  /** Hash of the site's icon; null until it is known. */
  favicon?: string | null;
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
  /** Accounts created in the last 7 days. */
  new_users: number;
  recent_scans: {
    id: string;
    target_url: string;
    status: string;
    created_at: string;
    type: ScanType;
    favicon?: string | null;
  }[];
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

/** Grant lengths the panel offers, in days; 0 grants Pro with no end. */
export const GRANT_DAYS = [30, 90, 365, 0] as const;
export type GrantDays = (typeof GRANT_DAYS)[number];

/**
 * Grants Pro for `days` days, or with no end for 0, replacing an earlier
 * grant. Refused with SUBSCRIPTION_ACTIVE while the account pays in Stripe.
 */
export function grantPro(id: string, days: GrantDays): Promise<AdminPlan> {
  return request<AdminPlan>(`/api/admin/users/${encodeURIComponent(id)}/plan-grant`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ days }),
  });
}

/** Ends a grant. A Stripe subscription is left alone: the owner cancels that in the portal. */
export function revokePro(id: string): Promise<AdminPlan> {
  return request<AdminPlan>(`/api/admin/users/${encodeURIComponent(id)}/plan-grant`, { method: "DELETE" });
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

/** The most failed tests across free and premium scans in the last `days`, most failures first. */
export async function getFailedTests(
  params: { days: number; limit?: number },
  signal?: AbortSignal,
): Promise<TestFailures[]> {
  const body = await request<{ tests: TestFailures[] }>(`/api/admin/stats/tests${query(params)}`, { signal });
  return body.tests;
}
