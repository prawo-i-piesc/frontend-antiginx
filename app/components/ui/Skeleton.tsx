"use client";

import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Placeholders in the shape of what is loading, so the page keeps its layout
 * instead of swapping a spinner for content. The shapes are decorative; the
 * region around them is announced once as "Loading…".
 */

/** One grey bar. Size and shape come from the caller. */
export function Bone({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800/80 ${className}`}
    />
  );
}

export function SkeletonRegion({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div role="status" className={className}>
      <span className="sr-only">{t.common.loading}</span>
      {children}
    </div>
  );
}

/** Widths that vary from row to row, so a list of placeholders does not look like a barcode. */
export const ROW_WIDTHS = ["w-56", "w-40", "w-64", "w-48", "w-36", "w-60"] as const;
