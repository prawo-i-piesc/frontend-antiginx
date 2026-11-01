import type { RiskPoint } from "@/app/lib/statsApi";

/**
 * How the risk line is drawn: one point per scan for a single domain, where
 * each scan is a step in that site's history; across all domains, the
 * average of a day's or a week's scans, since one line through unrelated
 * sites in scan order would mean nothing.
 */
export type Granularity = "scan" | "day" | "week";

export function granularityFor(days: number, domain: string): Granularity {
  if (domain) return "scan";
  return days <= 30 ? "day" : "week";
}

export interface Bucket {
  /** Local midnight that starts the day, or the Monday that starts the week. */
  start: number;
  scans: RiskPoint[];
  /** The scans' average risk, rounded. */
  risk: number;
}

function startOf(time: number, granularity: "day" | "week"): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  if (granularity === "week") date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime();
}

function average(values: readonly number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

/** Points oldest first, grouped into days or weeks that hold at least one scan. */
export function bucketPoints(points: readonly RiskPoint[], granularity: "day" | "week"): Bucket[] {
  const buckets = new Map<number, RiskPoint[]>();
  for (const point of points) {
    const start = startOf(Date.parse(point.created_at), granularity);
    buckets.set(start, [...(buckets.get(start) ?? []), point]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, scans]) => ({ start, scans, risk: average(scans.map((scan) => scan.risk)) }));
}

export interface DomainRow {
  url: string;
  /** The domain's scans in the window, oldest first. */
  points: RiskPoint[];
  latest: RiskPoint;
  /** Latest risk minus the first in the window; 0 with a single scan. */
  change: number;
}

/** One row per domain, the most recently scanned first. */
export function domainRows(points: readonly RiskPoint[]): DomainRow[] {
  const byUrl = new Map<string, RiskPoint[]>();
  for (const point of points) byUrl.set(point.target_url, [...(byUrl.get(point.target_url) ?? []), point]);

  return [...byUrl.entries()]
    .map(([url, list]) => {
      const latest = list[list.length - 1];
      return { url, points: list, latest, change: latest.risk - list[0].risk };
    })
    .sort((a, b) => Date.parse(b.latest.created_at) - Date.parse(a.latest.created_at));
}
