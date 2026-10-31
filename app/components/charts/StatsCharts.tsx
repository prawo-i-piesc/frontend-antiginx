"use client";

import { useMemo } from "react";

import BarList, { type BarDatum } from "@/app/components/charts/BarList";
import RiskTrendChart, { type TrendDatum } from "@/app/components/charts/RiskTrendChart";
import { useTestLabel } from "@/app/components/charts/testLabel";
import { VIZ } from "@/app/components/charts/tokens";
import { bucketPoints, granularityFor, type Granularity } from "@/app/components/charts/trend";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import { SEVERITY_LEVELS, type RiskPoint, type SeverityBreakdown, type TestFailures } from "@/app/lib/statsApi";

/**
 * The charts as the charts page and the dashboard widgets both show them:
 * statistics in, labelled marks and their text alternative out.
 */

export function usePercent() {
  const { locale } = useI18n();
  return useMemo(
    () => new Intl.NumberFormat(INTL_LOCALES[locale], { style: "percent", maximumFractionDigits: 0 }),
    [locale],
  );
}

/** A muted line in a card's heading row: what the figures are made of. */
export function ChartMeta({ children }: { children: React.ReactNode }) {
  return <span className="shrink-0 text-xs text-zinc-600 dark:text-zinc-400">{children}</span>;
}

/** How the line is drawn, in words: "Weekly average". */
export function useGranularityLabel() {
  const { t } = useI18n();
  return (granularity: Granularity) =>
    granularity === "scan" ? t.charts.risk.perScan : granularity === "day" ? t.charts.risk.daily : t.charts.risk.weekly;
}

/** Risk over time, with every point in a table for screen readers. */
export function RiskTrend({
  points,
  days,
  domain,
  height,
}: {
  points: readonly RiskPoint[];
  days: number;
  domain: string;
  height?: number;
}) {
  const { t, format } = useI18n();
  const copy = t.charts.risk;
  const granularityLabel = useGranularityLabel();
  const granularity = granularityFor(days, domain);

  const data = useMemo<TrendDatum[]>(() => {
    if (granularity === "scan") {
      return points.map((point) => ({
        key: point.scan_id,
        t: Date.parse(point.created_at),
        risk: point.risk,
        label: format.dateTime(point.created_at),
        detail: copy.scanDetail(point.failed, point.tests),
      }));
    }
    return bucketPoints(points, granularity).map((bucket) => ({
      key: String(bucket.start),
      t: bucket.start,
      risk: bucket.risk,
      label: granularity === "week" ? copy.week(format.date(bucket.start)) : format.date(bucket.start),
      detail: copy.bucketDetail(bucket.scans.length),
    }));
  }, [points, granularity, format, copy]);

  const title = copy.chartTitle(domain || t.charts.filters.allDomains);

  return (
    <figure>
      <RiskTrendChart data={data} title={title} valueLabel={copy.value} height={height} />
      {/* A table ignores width: 1px, so the wrapper does the hiding. */}
      <div className="sr-only">
        <table>
          <caption>
            {title}. {granularityLabel(granularity)}.
          </caption>
          <thead>
            <tr>
              <th scope="col">{copy.date}</th>
              <th scope="col">{copy.value}</th>
              <th scope="col">{t.charts.scans.heading}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((datum) => (
              <tr key={datum.key}>
                <th scope="row">{datum.label}</th>
                <td>{datum.risk}</td>
                <td>{datum.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Failed results per severity, most severe first, on the severity ramp. */
export function SeverityBars({ breakdown }: { breakdown: SeverityBreakdown }) {
  const { t, format } = useI18n();
  const percent = usePercent();

  const total = SEVERITY_LEVELS.reduce((sum, level) => sum + (breakdown.failed[level] ?? 0), 0);
  if (total === 0) return <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">{t.charts.severity.none}</p>;

  const data: BarDatum[] = SEVERITY_LEVELS.map((level) => {
    const count = breakdown.failed[level] ?? 0;
    const name = t.scan.severity[level];
    return {
      key: level,
      label: name,
      value: count,
      display: format.number(count),
      detail: t.charts.severity.detail(name, format.number(count), percent.format(count / total)),
      color: VIZ.severity[level],
    };
  });

  return <BarList data={data} label={t.charts.severity.heading} />;
}

/** The tests that fail most often, in one colour: the bars compare counts, not kinds. */
export function FailedTestBars({ tests, label }: { tests: readonly TestFailures[]; label: string }) {
  const { t, format } = useI18n();
  const percent = usePercent();
  const testLabel = useTestLabel();

  if (tests.length === 0) return <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">{t.charts.tests.none}</p>;

  const data: BarDatum[] = tests.map((test) => {
    const name = testLabel(test.test_name);
    return {
      key: test.test_name,
      label: name.short,
      title: name.full === name.short ? undefined : name.full,
      value: test.failures,
      display: `${format.number(test.failures)} / ${format.number(test.runs)}`,
      detail: t.charts.tests.detail(
        name.full,
        format.number(test.failures),
        format.number(test.runs),
        percent.format(test.runs ? test.failures / test.runs : 0),
      ),
      color: VIZ.accent,
    };
  });

  return <BarList data={data} label={label} />;
}
