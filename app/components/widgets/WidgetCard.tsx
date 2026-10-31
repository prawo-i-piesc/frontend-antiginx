"use client";

import { useId } from "react";

import { SURFACE } from "@/app/components/ui/surface";
import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * The frame of a dashboard widget: one surface, one heading size, one
 * spacing, whatever the widget holds.
 */
export default function WidgetCard({
  title,
  action,
  sample = false,
  children,
}: {
  title: string;
  /** A link or button on the right of the heading. */
  action?: React.ReactNode;
  /** The figures are made up until an endpoint reports them; the card says so. */
  sample?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={`${SURFACE} flex h-full flex-col p-5`}>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 id={headingId} className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          {sample ? (
            <span className="shrink-0 rounded-md border border-zinc-300 px-1.5 py-px text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              {t.widgets.sample}
            </span>
          ) : null}
        </div>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
