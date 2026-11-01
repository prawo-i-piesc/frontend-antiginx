"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import { displayUrl, RiskChange } from "@/app/components/charts/domain";
import Sparkline from "@/app/components/charts/Sparkline";
import { ChartMeta, FailedTestBars, RiskTrend, SeverityBars } from "@/app/components/charts/StatsCharts";
import { domainRows } from "@/app/components/charts/trend";
import { Bone, ROW_WIDTHS, SkeletonRegion } from "@/app/components/ui/Skeleton";
import WidgetCard from "@/app/components/widgets/WidgetCard";
import { createWidgetData } from "@/app/components/widgets/WidgetData";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getFailedTests, getRiskTrend, getSeverity, type RiskPoint, type TestFailures } from "@/app/lib/statsApi";

/** Chart widgets show the last 30 days across every domain; the charts page has the rest. */
const WIDGET_DAYS = 30;
const WIDGET_TESTS = 6;
const WIDGET_DOMAINS = 5;

/*
 * Each chart widget reads a shared source rather than fetching for itself, so
 * the copies a board draws as previews (dragging, the customize library) show
 * the same data without another request. Lazy: a source loads only while one
 * of its widgets is rendered.
 */

/** The window's completed scans, which the risk line and the domain list both draw from. */
export const RiskData = createWidgetData(
  `widget:risk:${WIDGET_DAYS}`,
  (signal) => getRiskTrend({ days: WIDGET_DAYS }, signal),
  { lazy: true },
);

export const SeverityData = createWidgetData(
  `widget:severity:${WIDGET_DAYS}`,
  (signal) => getSeverity({ days: WIDGET_DAYS }, signal),
  { lazy: true },
);

/** The account's most failed checks. */
export const UserTestsData = createWidgetData(
  `widget:tests:${WIDGET_DAYS}`,
  (signal) => getFailedTests({ days: WIDGET_DAYS, limit: WIDGET_TESTS }, signal),
  { lazy: true },
);

/** Something a chart widget can read: a shared source from createWidgetData. */
type Source<T> = { useData: () => { data?: T; loading: boolean; error: unknown } };

const MESSAGE = "flex flex-1 items-center justify-center py-6 text-center text-sm text-zinc-600 dark:text-zinc-400";

/** The heading row's right side: the period, and a link to the charts page. */
function ChartsLink() {
  const { t } = useI18n();
  return (
    <span className="flex shrink-0 items-center gap-3">
      {/* A phone's card has room for the title and the link, not the period as well. */}
      <span className="hidden sm:inline">
        <ChartMeta>{t.charts.widget.period}</ChartMeta>
      </span>
      <Link
        href="/dashboard/charts"
        className="inline-flex min-h-6 items-center text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
      >
        {t.charts.widget.more}
        <span className="sr-only"> {t.charts.widget.moreContext}</span>
      </Link>
    </span>
  );
}

/** Loading, failure and the chart, in one place for every chart widget. */
function ChartBody<T>({
  query,
  skeleton,
  children,
}: {
  query: { data?: T; loading: boolean; error: unknown };
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
}) {
  const { t } = useI18n();
  if (query.data !== undefined) {
    return (
      <div aria-busy={query.loading} className={`flex flex-1 flex-col ${query.loading ? "opacity-55" : ""}`}>
        {children(query.data)}
      </div>
    );
  }
  if (query.error) return <p className={MESSAGE}>{t.charts.loadError}</p>;
  return <SkeletonRegion className="flex-1">{skeleton}</SkeletonRegion>;
}

function BarsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row}>
          <Bone className="mb-1.5 h-3 w-24" />
          <Bone className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

export function RiskTrendWidget() {
  const { t } = useI18n();
  const query = RiskData.useData();

  return (
    <WidgetCard title={t.widgets.names.riskTrend} action={<ChartsLink />}>
      <ChartBody query={query} skeleton={<Bone className="h-56 w-full rounded-lg" />}>
        {(points) =>
          points.length === 0 ? (
            <p className={MESSAGE}>{t.charts.noScansInPeriod}</p>
          ) : (
            <RiskTrend points={points} days={WIDGET_DAYS} domain="" height={224} />
          )
        }
      </ChartBody>
    </WidgetCard>
  );
}

/**
 * The domains whose latest scan carries the most risk: where to look first.
 * Each opens the charts page on that domain.
 */
export function DomainRiskWidget() {
  const { t } = useI18n();
  const query = RiskData.useData();

  return (
    <WidgetCard title={t.widgets.names.domainRisk} action={<ChartsLink />}>
      <ChartBody
        query={query}
        skeleton={
          <div className="space-y-4 pt-2">
            {ROW_WIDTHS.slice(0, WIDGET_DOMAINS).map((width) => (
              <Bone key={width} className={`h-3 max-w-full ${width}`} />
            ))}
          </div>
        }
      >
        {(points) => <DomainRiskTable points={points} />}
      </ChartBody>
    </WidgetCard>
  );
}

function DomainRiskTable({ points }: { points: readonly RiskPoint[] }) {
  const { t } = useI18n();
  const copy = t.charts.domains;
  const rows = useMemo(
    () =>
      domainRows(points)
        .sort((a, b) => b.latest.risk - a.latest.risk)
        .slice(0, WIDGET_DOMAINS),
    [points],
  );

  if (rows.length === 0) return <p className={MESSAGE}>{t.charts.noScansInPeriod}</p>;

  const head = "pb-2 text-xs font-medium text-zinc-600 dark:text-zinc-400";
  const cell = "h-10 border-t border-zinc-100 dark:border-zinc-800/70";

  return (
    <table className="w-full text-left text-[13px]">
      <thead>
        <tr>
          <th scope="col" className={head}>
            {copy.columns.domain}
          </th>
          <th scope="col" className={`${head} hidden px-3 sm:table-cell`}>
            <span className="sr-only">{copy.columns.trend}</span>
          </th>
          <th scope="col" className={`${head} px-3 text-right`}>
            {copy.columns.risk}
          </th>
          <th scope="col" className={`${head} text-right`}>
            {copy.columns.change}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.url}>
            <td className={`${cell} w-full max-w-0`}>
              <Link
                href={`/dashboard/charts?days=${WIDGET_DAYS}&domain=${encodeURIComponent(row.url)}`}
                title={row.url}
                className="block truncate text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
              >
                {displayUrl(row.url)}
              </Link>
            </td>
            <td className={`${cell} hidden px-3 sm:table-cell`}>
              <Sparkline values={row.points.map((point) => point.risk)} />
            </td>
            <td className={`${cell} px-3 text-right font-medium text-zinc-900 tabular-nums dark:text-zinc-100`}>
              {row.latest.risk}
            </td>
            <td className={`${cell} text-right whitespace-nowrap text-zinc-700 tabular-nums dark:text-zinc-300`}>
              <RiskChange value={row.change} scans={row.points.length} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SeverityWidget() {
  const { t } = useI18n();
  const query = SeverityData.useData();

  return (
    <WidgetCard title={t.widgets.names.severity} action={<ChartsLink />}>
      <ChartBody query={query} skeleton={<BarsSkeleton rows={5} />}>
        {(breakdown) => <SeverityBars breakdown={breakdown} />}
      </ChartBody>
    </WidgetCard>
  );
}

/** The most failed checks, from the account's scans or, for the admin, the whole platform's. */
export function FailedTestsWidget({
  title,
  source,
  action,
}: {
  title: string;
  source: Source<TestFailures[]>;
  action?: ReactNode;
}) {
  const query = source.useData();

  return (
    <WidgetCard title={title} action={action}>
      <ChartBody query={query} skeleton={<BarsSkeleton rows={WIDGET_TESTS} />}>
        {(tests) => <FailedTestBars tests={tests} label={title} />}
      </ChartBody>
    </WidgetCard>
  );
}

export function UserFailedTestsWidget() {
  const { t } = useI18n();
  return (
    <FailedTestsWidget
      title={t.widgets.names.topThreats}
      source={UserTestsData}
      action={<ChartsLink />}
    />
  );
}
