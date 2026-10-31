"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";

import ChartsSkeleton, { CHARTS_GRID, KPI_GRID } from "@/app/components/charts/ChartsSkeleton";
import Sparkline from "@/app/components/charts/Sparkline";
import {
  ChartMeta,
  FailedTestBars,
  RiskTrend,
  SeverityBars,
  useGranularityLabel,
  usePercent,
} from "@/app/components/charts/StatsCharts";
import { domainRows, granularityFor } from "@/app/components/charts/trend";
import StatsCard from "@/app/components/interface/StatsCard";
import DashboardShell from "@/app/components/layout/DashboardShell";
import PageHeader from "@/app/components/layout/PageHeader";
import PagePending from "@/app/components/layout/PagePending";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import Dropdown from "@/app/components/ui/Dropdown";
import Segmented from "@/app/components/ui/Segmented";
import { SkeletonRegion } from "@/app/components/ui/Skeleton";
import { SURFACE } from "@/app/components/ui/surface";
import {
  DATA,
  ICON_BUTTON,
  LoadFailure,
  PANEL,
  ROW,
  SCROLL_REGION,
  Stamp,
  TABLE,
  TD,
  TH,
  THEAD,
  TableMessage,
} from "@/app/components/ui/table";
import WidgetCard from "@/app/components/widgets/WidgetCard";
import useApiQuery from "@/app/hooks/useApiQuery";
import useQueryParams from "@/app/hooks/useQueryParams";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  PERIODS,
  getDomains,
  getFailedTests,
  getRiskTrend,
  getSeverity,
  getSummary,
  type Period,
  type RiskPoint,
  type StatsWindow,
} from "@/app/lib/statsApi";

const DEFAULT_PERIOD: Period = 90;
const TESTS_SHOWN = 8;

/** Everything the page shows for one window and domain, loaded together. */
async function loadStats(scope: StatsWindow, signal: AbortSignal) {
  const [summary, points, severity, tests] = await Promise.all([
    getSummary(scope, signal),
    getRiskTrend(scope, signal),
    getSeverity(scope, signal),
    getFailedTests({ ...scope, limit: TESTS_SHOWN }, signal),
  ]);
  return { summary, points, severity, tests };
}

const COLUMN = "contents @4xl:flex @4xl:flex-col @4xl:gap-4";

export default function DashboardChartsPage() {
  const { t } = useI18n();
  const { authenticated, initialized } = useRequireAuth();

  if (!initialized || !authenticated) return <PagePending layout="chart" />;

  return (
    <DashboardShell area="dashboard" activePage="charts">
      <div className="p-4 sm:p-6">
        <PageHeader title={t.charts.title} description={t.charts.subtitle} />
        {/* The filters live in the address, read through useSearchParams. */}
        <Suspense
          fallback={
            <SkeletonRegion>
              <ChartsSkeleton filters />
            </SkeletonRegion>
          }
        >
          <ChartsView />
        </Suspense>
      </div>
    </DashboardShell>
  );
}

function ChartsView() {
  const { t, format } = useI18n();
  const copy = t.charts;
  const percent = usePercent();
  const granularityLabel = useGranularityLabel();
  const [params, update] = useQueryParams();

  const days = PERIODS.find((period) => String(period) === params.get("days")) ?? DEFAULT_PERIOD;
  const domain = params.get("domain") ?? "";

  const domains = useApiQuery("stats:domains", getDomains);
  const stats = useApiQuery(`stats:${days}:${domain}`, (signal) => loadStats({ days, domain }, signal));

  const domainOptions = useMemo(() => {
    const urls = (domains.data ?? []).map((entry) => entry.target_url);
    // A linked domain the list does not know yet still shows as chosen.
    if (domain && !urls.includes(domain)) urls.unshift(domain);
    return [{ value: "", label: copy.filters.allDomains }, ...urls.map((url) => ({ value: url, label: url }))];
  }, [domains.data, domain, copy.filters.allDomains]);

  const filters = (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Dropdown
        label={copy.filters.domain}
        icon="ri-global-line"
        value={domain}
        options={domainOptions}
        onChange={(value) => update({ domain: value || null })}
        className="w-full sm:w-80"
      />
      <Segmented
        label={copy.filters.period}
        value={days}
        options={PERIODS.map((period) => ({ value: period, label: copy.filters.periods[period] }))}
        onChange={(value) => update({ days: value === DEFAULT_PERIOD ? null : value })}
      />
    </div>
  );

  const data = stats.data;

  if (!data) {
    if (stats.error) {
      return (
        <>
          {filters}
          <div className={SURFACE}>
            <LoadFailure error={stats.error} title={copy.loadError} onRetry={stats.reload} />
          </div>
        </>
      );
    }
    return (
      <>
        {filters}
        <SkeletonRegion>
          <ChartsSkeleton />
        </SkeletonRegion>
      </>
    );
  }

  const { summary, points, severity, tests } = data;
  const hasScans = points.length > 0;
  const noScansAtAll = !domain && domains.data?.length === 0;

  const failedTotal = summary.tests.failed;
  const latest = summary.risk.latest;
  const average = summary.risk.average;

  let latestHint: React.ReactNode = null;
  if (latest !== null && average !== null) {
    const difference = latest - average;
    latestHint =
      difference === 0 ? (
        copy.kpi.atAverage
      ) : (
        <span className="inline-flex items-center gap-1">
          <i className={difference < 0 ? "ri-arrow-down-line" : "ri-arrow-up-line"} aria-hidden="true" />
          {difference < 0 ? copy.kpi.belowAverage(-difference) : copy.kpi.aboveAverage(difference)}
        </span>
      );
  }

  return (
    <>
      {filters}

      {/* Refetching keeps the previous figures on screen, dimmed, rather than collapsing to a skeleton. */}
      <div
        aria-busy={stats.loading}
        className={`transition-opacity duration-200 ${stats.loading ? "pointer-events-none opacity-55" : ""}`}
      >
        {!hasScans ? (
          <div className={SURFACE}>
            <TableMessage>
              <p>{noScansAtAll ? copy.noScans : copy.noScansInPeriod}</p>
              <Link href="/dashboard/scanner" className={`${buttonClass("secondary", "sm")} mt-4`}>
                <i className="ri-add-line" aria-hidden="true" />
                {copy.newScan}
              </Link>
            </TableMessage>
          </div>
        ) : (
          <>
            <div className={`${KPI_GRID} mb-3 sm:mb-4`}>
              <StatsCard
                icon="ri-checkbox-circle-line"
                tone="cyan"
                label={copy.kpi.scans}
                value={points.length}
                hint={domain ? copy.kpi.since(format.date(points[0].created_at)) : copy.kpi.acrossDomains(summary.domains)}
              />
              <StatsCard
                icon="ri-pulse-line"
                tone="violet"
                label={copy.kpi.averageRisk}
                value={average}
                unit={copy.kpi.outOf}
                hint={copy.kpi.averageHint}
              />
              <StatsCard
                icon="ri-time-line"
                tone="sky"
                label={copy.kpi.latestRisk}
                value={latest}
                unit={copy.kpi.outOf}
                hint={latestHint}
              />
              <StatsCard
                icon="ri-close-circle-line"
                tone="rose"
                label={copy.kpi.failedChecks}
                value={failedTotal}
                hint={copy.kpi.failedOf(
                  format.number(summary.tests.run),
                  percent.format(summary.tests.run ? failedTotal / summary.tests.run : 0),
                )}
              />
            </div>

            {/* Two columns that flow on their own, so no card stretches to its neighbour's height.
                On a narrow screen the columns dissolve and `order` interleaves the cards. */}
            <div className={CHARTS_GRID}>
              <div className={`${COLUMN} @4xl:col-span-2`}>
                <div className="order-1 min-w-0">
                  <WidgetCard
                    title={copy.risk.heading}
                    action={<ChartMeta>{granularityLabel(granularityFor(days, domain))}</ChartMeta>}
                  >
                    <RiskTrend points={points} days={days} domain={domain} height={280} />
                    <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">{copy.risk.footnote}</p>
                  </WidgetCard>
                </div>
                <div className="order-4 min-w-0">
                  {domain ? (
                    <ScansTable points={points} />
                  ) : (
                    <DomainsTable points={points} onSelect={(url) => update({ domain: url })} />
                  )}
                </div>
              </div>

              <div className={COLUMN}>
                <div className="order-2">
                  <WidgetCard title={copy.severity.heading}>
                    <SeverityBars breakdown={severity} />
                    <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                      {copy.severity.passed(format.number(severity.passed))}
                    </p>
                  </WidgetCard>
                </div>
                <div className="order-3">
                  <WidgetCard title={copy.tests.heading}>
                    <FailedTestBars tests={tests} label={copy.tests.heading} />
                  </WidgetCard>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function TableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className={`${PANEL} h-full`}>
      <h2 className="px-5 pt-5 pb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}

/** Latest risk against the first in the window; a single scan has nothing to compare. */
function Change({ value, scans }: { value: number; scans: number }) {
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

/** HTTPS is the norm and only takes room; a plain-HTTP target keeps its scheme, which matters. */
function displayUrl(url: string): string {
  return url.startsWith("https://") ? url.slice("https://".length) : url;
}

/** Each domain's risk in the window; choosing one filters the page to it. */
function DomainsTable({ points, onSelect }: { points: readonly RiskPoint[]; onSelect: (url: string) => void }) {
  const { t } = useI18n();
  const copy = t.charts.domains;
  const rows = useMemo(() => domainRows(points), [points]);

  return (
    <TableCard title={copy.heading}>
      <div className={SCROLL_REGION}>
        <table className={TABLE}>
          <thead className={THEAD}>
            <tr>
              <th scope="col" className={`${TH} pl-5`}>
                {copy.columns.domain}
              </th>
              <th scope="col" className={`${TH} text-right`}>
                {copy.columns.scans}
              </th>
              <th scope="col" className={TH}>
                {copy.columns.last}
              </th>
              <th scope="col" className={`${TH} text-right`}>
                {copy.columns.risk}
              </th>
              <th scope="col" className={`${TH} pr-5 text-right @6xl:pr-3`}>
                {copy.columns.change}
              </th>
              {/* A picture of the risk column, so it gives way first when the table is narrow. */}
              <th scope="col" className={`${TH} hidden pr-5 @6xl:table-cell`}>
                <span className="sr-only">{copy.columns.trend}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.url} className={ROW}>
                <td className={`${TD} max-w-44 pl-5 sm:max-w-72`}>
                  <button
                    type="button"
                    onClick={() => onSelect(row.url)}
                    title={copy.filter(row.url)}
                    className="block max-w-full cursor-pointer truncate text-left text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                  >
                    {displayUrl(row.url)}
                  </button>
                </td>
                <td className={`${TD} ${DATA} text-right`}>{row.points.length}</td>
                <td className={TD}>
                  <Stamp value={row.latest.created_at} />
                </td>
                <td className={`${TD} ${DATA} text-right font-medium`}>{row.latest.risk}</td>
                <td className={`${TD} ${DATA} pr-5 text-right text-zinc-700 @6xl:pr-3 dark:text-zinc-300`}>
                  <Change value={row.change} scans={row.points.length} />
                </td>
                <td className={`${TD} hidden pr-5 @6xl:table-cell`}>
                  <Sparkline values={row.points.map((point) => point.risk)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}

/** One domain's scans, newest first: the risk line as a table, with a way into each scan. */
function ScansTable({ points }: { points: readonly RiskPoint[] }) {
  const { t } = useI18n();
  const copy = t.charts.scans;
  const rows = useMemo(() => [...points].reverse(), [points]);

  return (
    <TableCard title={copy.heading}>
      <div className={`${SCROLL_REGION} max-h-[26rem] overflow-y-auto`}>
        <table className={TABLE}>
          <thead className={`${THEAD} sticky top-0`}>
            <tr>
              <th scope="col" className={`${TH} pl-5`}>
                {copy.columns.date}
              </th>
              <th scope="col" className={`${TH} text-right`}>
                {copy.columns.checks}
              </th>
              <th scope="col" className={`${TH} text-right`}>
                {copy.columns.failed}
              </th>
              <th scope="col" className={`${TH} text-right`}>
                {copy.columns.risk}
              </th>
              <th scope="col" className={`${TH} w-12 pr-5`}>
                <span className="sr-only">{copy.open}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((point) => (
              <tr key={point.scan_id} className={ROW}>
                <td className={`${TD} pl-5`}>
                  <Stamp value={point.created_at} />
                </td>
                <td className={`${TD} ${DATA} text-right`}>{point.tests}</td>
                <td className={`${TD} ${DATA} text-right`}>{point.failed}</td>
                <td className={`${TD} ${DATA} text-right font-medium`}>{point.risk}</td>
                <td className={`${TD} pr-5 text-right`}>
                  <Link
                    href={`/dashboard/scanner?scan=${encodeURIComponent(point.scan_id)}`}
                    aria-label={copy.open}
                    title={copy.open}
                    className={`${ICON_BUTTON} h-7 w-7`}
                  >
                    <i className="ri-arrow-right-up-line" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}
