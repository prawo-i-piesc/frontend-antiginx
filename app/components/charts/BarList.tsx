"use client";

export interface BarDatum {
  key: string;
  label: string;
  /** The full name when `label` is a shortened one; shown on hover. */
  title?: string;
  value: number;
  /** Printed at the end of the row, already formatted. */
  display: string;
  /**
   * The row in words, label included: the hover tooltip, and all a screen
   * reader hears of the row.
   */
  detail: string;
  color: string;
}

/**
 * Horizontal bars, one per row, all starting from the same left edge. The
 * label and the printed value sit above each bar, so long test names wrap
 * nowhere and the figure never wears the bar's colour. Bars are 8px thick
 * with a rounded data end; hovering a row shows its detail and dims the rest.
 */
export default function BarList({ data, label }: { data: readonly BarDatum[]; label: string }) {
  const top = Math.max(...data.map((datum) => datum.value), 1);

  return (
    <ul aria-label={label} className="group/bars flex flex-col gap-3">
      {data.map((datum) => {
        const share = Math.min(datum.value / top, 1) * 100;
        // The tooltip opens away from the near edge of the card.
        const anchor = share > 50 ? { right: `${100 - share}%` } : { left: `${share}%` };

        return (
          <li
            key={datum.key}
            className="group/bar relative transition-opacity group-hover/bars:opacity-55 hover:opacity-100!"
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]" aria-hidden="true">
              <span title={datum.title} className="truncate text-zinc-700 dark:text-zinc-300">
                {datum.label}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                {datum.display}
              </span>
            </div>
            <div className="relative h-2" aria-hidden="true">
              {datum.value > 0 ? (
                <div
                  className="bar-grow h-full min-w-0.5 rounded-r-[4px]"
                  style={{ width: `${share}%`, backgroundColor: datum.color }}
                />
              ) : null}
              {/* display:none until hovered: a hidden tooltip near the edge would still widen the page. */}
              <div
                className="pointer-events-none absolute top-full z-10 mt-1.5 hidden whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 shadow-md group-hover/bar:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                style={anchor}
              >
                {datum.detail}
              </div>
            </div>
            <span className="sr-only">{datum.detail}</span>
          </li>
        );
      })}
    </ul>
  );
}
