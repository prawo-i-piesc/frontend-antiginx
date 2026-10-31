"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AXIS_FONT_SIZE, MARK, RISK_TICKS, VIZ } from "@/app/components/charts/tokens";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";

/** One point on the line: a scan, or the average of the scans in a day or week. */
export interface TrendDatum {
  /** The scan's id, or the bucket's start: two scans can share a timestamp. */
  key: string;
  /** Milliseconds since the epoch: the x axis is time, so uneven gaps stay uneven. */
  t: number;
  risk: number;
  /** The tooltip's heading: the date, or the week. */
  label: string;
  /** The tooltip's last line: what the point is made of. */
  detail: string;
}

const DAY = 86_400_000;

/** At most five evenly spaced ticks, one per distinct day. */
function timeTicks(min: number, max: number): number[] {
  if (max - min < DAY) return [min];
  const count = Math.min(5, Math.floor((max - min) / DAY) + 1);
  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1));
}

/** Marks on every point read well up to about a month of days; past that they crowd the line. */
const MAX_DOTS = 32;

function TrendTooltip({ datum, valueLabel }: { datum: TrendDatum; valueLabel: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-zinc-600 dark:text-zinc-400">{datum.label}</p>
      <p className="mt-1 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
        <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ backgroundColor: VIZ.accent }} />
        {valueLabel}
        <span className="ml-auto pl-3 font-semibold">{datum.risk}</span>
      </p>
      <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{datum.detail}</p>
    </div>
  );
}

/**
 * Risk over time: one 2px line on a 0–100 scale, solid hairline grid, a
 * crosshair and tooltip on hover. The caller provides the text alternative —
 * a table of the same points — next to it.
 */
export default function RiskTrendChart({
  data,
  title,
  valueLabel,
  height = 260,
}: {
  data: readonly TrendDatum[];
  /** The chart's accessible name. */
  title: string;
  /** The measure, as the tooltip names it. */
  valueLabel: string;
  height?: number;
}) {
  const { t, locale } = useI18n();

  const tickDate = useMemo(
    () => new Intl.DateTimeFormat(INTL_LOCALES[locale], { day: "numeric", month: "short" }),
    [locale],
  );

  const times = data.map((datum) => datum.t);
  const min = Math.min(...times);
  const max = Math.max(...times);
  // A single point sits in the middle of a three-day span rather than on a zero-width axis.
  const domain: [number, number] = max - min < DAY ? [min - DAY, max + DAY] : [min, max];
  const ticks = timeTicks(domain[0], domain[1]);
  const dots = data.length <= MAX_DOTS;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height }}>
        {/* accessibilityLayer is on by default: the chart takes focus and the arrow keys move between points. */}
        <LineChart data={data as TrendDatum[]} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} title={title} desc={t.charts.keyboardHint}>
          <CartesianGrid stroke={VIZ.grid} vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={domain}
            ticks={ticks}
            tickFormatter={(value: number) => tickDate.format(value)}
            tick={{ fill: VIZ.axis, fontSize: AXIS_FONT_SIZE }}
            tickLine={false}
            axisLine={{ stroke: VIZ.grid }}
            tickMargin={8}
            padding={{ left: 10, right: 10 }}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            ticks={RISK_TICKS}
            tick={{ fill: VIZ.axis, fontSize: AXIS_FONT_SIZE }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: VIZ.axis, strokeWidth: 1 }}
            isAnimationActive={false}
            content={({ active, payload }) => {
              const datum = payload?.[0]?.payload as TrendDatum | undefined;
              return active && datum ? <TrendTooltip datum={datum} valueLabel={valueLabel} /> : null;
            }}
          />
          <Line
            type="linear"
            dataKey="risk"
            name={valueLabel}
            stroke={VIZ.accent}
            strokeWidth={MARK.line}
            dot={dots ? { r: MARK.dot, fill: VIZ.accent, stroke: VIZ.ring, strokeWidth: MARK.ring } : false}
            activeDot={{ r: MARK.activeDot, fill: VIZ.accent, stroke: VIZ.ring, strokeWidth: MARK.ring }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
