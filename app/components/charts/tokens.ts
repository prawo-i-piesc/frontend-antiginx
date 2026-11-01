import type { SeverityLevel } from "@/app/lib/api";

/**
 * What every chart is drawn with, so the charts page, the dashboard widgets
 * and the admin overview read as one system.
 *
 * Colours are CSS variables defined per theme in app/globals.css: an SVG
 * attribute takes var() like any CSS colour, so a chart follows the theme
 * without re-rendering and the server renders the right colours too. Text
 * never wears a series colour; it stays in the interface's own zinc ink.
 */
export const VIZ = {
  /** The single hue of a one-series chart. */
  accent: "var(--viz-accent)",
  /** The second series of a two-series chart, after the accent. */
  series2: "var(--viz-series-2)",
  /** One ordered ramp: the further from the card, the more severe. */
  severity: {
    CRITICAL: "var(--viz-severity-critical)",
    HIGH: "var(--viz-severity-high)",
    MEDIUM: "var(--viz-severity-medium)",
    LOW: "var(--viz-severity-low)",
    INFO: "var(--viz-severity-info)",
  } satisfies Record<SeverityLevel, string>,
  /** Solid hairlines behind the data; never dashed. */
  grid: "var(--viz-grid)",
  /** Tick labels: zinc-600 / zinc-400, above 4.5:1 on either card. */
  axis: "var(--viz-axis)",
  /** The empty part of a bar's lane. */
  track: "var(--viz-track)",
  /** The card colour, drawn around a marker so it stands off the line. */
  ring: "var(--viz-ring)",
} as const;

/** Mark geometry in px. */
export const MARK = {
  line: 2,
  /** Marker radius: 8px across. */
  dot: 4,
  activeDot: 5,
  ring: 2,
} as const;

export const AXIS_FONT_SIZE = 11;

/** A risk score is 0–100; the axis marks the quarters. */
export const RISK_TICKS = [0, 25, 50, 75, 100];

/** Percentages share the risk score's quarters. */
export const PERCENT_TICKS = RISK_TICKS;
