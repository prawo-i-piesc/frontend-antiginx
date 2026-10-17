"use client";

import { useI18n } from "@/app/i18n/I18nProvider";

const MAX_PAGE_BUTTONS = 5;

/** Up to five page numbers, kept around the current page. */
function visiblePages(page: number, totalPages: number): number[] {
  const count = Math.min(MAX_PAGE_BUTTONS, totalPages);
  const start = Math.min(Math.max(1, page - Math.floor(MAX_PAGE_BUTTONS / 2)), totalPages - count + 1);
  return Array.from({ length: count }, (_, index) => start + index);
}

interface PaginationProps {
  /** 1-based. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Overrides the default name when a page has more than one pagination. */
  label?: string;
  className?: string;
}

/**
 * Previous / numbered / next page buttons.
 *
 * At either end "previous" or "next" stays focusable and is only marked
 * aria-disabled: a truly disabled button would drop the focus of someone who
 * just used it to reach the last page.
 */
export default function Pagination({ page, totalPages, onPageChange, label, className = "" }: PaginationProps) {
  const { t } = useI18n();
  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 1), totalPages);
    if (next !== page) onPageChange(next);
  };

  const stepClass = (disabled: boolean) =>
    `inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium bg-zinc-100/90 text-zinc-600 transition-colors dark:bg-zinc-800/70 dark:text-zinc-300 ${
      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
    }`;

  return (
    <nav aria-label={label ?? t.common.pagination.label} className={className}>
      <ul className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-zinc-300/80 bg-white/85 p-1 shadow-sm backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-900/30">
        <li>
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            aria-disabled={atStart || undefined}
            aria-label={t.common.pagination.previousPage}
            className={stepClass(atStart)}
          >
            <i className="ri-arrow-left-s-line text-sm" aria-hidden="true"></i>
            <span className="hidden sm:inline">{t.common.pagination.previous}</span>
          </button>
        </li>

        {visiblePages(page, totalPages).map((pageNumber) => (
          <li key={pageNumber}>
            <button
              type="button"
              onClick={() => goTo(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              aria-label={t.common.pagination.page(pageNumber)}
              className={`h-8 min-w-8 cursor-pointer rounded-full px-2.5 text-xs font-medium transition-colors ${
                pageNumber === page
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
              }`}
            >
              {pageNumber}
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            aria-disabled={atEnd || undefined}
            aria-label={t.common.pagination.nextPage}
            className={stepClass(atEnd)}
          >
            <span className="hidden sm:inline">{t.common.pagination.next}</span>
            <i className="ri-arrow-right-s-line text-sm" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}
