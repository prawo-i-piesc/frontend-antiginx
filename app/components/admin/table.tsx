"use client";

import { useEffect, useRef } from "react";

import { BUTTON_QUIET } from "@/app/components/profile/ui";
import Pagination from "@/app/components/ui/Pagination";
import type { LoadError } from "@/app/hooks/useAdminQuery";
import { useI18n } from "@/app/i18n/I18nProvider";
import { PAGE_SIZES, type PageSize } from "@/app/lib/adminApi";
import type { ScanStatus } from "@/app/lib/api";
import { useToast } from "@/app/providers/ToastProvider";

/**
 * Building blocks of the admin tables: dense rows in the interface's own
 * typeface, with tabular figures so dates and counts line up column by
 * column. Only identifiers, which are read character by character, are set
 * in monospace.
 */

export const PANEL =
  "scroll-mt-4 overflow-hidden rounded-xl border border-zinc-300 bg-white/85 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30";
export const TOOLBAR =
  "flex flex-wrap items-center gap-3 border-b border-zinc-200 px-3 py-3 sm:px-4 dark:border-zinc-800";
/**
 * Lets a wide table scroll sideways inside the panel. Relative, so the
 * sr-only labels in its cells — absolutely positioned — are clipped with the
 * rest of the table instead of widening the whole page on a phone.
 */
export const SCROLL_REGION = "relative overflow-x-auto scrollbar-theme focus-visible:-outline-offset-2";
export const TABLE = "w-full border-collapse text-left text-[13px]";
export const THEAD = "border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60";
export const TH = "h-9 px-3 text-xs font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-400";
export const ROW =
  "border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30";
export const TD = "h-11 px-3 whitespace-nowrap text-zinc-800 dark:text-zinc-200";
/** Dates, counts and other values that should line up in a column. */
export const DATA = "tabular-nums";
/** IDs and test names: read character by character, so monospaced. */
export const CODE = "font-code text-xs";
/** No size of its own: add h-8 w-8 or similar where it is used. */
export const ICON_BUTTON =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
const CONTROL_SKIN =
  "rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-900 transition-colors dark:border-zinc-700/70 dark:bg-zinc-950/50 dark:text-zinc-100";
export const CONTROL = `h-9 text-sm ${CONTROL_SKIN}`;

/**
 * A select with its own chevron. The native one sits wherever the browser
 * puts it, which in a control this small is right against the border.
 */
export function Select({
  compact = false,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { compact?: boolean }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <select
        {...props}
        className={`${compact ? "h-8 text-xs" : "h-9 text-sm"} ${CONTROL_SKIN} w-full cursor-pointer appearance-none pl-3 pr-8`}
      >
        {children}
      </select>
      <i
        className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-base leading-none text-zinc-500 dark:text-zinc-400"
        aria-hidden="true"
      />
    </span>
  );
}

/** Page and page size from the address; anything unparseable falls back to the first page of 25. */
export function pagingFrom(params: URLSearchParams): { page: number; size: PageSize; offset: number } {
  const size = PAGE_SIZES.find((option) => String(option) === params.get("size")) ?? PAGE_SIZES[0];
  const parsed = Number.parseInt(params.get("page") ?? "", 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  return { page, size, offset: (page - 1) * size };
}

/**
 * Steps back to the last page that exists — after the last row of a page was
 * deleted, or when a linked page number is past the end.
 */
export function useClampPage(
  total: number | undefined,
  page: number,
  size: number,
  update: (changes: Record<string, string | number | null>) => void,
) {
  useEffect(() => {
    if (total === undefined || page === 1) return;
    const last = Math.max(1, Math.ceil(total / size));
    if (page > last) update({ page: last === 1 ? null : last });
  }, [total, page, size, update]);
}

/** Local time as 2026-10-31 14:05, which lines up in a column; the long form is in the tooltip. */
export function Stamp({ value }: { value: string }) {
  const { format } = useI18n();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className={DATA}>—</span>;

  const pad = (part: number) => String(part).padStart(2, "0");
  const text = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return (
    <time dateTime={value} title={format.dateTime(value)} className={`${DATA} text-zinc-600 dark:text-zinc-400`}>
      {text}
    </time>
  );
}

/**
 * The last eight characters of a UUID. The backend issues version 7 UUIDs,
 * which begin with a timestamp, so accounts created moments apart share their
 * first eight characters; the random part is at the end.
 */
export function shortId(id: string): string {
  return `…${id.slice(-8)}`;
}

/** A short ID with the whole of it a click away. */
export function IdCell({ id }: { id: string }) {
  const { t } = useI18n();
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(t.admin.copied);
    } catch {
      toast.error(t.admin.copyFailed);
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <span title={id} className={`${CODE} text-zinc-700 dark:text-zinc-300`}>
        {shortId(id)}
      </span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={t.admin.copyId(id)}
        title={t.admin.copyId(id)}
        className={`${ICON_BUTTON} h-7 w-7`}
      >
        <i className="ri-file-copy-line text-[13px]" aria-hidden="true" />
      </button>
    </span>
  );
}

const TAG_TONES = {
  cyan: "border-cyan-600/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300",
  zinc: "border-zinc-400/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
};

export function Tag({ tone, children }: { tone: keyof typeof TAG_TONES; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-px text-xs font-medium ${TAG_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** A yes/no column: a check or a dash, and the word, so colour is never the only signal. */
export function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        on ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <i className={on ? "ri-check-line" : "ri-subtract-line"} aria-hidden="true" />
      {label}
    </span>
  );
}

const STATUS_TONES: Record<ScanStatus, string> = {
  COMPLETED: "text-emerald-700 dark:text-emerald-400",
  RUNNING: "text-amber-700 dark:text-amber-400",
  PENDING: "text-sky-700 dark:text-sky-400",
  FAILED: "text-rose-700 dark:text-rose-400",
};

/** The status in words, coloured by outcome; the word carries it on its own. */
export function StatusLabel({ status }: { status: ScanStatus }) {
  const { t } = useI18n();
  const label = (t.scan.status as Record<string, string | undefined>)[status] ?? status;

  return (
    <span className={`font-medium ${STATUS_TONES[status] ?? "text-zinc-600 dark:text-zinc-400"}`}>{label}</span>
  );
}

export function TableMessage({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-14 text-center text-sm text-zinc-600 dark:text-zinc-400">{children}</div>;
}

export function TableLoading() {
  const { t } = useI18n();
  return (
    <TableMessage>
      <i className="ri-loader-4-line animate-spin text-2xl text-cyan-700 dark:text-cyan-400" aria-hidden="true" />
      <p className="mt-2">{t.common.loading}</p>
    </TableMessage>
  );
}

/** A failed load with the reason and a retry. FORBIDDEN is the caller's to handle, with NoAccess. */
export function LoadFailure({ error, title, onRetry }: { error: LoadError; title: string; onRetry: () => void }) {
  const { t } = useI18n();
  const reason =
    error.kind === "network" ? t.common.networkError : error.kind === "failed" ? error.message : t.admin.noAccess.title;

  return (
    <div className="px-4 py-12 text-center">
      <p role="alert" className="text-sm text-rose-700 dark:text-rose-400">
        {title} {reason}
      </p>
      <button type="button" onClick={onRetry} className={`${BUTTON_QUIET} mt-4`}>
        <i className="ri-refresh-line" aria-hidden="true" />
        {t.common.retry}
      </button>
    </div>
  );
}

export function TableFooter({
  total,
  offset,
  size,
  onPageChange,
  onSizeChange,
}: {
  total: number;
  offset: number;
  size: PageSize;
  onPageChange: (page: number) => void;
  onSizeChange: (size: PageSize) => void;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const page = Math.floor(offset / size) + 1;
  const totalPages = Math.max(1, Math.ceil(total / size));

  // The pager sits under the rows, so whoever uses it has scrolled down past
  // them. The new page starts at the top of the table, and so does the view.
  function changePage(next: number) {
    const panel = ref.current?.parentElement;
    if (panel && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ block: "start" });
    onPageChange(next);
  }

  return (
    <div ref={ref} className="flex flex-col gap-3 border-t border-zinc-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-zinc-800">
      <p className={`${DATA} text-xs text-zinc-600 dark:text-zinc-400`}>
        {t.common.pagination.range(Math.min(offset + 1, total), Math.min(offset + size, total), total)}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          {t.admin.pageSize}
          <Select
            compact
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value) as PageSize)}
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
        {totalPages > 1 ? <Pagination page={page} totalPages={totalPages} onPageChange={changePage} /> : null}
      </div>
    </div>
  );
}
