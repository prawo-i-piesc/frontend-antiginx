import type { ScanStatus } from "@/app/lib/api";
import { browserTimeZone, type CalendarRun, type CalendarTerm, type Schedule, type ScheduleCalendar } from "@/app/lib/schedulesApi";

/**
 * Made-up schedules on example.* addresses, for the preview an account
 * without Pro sees behind the paywall: the page as it would look in use.
 * Built around today, so the calendar has scans behind and terms ahead.
 */

const DAYS = 45;
const TESTS = ["https", "hsts", "csp", "xframe", "cookie-sec"];

interface Sample {
  id: string;
  url: string;
  frequency: Schedule["frequency"];
  hour: number;
  minute: number;
  weekday?: number;
  monthDay?: number;
  /** Paused this many days ago. */
  pausedDaysAgo?: number;
}

const SAMPLES: Sample[] = [
  { id: "sample-daily", url: "https://example.com", frequency: "daily", hour: 8, minute: 0 },
  { id: "sample-weekly", url: "https://shop.example.com", frequency: "weekly", hour: 6, minute: 30, weekday: 1 },
  { id: "sample-monthly", url: "https://api.example.com", frequency: "monthly", hour: 3, minute: 0, monthDay: 1 },
  { id: "sample-paused", url: "https://staging.example.com", frequency: "daily", hour: 22, minute: 0, pausedDaysAgo: 6 },
];

/** Risk scores the runs cycle through: mostly low, now and then worse. */
const RISKS = [8, 12, 12, 31, 8, 12, 56, 12, 8, 31, 12];

function runsOn(sample: Sample, day: Date): boolean {
  if (sample.frequency === "weekly") return day.getDay() === sample.weekday;
  if (sample.frequency === "monthly") return day.getDate() === sample.monthDay;
  return true;
}

export function sampleSchedules(now = new Date()): { schedules: Schedule[]; calendar: ScheduleCalendar } {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const runs: CalendarRun[] = [];
  const planned: CalendarTerm[] = [];
  const next = new Map<string, Date>();

  for (let offset = -DAYS; offset <= DAYS; offset++) {
    const day = new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() + offset);
    SAMPLES.forEach((sample, index) => {
      if (!runsOn(sample, day)) return;
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), sample.hour, sample.minute);
      const paused = sample.pausedDaysAgo !== undefined;
      if (paused && offset >= -sample.pausedDaysAgo!) return;
      if (at > now) {
        if (!next.has(sample.id)) next.set(sample.id, at);
        planned.push({ schedule_id: sample.id, target_url: sample.url, at: at.toISOString() });
        return;
      }
      const seed = Math.abs(offset * 7 + index * 3);
      const status: ScanStatus = seed % 17 === 5 ? "FAILED" : "COMPLETED";
      runs.push({
        scan_id: `${sample.id}-${offset}`,
        schedule_id: sample.id,
        target_url: sample.url,
        status,
        at: at.toISOString(),
        risk: status === "COMPLETED" ? RISKS[seed % RISKS.length] : null,
      });
    });
  }

  const created = new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() - DAYS).toISOString();
  const schedules = SAMPLES.map((sample): Schedule => {
    const own = runs.filter((run) => run.schedule_id === sample.id);
    const last = own[own.length - 1];
    const enabled = sample.pausedDaysAgo === undefined;
    return {
      id: sample.id,
      target_url: sample.url,
      tests: TESTS,
      frequency: sample.frequency,
      time: `${String(sample.hour).padStart(2, "0")}:${String(sample.minute).padStart(2, "0")}`,
      weekday: sample.weekday ?? null,
      month_day: sample.monthDay ?? null,
      // The viewer's own, so the cadence reads without a zone after it.
      timezone: browserTimeZone(),
      enabled,
      blocked: false,
      blocked_at: null,
      block_reason: "",
      next_run_at: enabled ? (next.get(sample.id)?.toISOString() ?? null) : null,
      last_run_at: last?.at ?? null,
      last_error: "",
      last_scan: last ? { id: last.scan_id, status: last.status, created_at: last.at, risk: last.risk } : null,
      runs: own.length,
      created_at: created,
      favicon: null,
    };
  });

  return { schedules, calendar: { runs, planned } };
}
