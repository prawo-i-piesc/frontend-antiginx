"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ChartMeta, FailedTestBars, RiskTrend, SeverityBars } from "@/app/components/charts/StatsCharts";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import WidgetCard from "@/app/components/widgets/WidgetCard";
import useApiQuery from "@/app/hooks/useApiQuery";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getFailedTests, getRiskTrend, getSeverity, type TestFailures } from "@/app/lib/statsApi";

/** Chart widgets show the last 30 days across every domain; the charts page has the rest. */
const WIDGET_DAYS = 30;
const WIDGET_TESTS = 6;

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
  const query = useApiQuery(`widget:risk:${WIDGET_DAYS}`, (signal) => getRiskTrend({ days: WIDGET_DAYS }, signal));

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

export function SeverityWidget() {
  const { t } = useI18n();
  const query = useApiQuery(`widget:severity:${WIDGET_DAYS}`, (signal) => getSeverity({ days: WIDGET_DAYS }, signal));

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
  queryKey,
  load,
  action,
}: {
  title: string;
  queryKey: string;
  load: (params: { days: number; limit: number }, signal: AbortSignal) => Promise<TestFailures[]>;
  action?: ReactNode;
}) {
  const query = useApiQuery(`${queryKey}:${WIDGET_DAYS}`, (signal) =>
    load({ days: WIDGET_DAYS, limit: WIDGET_TESTS }, signal),
  );

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
      queryKey="widget:tests"
      load={getFailedTests}
      action={<ChartsLink />}
    />
  );
}
