"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";

import { BUTTON_QUIET } from "@/app/components/profile/ui";
import Dropdown from "@/app/components/ui/Dropdown";
import Pagination from "@/app/components/ui/Pagination";
import { Bone, ROW_WIDTHS, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { SURFACE } from "@/app/components/ui/surface";
import type { LoadError } from "@/app/hooks/useApiQuery";
import useFitRows from "@/app/hooks/useFitRows";
import { useI18n } from "@/app/i18n/I18nProvider";
import { FIT_FALLBACK, PAGE_SIZES, type SizeChoice } from "@/app/lib/paging";
import type { ScanStatus } from "@/app/lib/api";
import { useToast } from "@/app/providers/ToastProvider";

/**
 * Building blocks of the admin tables: dense rows in the interface's own
 * typeface, with tabular figures so dates and counts line up column by
 * column. Only identifiers, which are read character by character, are set
 * in monospace.
 */

export const PANEL = `scroll-mt-4 overflow-hidden ${SURFACE}`;
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
/** For a header that stays put while the rows scroll under it: opaque, or they show through. */
export const STICKY_THEAD = "sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900";
export const TH = "h-9 px-3 text-xs font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-400";
export const ROW =
  "border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30";
export const TD = "h-11 px-3 whitespace-nowrap text-zinc-800 dark:text-zinc-200";
/** Dates, counts and other values that should line up in a column. */
export const DATA = "tabular-nums";
/**
 * The record count at the end of a toolbar. It keeps its line while there is
 * no count yet, so where the toolbar wraps it onto a line of its own the
 * table does not move down when the count arrives.
 */
export const RECORD_COUNT = `${DATA} ml-auto min-h-4 text-xs text-zinc-600 dark:text-zinc-400`;
/** IDs and test names: read character by character, so monospaced. */
export const CODE = "font-code text-xs";
/** No size of its own: add h-8 w-8 or similar where it is used. */
export const ICON_BUTTON =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
/**
 * Text fields show focus by their border alone. A field takes :focus-visible
 * on a mouse click too, so the app-wide outline ring would light up every
 * time someone clicks in to type; the border change is quieter and still
 * plainly visible.
 */
const CONTROL_SKIN =
  "rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-900 transition-colors quiet-focus focus:border-zinc-500 dark:border-zinc-700/70 dark:bg-zinc-950/50 dark:text-zinc-100 dark:focus:border-zinc-400";
export const CONTROL = `h-9 text-sm ${CONTROL_SKIN}`;

/**
 * Page and page size of a table that keeps them in the address. Without
 * `size` the table fits the window (useFitRows): `key` names the table, and
 * the returned `panel` props go on its panel, which holds the toolbar, the
 * rows and the pager. Anything unparseable falls back to the first page.
 *
 * `ready` stays false until a fitted size has been measured. Load nothing
 * before it: the size, and with it the offset, are only stand-ins until then.
 * While the page loads, pass `size` and `pager` to TableLoading.
 *
 * A fitted panel is held at the height of a full page, with the pager at its
 * foot, so it keeps its size whatever comes in: placeholders, a short page,
 * or no rows at all.
 */
export function useAddressPaging(
  params: URLSearchParams,
  update: (changes: Record<string, string | number | null>) => void,
  key: string,
) {
  const { fit, pager, panel: fullPanel, panelRef } = useFitRows(key);
  const chosen = PAGE_SIZES.find((option) => String(option) === params.get("size")) ?? null;
  const ready = chosen !== null || fit !== null;
  const size = chosen ?? fit ?? FIT_FALLBACK;
  const parsed = Number.parseInt(params.get("page") ?? "", 10);
  const linked = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  const page = useKeptPage(linked, chosen === null && ready ? size : null, (next) =>
    update({ page: next === 1 ? null : next }),
  );

  const choice: SizeChoice = chosen ?? "fit";
  const panel = {
    ref: panelRef,
    className: `${PANEL} flex flex-col`,
    style: chosen === null && fullPanel !== null ? { minHeight: fullPanel } : undefined,
  };
  return { page, size, offset: (page - 1) * size, choice, fit, pager, panel, ready };
}

/**
 * The page to show, from `linked`, the page in the address. When the fitted
 * page size changes with the window, it is the page that still holds the
 * first row in view, so resizing never jumps elsewhere in the list. That page
 * is worked out as the size changes, not after it, so the old page number is
 * never loaded at the new size; the address catches up after.
 *
 * `fitted` is null while the size is not a fitted one that has been measured.
 * A size someone picked themselves starts from the first page, and the first
 * measure of a fitted one changes nothing: a linked page stays put.
 */
function useKeptPage(linked: number, fitted: number | null, goTo: (page: number) => void): number {
  // What was shown: the page, the fitted size it was at, and the address's page then.
  const [shown, setShown] = useState({ page: linked, fitted, linked });

  // Until the address has caught up with a page worked out here, that page stands.
  let page = shown.linked === linked ? shown.page : linked;
  if (fitted !== null && shown.fitted !== null && fitted !== shown.fitted && page !== 1) {
    page = Math.floor(((page - 1) * shown.fitted) / fitted) + 1;
  }
  if (page !== shown.page || fitted !== shown.fitted || linked !== shown.linked) setShown({ page, fitted, linked });

  const move = useEffectEvent(goTo);
  useEffect(() => {
    if (page !== linked) move(page);
  }, [page, linked]);

  return page;
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
export function IdCell({ id, short = true }: { id: string; /** Our UUIDv7s share a prefix, so their tail is shown; other IDs whole. */ short?: boolean }) {
  const { t } = useI18n();
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(t.table.copied);
    } catch {
      toast.error(t.table.copyFailed);
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <span title={id} className={`${CODE} text-zinc-700 dark:text-zinc-300`}>
        {short ? shortId(id) : id}
      </span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={t.table.copyId(id)}
        title={t.table.copyId(id)}
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
  // Centred in a panel held taller than what it shows (useAddressPaging).
  return <div className="my-auto px-4 py-14 text-center text-sm text-zinc-600 dark:text-zinc-400">{children}</div>;
}

/**
 * Rows of placeholders where the table will be: a header strip, then rows
 * as tall as the real ones, so nothing moves when the data arrives. A table
 * that fits the window (useFitRows) is measured from them before its first
 * page is loaded, so they must stay as tall as TH and TD.
 *
 * A paged table passes its page size as `rows` and the room its pager will
 * take as `pager` (useAddressPaging), so while it loads the panel is already
 * as tall as the page it is loading.
 */
export function TableLoading({
  rows = 6,
  columns = 5,
  pager = null,
}: {
  rows?: number;
  columns?: number;
  pager?: number | null;
}) {
  const rest = Array.from({ length: Math.max(columns - 1, 0) }, (_, index) => index);
  return (
    <>
      <SkeletonRegion>
        <div className={`${THEAD} flex h-9 items-center gap-6 px-3`}>
          <Bone className="h-2.5 w-20" />
          {rest.map((column) => (
            <Bone key={column} className="hidden h-2.5 w-14 sm:block" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            data-placeholder-row
            className="flex h-11 items-center gap-6 border-b border-zinc-100 px-3 last:border-0 dark:border-zinc-800/60"
          >
            <span className="min-w-0 flex-1">
              <Bone className={`h-3 max-w-full ${ROW_WIDTHS[row % ROW_WIDTHS.length]}`} />
            </span>
            {rest.map((column) => (
              <Bone key={column} className="hidden h-3 w-16 sm:block" />
            ))}
          </div>
        ))}
      </SkeletonRegion>
      {pager ? (
        <div style={{ height: pager }} className="mt-auto border-t border-zinc-200 dark:border-zinc-800" />
      ) : null}
    </>
  );
}

/** A failed load with the reason and a retry. FORBIDDEN is the caller's to handle, with NoAccess. */
export function LoadFailure({ error, title, onRetry }: { error: LoadError; title: string; onRetry: () => void }) {
  const { t } = useI18n();
  const reason =
    error.kind === "network" ? t.common.networkError : error.kind === "failed" ? error.message : t.errors.status.forbidden;

  return (
    <div className="my-auto px-4 py-12 text-center">
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
  choice,
  fit,
  sizes = PAGE_SIZES,
  onPageChange,
  onSizeChange,
}: {
  total: number;
  offset: number;
  /** The rows on a page now. */
  size: number;
  /** What was picked: a number, or "fit" for as many as the window holds. */
  choice: SizeChoice;
  /** How many rows the window holds; null leaves the fit option out. */
  fit: number | null;
  /** The fixed page sizes on offer besides fit. */
  sizes?: readonly number[];
  onPageChange: (page: number) => void;
  onSizeChange: (choice: SizeChoice) => void;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const sizeLabelId = useId();
  const page = Math.floor(offset / size) + 1;
  const totalPages = Math.max(1, Math.ceil(total / size));

  // The pager sits under the rows, so whoever uses it has scrolled down past
  // them. The new page starts at the top of the table, and so does the view.
  function changePage(next: number) {
    const panel = ref.current?.parentElement;
    if (panel && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ block: "start" });
    onPageChange(next);
  }

  // Laid out by the room the page has, never by what the pager holds: on one
  // line on a wide page, with the page buttons under the rest on a narrower
  // one, each part on a line of its own on a phone. The page buttons are there
  // for a single page too. So a list of one page and a list of many have a
  // pager of the same height, switching between them moves nothing, and
  // useFitRows can count on its height before the data comes.
  return (
    <div
      ref={ref}
      data-pager
      // At the foot of a panel held at a full page's height (useAddressPaging).
      className="mt-auto flex flex-col gap-3 border-t border-zinc-200 px-3 py-3 sm:px-4 @5xl:flex-row @5xl:items-center dark:border-zinc-800"
    >
      <div className="flex flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between @5xl:flex-1">
        <p className={`${DATA} text-xs text-zinc-600 dark:text-zinc-400`}>
          {t.common.pagination.range(Math.min(offset + 1, total), Math.min(offset + size, total), total)}
        </p>
        <span className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span id={sizeLabelId}>{t.table.pageSize}</span>
          <Dropdown
            size="sm"
            labelledBy={sizeLabelId}
            value={choice === "fit" ? "fit" : String(size)}
            options={[
              ...(fit === null ? [] : [{ value: "fit", label: t.table.fitRows(fit) }]),
              ...sizes.map((option) => ({ value: String(option), label: String(option) })),
            ]}
            onChange={(next) => onSizeChange(next === "fit" ? "fit" : Number(next))}
          />
        </span>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={changePage}
        className="@xl:self-end @5xl:self-auto"
      />
    </div>
  );
}
