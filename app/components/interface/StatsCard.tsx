"use client";

import type { ReactNode } from "react";

import { SURFACE, TONES, type Tone } from "@/app/components/ui/surface";
import { useI18n } from "@/app/i18n/I18nProvider";

interface StatsCardProps {
  icon: string;
  tone: Tone;
  /** A number is formatted for the interface language; null means there is nothing to show. */
  value: string | number | null;
  label: string;
  /** Muted text right after the figure, such as "/ 100". */
  unit?: string;
  /** A line of context under the figure. */
  hint?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    color: string;
  };
  /** The value is still on its way. */
  loading?: boolean;
}

/** One figure under its label. Not interactive, so it has no hover state. */
export default function StatsCard({ icon, tone, value, label, unit, hint, trend, loading = false }: StatsCardProps) {
  const { t, format } = useI18n();

  let shown: ReactNode;
  if (loading) {
    shown = (
      <>
        <span aria-hidden="true" className="bone inline-block h-8 w-12 rounded-md bg-zinc-200 align-middle dark:bg-zinc-800"></span>
        <span className="sr-only">{t.common.loading}</span>
      </>
    );
  } else if (value === null) {
    shown = (
      <>
        <span aria-hidden="true">—</span>
        <span className="sr-only">{t.widgets.noData}</span>
      </>
    );
  } else {
    shown = typeof value === "number" ? format.number(value) : value;
  }

  return (
    <div className={`${SURFACE} flex h-full flex-col p-5`}>
      <dl className="flex flex-col gap-3">
        <dt className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <i className={`${icon} text-base leading-none ${TONES[tone].icon}`} aria-hidden="true"></i>
          {label}
        </dt>
        {/* Proportional figures: a lone headline number reads better without tabular spacing. */}
        <dd className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {shown}
          {unit && !loading && value !== null ? (
            // The space keeps "52 / 100" apart for screen readers; the margin does it on screen.
            <span className="ml-0.5 text-sm font-normal tracking-normal text-zinc-500 dark:text-zinc-400">{` ${unit}`}</span>
          ) : null}
        </dd>
        {hint ? <dd className="-mt-1 text-xs text-zinc-600 dark:text-zinc-400">{hint}</dd> : null}
        {trend ? (
          <dd>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend.color}`}>
              <i className={`ri-arrow-${trend.isPositive ? "up" : "down"}-line`} aria-hidden="true"></i>
              <span className="sr-only">{trend.isPositive ? t.widgets.trend.up : t.widgets.trend.down} </span>
              {trend.value}
            </span>
          </dd>
        ) : null}
      </dl>
    </div>
  );
}
