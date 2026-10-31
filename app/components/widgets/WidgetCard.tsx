"use client";

import { useId } from "react";

import { SURFACE } from "@/app/components/ui/surface";

/**
 * The frame of a dashboard widget: one surface, one heading size, one
 * spacing, whatever the widget holds.
 */
export default function WidgetCard({
  title,
  action,
  children,
}: {
  title: string;
  /** A link, button or note on the right of the heading. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={`${SURFACE} flex h-full flex-col p-5`}>
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <h2 id={headingId} className="min-w-0 truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
