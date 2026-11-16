/**
 * Scheduled scans: backend-antiginx docs/Backend/Schedules.md.
 *
 * A Pro feature. Without Pro the backend refuses to add, edit or resume one
 * (PRO_REQUIRED); pausing and deleting still work.
 */

import type { ScanStatus } from "@/app/lib/api";
import { query, request } from "@/app/lib/request";

export const SCHEDULE_FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCIES)[number];

/** Why the last term passed without a scan. */
export type ScheduleError = "PRO_REQUIRED" | "QUEUE_UNAVAILABLE" | "INVALID_TARGET";

/** The last day of the month a schedule can pick: every month has it. */
export const MAX_MONTH_DAY = 28;

export interface ScheduleDefinition {
  target_url: string;
  tests: string[];
  frequency: ScheduleFrequency;
  /** "HH:MM" in `timezone`. */
  time: string;
  /** Weekly: 0 (Sunday) to 6, as Date.getDay(). */
  weekday?: number | null;
  /** Monthly: 1 to MAX_MONTH_DAY. */
  month_day?: number | null;
  /** The IANA zone the time is on, the browser's when the schedule was saved. */
  timezone: string;
}

export interface ScheduleScan {
  id: string;
  status: ScanStatus;
  created_at: string;
  risk: number | null;
}

export interface Schedule extends ScheduleDefinition {
  id: string;
  weekday: number | null;
  month_day: number | null;
  /** Paused by its owner when false. */
  enabled: boolean;
  /** Blocked by an administrator, who may give a reason. */
  blocked: boolean;
  blocked_at: string | null;
  block_reason: string;
  /** Null while paused or blocked. */
  next_run_at: string | null;
  last_run_at: string | null;
  last_error: ScheduleError | "";
  last_scan: ScheduleScan | null;
  /** Scans the schedule has started. */
  runs: number;
  created_at: string;
  favicon: string | null;
  /** The owner, in the admin list only. */
  user_id?: string;
  user_email?: string | null;
}

export type ScheduleState = "active" | "paused" | "blocked";

export function scheduleState(schedule: Pick<Schedule, "enabled" | "blocked">): ScheduleState {
  if (schedule.blocked) return "blocked";
  return schedule.enabled ? "active" : "paused";
}

export interface SchedulesList {
  schedules: Schedule[];
  /** Most schedules the account may have. */
  limit: number;
}

export function listSchedules(signal?: AbortSignal): Promise<SchedulesList> {
  return request<SchedulesList>("/api/schedules", { signal });
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export function createSchedule(definition: ScheduleDefinition): Promise<Schedule> {
  return request<Schedule>("/api/schedules", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(definition) });
}

export function updateSchedule(id: string, definition: ScheduleDefinition): Promise<Schedule> {
  return request<Schedule>(`/api/schedules/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(definition),
  });
}

/** Pauses or resumes. Resuming counts the next term from now. */
export function setScheduleEnabled(id: string, enabled: boolean): Promise<Schedule> {
  return request<Schedule>(`/api/schedules/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ enabled }),
  });
}

/** The scans it started stay in the scan list. */
export function deleteSchedule(id: string): Promise<void> {
  return request<void>(`/api/schedules/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export interface CalendarTerm {
  schedule_id: string;
  target_url: string;
  at: string;
}

export interface CalendarRun {
  scan_id: string;
  schedule_id: string;
  target_url: string;
  status: ScanStatus;
  at: string;
  risk: number | null;
}

export interface ScheduleCalendar {
  /** Terms still to come, from now. */
  planned: CalendarTerm[];
  /** Scans schedules have started, including deleted schedules. */
  runs: CalendarRun[];
}

/** Terms and runs in [from, to), at most 45 days apart. */
export function getScheduleCalendar(from: Date, to: Date, signal?: AbortSignal): Promise<ScheduleCalendar> {
  return request<ScheduleCalendar>(
    `/api/schedules/calendar${query({ from: from.toISOString(), to: to.toISOString() })}`,
    { signal },
  );
}

/** The browser's time zone, which a schedule's time is kept in. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Admin -------------------------------------------------------------------

export interface AdminSchedulesPage {
  schedules: Schedule[];
  total: number;
  limit: number;
  offset: number;
}

/** Every account's schedules, newest first; `q` matches the target or the owner's email. */
export function listAdminSchedules(
  params: { q?: string; state?: ScheduleState; user_id?: string; limit: number; offset: number },
  signal?: AbortSignal,
): Promise<AdminSchedulesPage> {
  return request<AdminSchedulesPage>(`/api/admin/schedules${query(params)}`, { signal });
}

/** The owner sees the reason and cannot resume the schedule until the block is lifted. */
export function blockSchedule(id: string, reason: string): Promise<Schedule> {
  return request<Schedule>(`/api/admin/schedules/${encodeURIComponent(id)}/block`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ reason }),
  });
}

export function unblockSchedule(id: string): Promise<Schedule> {
  return request<Schedule>(`/api/admin/schedules/${encodeURIComponent(id)}/block`, { method: "DELETE" });
}
