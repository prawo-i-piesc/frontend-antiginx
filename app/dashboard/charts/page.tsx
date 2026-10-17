"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import DashboardShell from "@/app/components/layout/DashboardShell";
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

  if (!initialized) return null;
  if (!authenticated) return null;

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
      <div className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.charts.title}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{t.charts.subtitle}</p>
          </div>
        </div>

        <div role="status">
          {isLoading && <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.charts.loading}</p>}
          {!isLoading && !loadError && points.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.charts.empty}</p>
          )}
        </div>

        <div role="alert">
          {loadError && (
            <p className="text-sm text-rose-700 dark:text-rose-400">
              {t.charts.loadError} {loadError === "network" ? t.common.networkError : t.common.genericError}
            </p>
          )}
        </div>
        {loadError && (
          <button
            type="button"
            onClick={() => setRequest((previous) => previous + 1)}
            className="mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/85 dark:bg-zinc-900/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t.common.retry}
          </button>
        )}

        {hasData && (
          <div className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 shadow-sm">
            <div className="mb-5 max-w-md">
              <label
                htmlFor={selectId}
                className="block text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2"
              >
                {t.charts.domainFilter}
              </label>
              <div className="relative">
                <i
                  className="ri-global-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 pointer-events-none"
                  aria-hidden="true"
                ></i>
                <select
                  id={selectId}
                  value={currentUrl}
                  onChange={(event) => setSelectedUrl(event.target.value)}
                  className="w-full h-12 pl-12 pr-10 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 focus:border-cyan-500/50 transition-all cursor-pointer appearance-none"
                >
                  {uniqueUrls.map((url) => (
                    <option key={url} value={url} className="bg-white dark:bg-zinc-950">
                      {url}
                    </option>
                  ))}
                </select>
                <i
                  className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 pointer-events-none"
                  aria-hidden="true"
                ></i>
              </div>
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

                <table className="sr-only">
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
              </figure>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
