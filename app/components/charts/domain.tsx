"use client";

import { useI18n } from "@/app/i18n/I18nProvider";
import { PERIODS } from "@/app/lib/statsApi";

/** The charts page's period when the address does not name one. */
const CHARTS_DEFAULT_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The charts page narrowed to one address, over the shortest period that
 * still reaches back to `since` (a scan's date), so that scan is on the chart.
 */
export function chartsHref(url: string, since?: string): string {
  const age = since ? (Date.now() - Date.parse(since)) / DAY_MS : 0;
  const days = PERIODS.find((period) => age <= period) ?? PERIODS[PERIODS.length - 1];
  const period = days === CHARTS_DEFAULT_DAYS ? "" : `days=${days}&`;
  return `/dashboard/charts?${period}domain=${encodeURIComponent(url)}`;
}

/** HTTPS is the norm and only takes room; a plain-HTTP target keeps its scheme, which matters. */
export function displayUrl(url: string): string {
  return url.startsWith("https://") ? url.slice("https://".length) : url;
}

/** Latest risk against the first in the window; a single scan has nothing to compare. */
export function RiskChange({ value, scans }: { value: number; scans: number }) {
  const { t } = useI18n();
  const copy = t.charts.domains;
  if (scans < 2) {
    return (
      <span className="text-zinc-500 dark:text-zinc-400">
        <span aria-hidden="true">—</span>
        <span className="sr-only">{t.widgets.noData}</span>
      </span>
    );
  }
  if (value === 0) {
    return (
      <span className="text-zinc-500 dark:text-zinc-400">
        <span aria-hidden="true">0</span>
        <span className="sr-only">{copy.same}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      <i className={value > 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"} aria-hidden="true" />
      <span aria-hidden="true">{Math.abs(value)}</span>
      <span className="sr-only">{value > 0 ? copy.up(value) : copy.down(-value)}</span>
    </span>
  );
}
