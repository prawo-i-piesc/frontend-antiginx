"use client";

import Link from "next/link";

import { RiskLabel } from "@/app/components/scan/labels";
import { DATA, Stamp, StatusLabel } from "@/app/components/ui/table";
import { useI18n } from "@/app/i18n/I18nProvider";
import { browserTimeZone, scheduleState, type Schedule, type ScheduleDefinition } from "@/app/lib/schedulesApi";

/** "Every Friday at 08:00", with the zone when it is not this browser's. */
export function useCadenceText() {
  const { t } = useI18n();
  const copy = t.schedules.cadence;
  const here = browserTimeZone();

  return (schedule: Pick<ScheduleDefinition, "frequency" | "time" | "weekday" | "month_day" | "timezone">) => {
    const text =
      schedule.frequency === "weekly"
        ? copy.weekly(schedule.weekday ?? 1, schedule.time)
        : schedule.frequency === "monthly"
          ? copy.monthly(schedule.month_day ?? 1, schedule.time)
          : copy.daily(schedule.time);
    return schedule.timezone && schedule.timezone !== here ? `${text} (${copy.zone(schedule.timezone)})` : text;
  };
}

const STATE_STYLES = {
  active: { icon: "ri-play-line", tone: "text-emerald-700 dark:text-emerald-400" },
  paused: { icon: "ri-pause-line", tone: "text-zinc-600 dark:text-zinc-400" },
  blocked: { icon: "ri-forbid-line", tone: "text-rose-700 dark:text-rose-400" },
} as const;

/** Active, paused or blocked: a word with an icon; a block says who and why on hover and to screen readers. */
export function ScheduleStateLabel({ schedule }: { schedule: Schedule }) {
  const { t } = useI18n();
  const copy = t.schedules.table;
  const state = scheduleState(schedule);
  const { icon, tone } = STATE_STYLES[state];
  const note =
    state === "blocked"
      ? [copy.blockedNote, schedule.block_reason ? copy.blockReason(schedule.block_reason) : null].filter(Boolean).join(". ")
      : undefined;

  return (
    <span title={note} className={`inline-flex items-center gap-1 font-medium ${tone}`}>
      <i className={icon} aria-hidden="true" />
      {copy.states[state]}
      {note ? <span className="sr-only">. {note}</span> : null}
    </span>
  );
}

/** When it runs next, or a dash while it is paused or blocked. */
export function NextRun({ schedule }: { schedule: Schedule }) {
  return schedule.next_run_at ? <Stamp value={schedule.next_run_at} /> : <span className={DATA}>—</span>;
}

/**
 * How the last term went: skipped and why, or the scan's status and risk.
 * The status leads to the scan: a link with `scanHref`, a button with
 * `onOpenScan` (the admin's inspector).
 */
export function LastRun({
  schedule,
  scanHref,
  onOpenScan,
}: {
  schedule: Schedule;
  scanHref?: (scanId: string) => string;
  onOpenScan?: (scanId: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.schedules.table;

  if (schedule.last_error) {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
        <i className="ri-error-warning-line" aria-hidden="true" />
        {copy.skipped[schedule.last_error]}
      </span>
    );
  }
  const scan = schedule.last_scan;
  if (!scan) return <span className="text-zinc-600 dark:text-zinc-400">{copy.notYet}</span>;

  const status = <StatusLabel status={scan.status} />;
  return (
    <span className="inline-flex items-baseline gap-2">
      {scanHref ? (
        <Link href={scanHref(scan.id)} title={copy.lastScan(schedule.target_url)} className="underline-offset-2 hover:underline">
          {status}
        </Link>
      ) : onOpenScan ? (
        <button
          type="button"
          onClick={() => onOpenScan(scan.id)}
          title={copy.lastScan(schedule.target_url)}
          className="cursor-pointer underline-offset-2 hover:underline"
        >
          {status}
        </button>
      ) : (
        status
      )}
      {scan.risk !== null ? <RiskLabel score={scan.risk} /> : null}
    </span>
  );
}
