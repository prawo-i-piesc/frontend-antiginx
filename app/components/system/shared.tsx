"use client";

import { useMemo } from "react";

import { VIZ } from "@/app/components/charts/tokens";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { Messages } from "@/app/i18n/messages/en";
import type { CheckStatus, MetricPoint, SystemNode, SystemStatus } from "@/app/lib/systemApi";

/**
 * What the System page and the admin overview's system widgets share: how
 * figures are written, how a probe's state and a usage share look, and what
 * to say when there are no metrics.
 */

/** How often both reload the system status. */
export const SYSTEM_REFRESH_MS = 10_000;

/** The state in words, coloured by outcome; the word carries it on its own. */
export const STATUS_TONES: Record<CheckStatus, string> = {
  up: "text-emerald-700 dark:text-emerald-400",
  down: "text-rose-700 dark:text-rose-400",
  degraded: "text-amber-700 dark:text-amber-400",
  disabled: "text-zinc-600 dark:text-zinc-400",
};

export const MUTED = "text-xs text-zinc-600 dark:text-zinc-400";

const BINARY_UNITS = ["B", "KiB", "MiB", "GiB", "TiB"];

/** Number formats for the view, in the interface language. */
export function useUnits() {
  const { locale } = useI18n();
  return useMemo(() => {
    const tag = INTL_LOCALES[locale];
    const one = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
    const two = new Intl.NumberFormat(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const percent = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 0 });
    const clock = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const days = new Intl.NumberFormat(tag, { style: "unit", unit: "day", unitDisplay: "long" });
    const hours = new Intl.NumberFormat(tag, { style: "unit", unit: "hour", unitDisplay: "short" });
    const minutes = new Intl.NumberFormat(tag, { style: "unit", unit: "minute", unitDisplay: "short" });

    /** Binary units, as Kubernetes and the kernel count memory. */
    const bytes = (value: number) => {
      let unit = 0;
      while (value >= 1024 && unit < BINARY_UNITS.length - 1) {
        value /= 1024;
        unit += 1;
      }
      return `${one.format(value)} ${BINARY_UNITS[unit]}`;
    };

    return {
      bytes,
      rate: (value: number) => `${bytes(value)}/s`,
      percent: (value: number) => percent.format(value / 100),
      load: (values: readonly number[]) => values.map((value) => two.format(value)).join(" "),
      clock: (value: string | number) => clock.format(new Date(value)),
      /** Pod CPU in Kubernetes millicores: 0.05 cores is 50m. */
      millicores: (cores: number) => `${Math.round(cores * 1000)}m`,
      duration: (seconds: number) => {
        const d = Math.floor(seconds / 86_400);
        const h = Math.floor((seconds % 86_400) / 3600);
        if (d > 0) return h > 0 ? `${days.format(d)} ${hours.format(h)}` : days.format(d);
        if (h > 0) return hours.format(h);
        return minutes.format(Math.max(1, Math.floor(seconds / 60)));
      },
    };
  }, [locale]);
}

export type Units = ReturnType<typeof useUnits>;

/**
 * Ticks for a bytes-per-second axis on whole binary steps (0, 256 KiB/s,
 * 512 KiB/s…), so the labels read as round numbers in the unit they are
 * written in. The last tick is the axis's top.
 */
export function rateTicks(series: readonly (readonly MetricPoint[])[]): number[] {
  const peak = Math.max(0, ...series.flatMap((points) => points.map((point) => point.v)));
  if (peak === 0) return [0, 1024];
  const unit = 1024 ** Math.min(Math.floor(Math.log(peak) / Math.log(1024)), BINARY_UNITS.length - 1);
  const scaled = peak / unit;
  const step = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512].find((candidate) => scaled / candidate <= 4) ?? 1024;
  const ticks: number[] = [];
  for (let tick = 0; tick < scaled + step; tick += step) ticks.push(tick * unit);
  return ticks;
}

/** How full a node's memory and disk are, in percent; null where the total is unknown. */
export function nodeShares(node: SystemNode): { memory: number | null; disk: number | null } {
  return {
    memory: node.memory_total ? (node.memory_used / node.memory_total) * 100 : null,
    disk: node.disk_total ? (node.disk_used / node.disk_total) * 100 : null,
  };
}

/** Why there are no metrics: Prometheus is not configured, not answering, or its queries fail. */
export function metricsUnavailable(status: SystemStatus, copy: Messages["system"]): string {
  const prometheus = status.checks.find((check) => check.name === "prometheus");
  if (prometheus?.status === "disabled") return copy.prometheus.disabled;
  if (prometheus?.status === "degraded") return copy.prometheus.degraded;
  return copy.prometheus.down;
}

/** The empty part and the filled part of a usage bar. */
export function UsageBar({ share }: { share: number | null }) {
  return (
    <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: VIZ.track }}>
      {share !== null ? (
        <div
          className="bar-grow h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${Math.min(Math.max(share, 0), 100)}%`, backgroundColor: VIZ.accent }}
        />
      ) : null}
    </div>
  );
}

const FIGURE_SIZES = {
  /** The System page's cards. */
  lg: { label: "text-sm text-zinc-600 dark:text-zinc-400", value: "text-2xl" },
  /** The overview widget, four to a card. */
  md: { label: MUTED, value: "text-lg" },
} as const;

/** A figure with a thin usage bar under it: how full, at a glance. A term and its details in a <dl>. */
export function UsageFigure({
  label,
  value,
  share,
  detail,
  size,
  className = "",
}: {
  label: string;
  value: string;
  share: number | null;
  detail: string;
  size: keyof typeof FIGURE_SIZES;
  /** The group's own box, e.g. a card on the System page. */
  className?: string;
}) {
  const style = FIGURE_SIZES[size];
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className={style.label}>{label}</dt>
      <dd className={`mt-1 font-semibold text-zinc-900 dark:text-zinc-100 ${style.value}`}>{value}</dd>
      <dd className="mt-2">
        <UsageBar share={share} />
      </dd>
      <dd className={`${MUTED} mt-2 truncate`}>{detail || "\u00a0"}</dd>
    </div>
  );
}

/** Received in large, sent beneath it; the arrows show which is which, the words are for screen readers. */
export function NetworkFigure({
  node,
  units,
  size,
  className = "",
}: {
  node: SystemNode;
  units: Units;
  size: keyof typeof FIGURE_SIZES;
  className?: string;
}) {
  const { t } = useI18n();
  const copy = t.system.node;
  const style = FIGURE_SIZES[size];
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className={style.label}>{copy.network}</dt>
      <dd className={`mt-1 truncate font-semibold text-zinc-900 dark:text-zinc-100 ${style.value}`}>
        <i className="ri-arrow-down-line mr-1 text-sm text-zinc-500" aria-hidden="true" />
        {units.rate(node.network_rx)}
        <span className="sr-only"> {copy.received}</span>
      </dd>
      <dd className={`${MUTED} mt-2 truncate`}>
        <i className="ri-arrow-up-line mr-1" aria-hidden="true" />
        {units.rate(node.network_tx)}
        <span className="sr-only"> {copy.sent}</span>
      </dd>
    </div>
  );
}

/** Figures of one node, in the order both views list them; place them in a <dl>. */
export function NodeFigures({
  node,
  units,
  size,
  itemClassName,
}: {
  node: SystemNode;
  units: Units;
  size: keyof typeof FIGURE_SIZES;
  itemClassName?: string;
}) {
  const { t } = useI18n();
  const copy = t.system.node;
  const { memory, disk } = nodeShares(node);
  const full = size === "lg";

  return (
    <>
      <UsageFigure
        className={itemClassName}
        size={size}
        label={copy.cpu}
        value={units.percent(node.cpu)}
        share={node.cpu}
        detail={full ? `${copy.cores(node.cores)} · ${copy.load(units.load(node.load))}` : copy.cores(node.cores)}
      />
      <UsageFigure
        className={itemClassName}
        size={size}
        label={copy.memory}
        value={memory === null ? "—" : units.percent(memory)}
        share={memory}
        detail={full ? copy.of(units.bytes(node.memory_used), units.bytes(node.memory_total)) : units.bytes(node.memory_used)}
      />
      <UsageFigure
        className={itemClassName}
        size={size}
        label={copy.disk}
        value={disk === null ? "—" : units.percent(disk)}
        share={disk}
        detail={
          disk === null ? "" : full ? copy.of(units.bytes(node.disk_used), units.bytes(node.disk_total)) : units.bytes(node.disk_used)
        }
      />
      <NetworkFigure className={itemClassName} node={node} units={units} size={size} />
    </>
  );
}
