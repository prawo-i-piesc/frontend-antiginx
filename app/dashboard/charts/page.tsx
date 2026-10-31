"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import DashboardShell from "@/app/components/layout/DashboardShell";
import PageHeader from "@/app/components/layout/PageHeader";
import Dropdown from "@/app/components/ui/Dropdown";
import PagePending from "@/app/components/layout/PagePending";
import { SURFACE } from "@/app/components/ui/surface";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { LoadFailure, TableMessage } from "@/app/components/ui/table";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import { ApiRequestError, calculateThreatLevel, getUserScans, type UserScanResponse } from "@/app/lib/api";
import { useTheme } from "@/app/providers/ThemeProvider";

type ScanPoint = {
  url: string;
  createdAt: string;
  threat: number;
};

/** What the person can do about a failed request: check the connection, or just retry. */
type LoadError = "network" | "other";

/** Tagged with the request it answers, so "loading" is simply "not answered yet". */
type ScanHistory = { request: number; points: ScanPoint[]; error: LoadError | null };

// red-500: at least 3:1 against the card in both themes.
const LINE_COLOR = "#ef4444";

function toPoint(scan: UserScanResponse): ScanPoint {
  return {
    url: scan.target_url,
    createdAt: scan.created_at,
    threat: calculateThreatLevel(scan.results || []),
  };
}

function loadErrorOf(error: unknown): LoadError {
  if (error instanceof ApiRequestError) return error.code === "NETWORK_ERROR" ? "network" : "other";
  // fetch() rejects with a TypeError when the network is down.
  return error instanceof TypeError ? "network" : "other";
}

export default function DashboardChartsPage() {
  const { t, locale, format } = useI18n();
  const { theme } = useTheme();
  const { authenticated, initialized } = useRequireAuth();

  const [request, setRequest] = useState(0);
  const [history, setHistory] = useState<ScanHistory | null>(null);
  const [selectedUrl, setSelectedUrl] = useState("");

  const selectId = useId();

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    getUserScans().then(
      (scans) => {
        if (!active) return;
        setHistory({
          request,
          points: scans.filter((scan) => scan.status === "COMPLETED").map(toPoint),
          error: null,
        });
      },
      (error: unknown) => {
        if (!active) return;
        console.error("Failed to load scans for the charts:", error);
        setHistory({ request, points: [], error: loadErrorOf(error) });
      },
    );

    return () => {
      active = false;
    };
  }, [authenticated, request]);

  const isLoading = history?.request !== request;
  const loadError = isLoading ? null : (history?.error ?? null);
  const points = useMemo(() => history?.points ?? [], [history]);

  // Domains for the dropdown, in the order the scans arrived.
  const uniqueUrls = useMemo(() => Array.from(new Set(points.map((point) => point.url))), [points]);
  const currentUrl = uniqueUrls.includes(selectedUrl) ? selectedUrl : (uniqueUrls[0] ?? "");

  // The selected domain's threat level, oldest scan first.
  const urlHistory = useMemo(
    () =>
      points
        .filter((point) => point.url === currentUrl)
        .sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0)),
    [points, currentUrl],
  );

  const percent = useMemo(
    () => new Intl.NumberFormat(INTL_LOCALES[locale], { style: "percent", maximumFractionDigits: 0 }),
    [locale],
  );

  if (!initialized || !authenticated) return <PagePending layout="chart" />;

  const formatThreat = (level: number) => percent.format(level / 100);

  let summary = "";
  if (urlHistory.length > 0) {
    const levels = urlHistory.map((point) => point.threat);
    const first = urlHistory[0];
    const last = urlHistory[urlHistory.length - 1];
    summary = `${t.charts.summary(
      currentUrl,
      urlHistory.length,
      format.date(first.createdAt),
      format.date(last.createdAt),
    )} ${t.charts.levels(
      formatThreat(last.threat),
      formatThreat(Math.max(...levels)),
      formatThreat(Math.min(...levels)),
    )}`;
  }

  const isDark = theme === "dark";
  // zinc-400 on the dark card, zinc-600 on the light one: tick labels stay above 4.5:1.
  const axisColor = isDark ? "#a1a1aa" : "#52525b";
  const gridColor = isDark ? "#27272a" : "#e4e4e7";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipText = isDark ? "#e4e4e7" : "#18181b";
  // The line's red-500 is too light for text on white; the value uses red-700 there.
  const tooltipValue = isDark ? "#f87171" : "#b91c1c";

  const hasData = !isLoading && !loadError && points.length > 0;

  return (
    <DashboardShell area="dashboard" activePage="charts">
      <div className="p-4 sm:p-6">
        <PageHeader title={t.charts.title} description={t.charts.subtitle} />

        {isLoading ? (
          // The chart card as it will be: the address picker, the heading, the plot.
          <SkeletonRegion className={`${SURFACE} p-4 sm:p-5`}>
            <Bone className="mb-2 h-3 w-36" />
            <Bone className="mb-5 h-12 w-full max-w-md rounded-xl" />
            <Bone className="mb-4 h-4 w-48" />
            <Bone className="h-72 w-full rounded-lg" />
          </SkeletonRegion>
        ) : loadError ? (
          <div className={SURFACE}>
            <LoadFailure
              error={loadError === "network" ? { kind: "network" } : { kind: "failed", message: t.common.genericError }}
              title={t.charts.loadError}
              onRetry={() => setRequest((previous) => previous + 1)}
            />
          </div>
        ) : points.length === 0 ? (
          <div className={SURFACE}>
            <TableMessage>{t.charts.empty}</TableMessage>
          </div>
        ) : null}

        {hasData && (
          <div className={`${SURFACE} p-4 sm:p-5`}>
            <div className="mb-5 max-w-md">
              <label
                htmlFor={selectId}
                className="block text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2"
              >
                {t.charts.domainFilter}
              </label>
              <Dropdown
                id={selectId}
                size="lg"
                icon="ri-global-line"
                className="w-full"
                value={currentUrl}
                options={uniqueUrls.map((url) => ({ value: url, label: url }))}
                onChange={setSelectedUrl}
              />
            </div>

            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t.charts.heading}</h2>

            {urlHistory.length < 1 ? (
              <p className="h-72 flex items-center justify-center text-sm text-zinc-600 dark:text-zinc-400">
                {t.charts.noScansForDomain}
              </p>
            ) : (
              <figure>
                {/* The chart's text alternative: a summary here and every value in the table below. */}
                <figcaption className="sr-only">{summary}</figcaption>

                <div className="h-72">
                  {/* accessibilityLayer is on by default: the chart takes focus and the arrow keys move between scans. */}
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={urlHistory}
                      margin={{ left: -20, right: 10 }}
                      title={t.charts.chartTitle(currentUrl)}
                      desc={t.charts.keyboardHint}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="createdAt"
                        stroke={axisColor}
                        tick={{ fill: axisColor }}
                        fontSize={11}
                        tickMargin={8}
                        tickFormatter={(value) => format.date(value)}
                      />
                      <YAxis
                        stroke={axisColor}
                        tick={{ fill: axisColor }}
                        fontSize={11}
                        domain={[0, 100]}
                        tickFormatter={(value) => formatThreat(Number(value))}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, borderRadius: "12px" }}
                        labelStyle={{ color: tooltipText }}
                        itemStyle={{ color: tooltipValue }}
                        separator=": "
                        labelFormatter={(label) => format.dateTime(String(label))}
                        formatter={(value) => [formatThreat(Number(value)), t.charts.threatLevel]}
                      />
                      <Line
                        type="linear"
                        dataKey="threat"
                        name={t.charts.threatLevel}
                        stroke={LINE_COLOR}
                        strokeWidth={2}
                        dot={{ r: 4, fill: LINE_COLOR }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* A table ignores width: 1px, so the wrapper does the hiding. */}
                <div className="sr-only">
                  <table>
                    <caption>{t.charts.tableCaption(currentUrl)}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{t.charts.scanDate}</th>
                        <th scope="col">{t.charts.threatLevel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urlHistory.map((point, index) => (
                        <tr key={`${point.createdAt}-${index}`}>
                          <td>{format.dateTime(point.createdAt)}</td>
                          <td>{formatThreat(point.threat)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
