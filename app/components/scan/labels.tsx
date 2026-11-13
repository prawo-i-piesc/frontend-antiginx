"use client";

import { useI18n } from "@/app/i18n/I18nProvider";
import { riskBand, type RiskBand } from "@/app/lib/risk";
import type { RowState } from "@/app/lib/scanRows";

/**
 * How a scan's outcome reads everywhere: words in the colour of their weight,
 * with an icon or a number beside them, so colour never carries it alone.
 */

/** Each weight in its colour from globals.css, the same the charts draw it in. */
export const SEVERITY_TONES: Record<string, string> = {
  CRITICAL: "text-severity-critical",
  HIGH: "text-severity-high",
  MEDIUM: "text-severity-medium",
  LOW: "text-severity-low",
  INFO: "text-severity-info",
};

const RISK_TONES: Record<RiskBand, string> = {
  none: "text-emerald-700 dark:text-emerald-400",
  low: SEVERITY_TONES.LOW,
  medium: SEVERITY_TONES.MEDIUM,
  high: SEVERITY_TONES.HIGH,
  critical: SEVERITY_TONES.CRITICAL,
};

export function SeverityLabel({ value }: { value: string }) {
  const { t } = useI18n();
  const label = (t.scan.severity as Record<string, string | undefined>)[value] ?? value;
  return (
    <span className={`text-xs font-medium ${SEVERITY_TONES[value] ?? "text-zinc-600 dark:text-zinc-400"}`}>{label}</span>
  );
}

const VERDICT_STYLES: Record<RowState, { icon: string; tone: string }> = {
  passed: { icon: "ri-check-line", tone: "text-emerald-700 dark:text-emerald-400" },
  failed: { icon: "ri-close-line", tone: "text-rose-700 dark:text-rose-400" },
  notice: { icon: "ri-information-line", tone: "text-sky-700 dark:text-sky-400" },
  pending: { icon: "ri-time-line", tone: "text-zinc-500 dark:text-zinc-500" },
  missing: { icon: "ri-subtract-line", tone: "text-zinc-600 dark:text-zinc-400" },
};

export function Verdict({ state, compact = false }: { state: RowState; compact?: boolean }) {
  const { t } = useI18n();
  const { icon, tone } = VERDICT_STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${tone}`}>
      <i className={icon} aria-hidden="true" />
      {/* A phone has room for the icon; the word stays for screen readers. */}
      <span className={compact ? "max-sm:sr-only" : undefined}>{t.scan.verdict[state]}</span>
    </span>
  );
}

/** The band in a word and the score beside it; the thresholds are on hover. */
export function RiskLabel({ score }: { score: number }) {
  const { t, format } = useI18n();
  const band = riskBand(score);
  return (
    <span title={t.scan.riskLegend} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className={`font-medium ${RISK_TONES[band]}`}>{t.scan.riskBands[band]}</span>
      {score > 0 ? (
        <span className="text-xs text-zinc-600 tabular-nums dark:text-zinc-400">{format.number(score)}</span>
      ) : null}
    </span>
  );
}
