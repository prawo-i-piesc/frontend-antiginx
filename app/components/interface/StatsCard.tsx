"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";

interface StatsCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  /** A number is formatted for the interface language; null means there is nothing to show. */
  value: string | number | null;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
    color: string;
  };
  /** The value is still on its way. */
  loading?: boolean;
}

export default function StatsCard({
  icon,
  iconColor,
  iconBgColor,
  value,
  label,
  trend,
  loading = false,
}: StatsCardProps) {
  const { t, format } = useI18n();

  let shown: ReactNode;
  if (loading) {
    shown = (
      <>
        <span aria-hidden="true">…</span>
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
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 border border-zinc-300 dark:border-zinc-800/30 p-4 sm:p-6 hover:border-zinc-500 dark:hover:border-zinc-500/30 hover:bg-zinc-200 dark:hover:bg-zinc-900/30 transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBgColor}`} aria-hidden="true">
          <i className={`${icon} ${iconColor} text-xl`} aria-hidden="true"></i>
        </div>
      </div>
      {/* The label comes first in the DOM so it is read before the number; order-* puts the number on top. */}
      <dl className="flex flex-col">
        <dt className="order-2 text-sm text-zinc-600 dark:text-zinc-400 mb-0 sm:mb-2">{label}</dt>
        <dd className="order-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{shown}</dd>
        {trend ? (
          <dd className="order-3">
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
