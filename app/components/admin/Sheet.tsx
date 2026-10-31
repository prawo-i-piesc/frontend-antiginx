"use client";

import Dialog from "@/app/components/ui/Dialog";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * The panel the admin inspectors slide in from the right edge: a modal
 * <dialog> at full height, with a sticky header and a body of key–value
 * sections underneath.
 */
export function SheetDialog({
  open,
  onClose,
  labelledBy,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  /** Room for a results table rather than a list of fields. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={labelledBy}
      closeOnBackdrop
      // m-0 ml-auto pins it to the right edge instead of the centre a modal
      // dialog gets by default. The animation replays each time it opens:
      // a closed <dialog> is display: none, and showing it starts it afresh.
      className={`m-0 ml-auto h-dvh max-h-dvh max-w-none overflow-y-auto border-l border-zinc-300 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/50 animate-sheet-in dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 ${
        wide ? "w-[min(46rem,100vw)]" : "w-[min(30rem,100vw)]"
      }`}
    >
      {children}
    </Dialog>
  );
}

export function SheetLayout({
  titleId,
  title,
  subtitle,
  busy = false,
  onClose,
  children,
}: {
  titleId: string;
  title: string;
  subtitle: string;
  busy?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400" title={subtitle}>
            {subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="-m-1 cursor-pointer rounded-lg p-1 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <i className="ri-close-line text-xl" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-6 px-5 py-5" aria-busy={busy || undefined}>
        {children}
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </h3>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <dl className="mt-2 divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {children}
      </dl>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 px-3 py-1.5">
      <dt className="shrink-0 text-xs text-zinc-600 dark:text-zinc-400">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] tabular-nums text-zinc-900 dark:text-zinc-100">{children}</dd>
    </div>
  );
}

/** A value that is not there: a dash on screen, words for a screen reader. */
export function Empty() {
  const { t } = useI18n();
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">{t.table.noValue}</span>
    </>
  );
}

/** Sections of label–value rows, the shape of an inspector before its data arrives. */
export function SheetSkeleton({ sections = [5, 7, 2] }: { sections?: number[] }) {
  return (
    <SkeletonRegion className="space-y-6">
      {sections.map((rows, section) => (
        <div key={section}>
          <Bone className="h-3.5 w-28" />
          <div className="mt-2 divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {Array.from({ length: rows }, (_, row) => (
              <div key={row} className="flex min-h-10 items-center justify-between gap-4 px-3 py-1.5">
                <Bone className="h-3 w-24" />
                <Bone className={`h-3 ${row % 2 ? "w-20" : "w-32"}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}
