"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AXIS_FONT_SIZE, MARK, VIZ } from "@/app/components/charts/tokens";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { MetricPoint } from "@/app/lib/systemApi";

export interface MetricSeries {
  key: string;
  label: string;
  /** A VIZ token: the accent first, series2 second. */
  color: string;
  points: readonly MetricPoint[];
}

type Row = { t: number } & Record<string, number>;

/** Tick steps in seconds, from a fresh history of a few minutes to the full half hour. */
const TICK_STEPS = [60, 120, 300, 600, 900];
const MAX_TICKS = 6;

/** Whole-minute ticks, as many as fit without crowding. */
function timeTicks(first: number, last: number): number[] {
  const step = TICK_STEPS.find((candidate) => (last - first) / candidate <= MAX_TICKS) ?? TICK_STEPS[TICK_STEPS.length - 1];
  const ticks: number[] = [];
  for (let tick = Math.ceil(first / step) * step; tick <= last; tick += step) ticks.push(tick);
  return ticks;
}

/**
 * A short live history: one or two 2px lines over time, a crosshair and a
 * tooltip with every series at that moment. Two series get a legend; the
 * caller names a single one in the card's heading.
 */
export default function MetricChart({
  series,
  format,
  domain,
  ticks,
  height = 180,
  fill = false,
  axisWidth = 40,
}: {
  series: readonly MetricSeries[];
  /** For the y axis and the tooltip. */
  format: (value: number) => string;
  /** Fixed for percentages; left to the data for rates. */
  domain?: [number, number];
  ticks?: number[];
  /** The fixed height, or with `fill` the least the chart shrinks to. */
  height?: number;
  /** Take all the height the card gives, as a widget does in a tall cell. */
  fill?: boolean;
  axisWidth?: number;
}) {
  const { t, locale } = useI18n();
  const clock = useMemo(
    () => new Intl.DateTimeFormat(INTL_LOCALES[locale], { hour: "2-digit", minute: "2-digit" }),
    [locale],
  );

  // One row per moment, every series as a column, so the tooltip shows them together.
  // About sixty points a series: cheaper to rebuild than to memoise on a new array each poll.
  const byTime = new Map<number, Row>();
  for (const line of series) {
    for (const point of line.points) {
      const row = byTime.get(point.t) ?? ({ t: point.t } as Row);
      row[line.key] = point.v;
      byTime.set(point.t, row);
    }
  }
  const rows = [...byTime.values()].sort((a, b) => a.t - b.t);

  const times = rows.map((row) => row.t);
  const first = times[0] ?? 0;
  const last = times[times.length - 1] ?? 0;
  const xTicks = timeTicks(first, last);

  // The lines in words: where each series is now, and its peak in the window.
  const summary = series
    .filter((line) => line.points.length > 0)
    .map((line) =>
      t.charts.metric.summary(
        line.label,
        format(line.points[line.points.length - 1].v),
        format(Math.max(...line.points.map((point) => point.v))),
      ),
    )
    .join(" ");

  return (
    <div className={fill ? "flex flex-1 flex-col" : undefined}>
      <p className="sr-only">{summary}</p>
      {series.length > 1 ? (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-700 dark:text-zinc-300" aria-hidden="true">
          {series.map((line) => (
            <li key={line.key} className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: line.color }} />
              {line.label}
            </li>
          ))}
        </ul>
      ) : null}
      {/* Filling: absolutely placed, so the chart follows the card instead of sizing it. */}
      <div
        aria-hidden="true"
        className={fill ? "relative flex-1" : undefined}
        style={fill ? { minHeight: height } : { height }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 320, height }}
          className={fill ? "absolute inset-0" : undefined}
        >
          <LineChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
            <CartesianGrid stroke={VIZ.grid} vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[first, last]}
              ticks={xTicks}
              tickFormatter={(value: number) => clock.format(value * 1000)}
              tick={{ fill: VIZ.axis, fontSize: AXIS_FONT_SIZE }}
              tickLine={false}
              axisLine={{ stroke: VIZ.grid }}
              tickMargin={8}
            />
            <YAxis
              domain={domain ?? [0, "auto"]}
              ticks={ticks}
              tickFormatter={format}
              tick={{ fill: VIZ.axis, fontSize: AXIS_FONT_SIZE }}
              tickLine={false}
              axisLine={false}
              width={axisWidth}
            />
            <Tooltip
              cursor={{ stroke: VIZ.axis, strokeWidth: 1 }}
              isAnimationActive={false}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Row | undefined;
                if (!active || !row) return null;
                return (
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-zinc-600 dark:text-zinc-400">{clock.format(row.t * 1000)}</p>
                    {series.map((line) =>
                      row[line.key] === undefined ? null : (
                        <p key={line.key} className="mt-1 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                          <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ backgroundColor: line.color }} />
                          {line.label}
                          <span className="ml-auto pl-3 font-semibold">{format(row[line.key])}</span>
                        </p>
                      ),
                    )}
                  </div>
                );
              }}
            />
            {series.map((line) => (
              <Line
                key={line.key}
                type="linear"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={MARK.line}
                dot={false}
                activeDot={{ r: MARK.activeDot, fill: line.color, stroke: VIZ.ring, strokeWidth: MARK.ring }}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
