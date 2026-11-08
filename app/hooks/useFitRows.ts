"use client";

import { useLayoutEffect, useState } from "react";

import { MAIN_CONTENT_ID } from "@/app/components/ui/SkipLink";

/** A table row: TD is h-11. Measured from the table once it has rows. */
const ROW_HEIGHT = 44;
/**
 * Everything on a dashboard page that is not a row, as it is laid out from lg
 * up: the page header, the toolbar, the column headings, the pager and the
 * padding under it. Only a first guess; the table's own measure replaces it
 * and is kept for the next visit.
 */
const RESERVED_GUESS = 303;
const MIN_ROWS = 5;
const MAX_ROWS = 100;
/** Tailwind's lg. Below it a phone's browser bars come and go as the page scrolls. */
const WIDE = 1024;

type Measure = { reserved: number; row: number };

const GUESS: Measure = { reserved: RESERVED_GUESS, row: ROW_HEIGHT };

function storageKey(key: string): string {
  return `fitRows:${key}:${window.innerWidth >= WIDE ? "wide" : "narrow"}`;
}

function readMeasure(key: string): Measure | null {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(key)) ?? "null") as Partial<Measure> | null;
    return saved && typeof saved.reserved === "number" && typeof saved.row === "number" && saved.row > 0
      ? { reserved: saved.reserved, row: saved.row }
      : null;
  } catch {
    return null;
  }
}

function saveMeasure(key: string, measure: Measure): void {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(measure));
  } catch {
    // Without storage the next visit starts from the guess and corrects itself.
  }
}

function rowsFor(height: number, measure: Measure): number {
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.floor((height - measure.reserved) / measure.row)));
}

/** The first answer, before anything is laid out: the last measure of this table, or the guess. */
function initialFit(key: string): number | null {
  if (typeof window === "undefined") return null;
  const height = document.getElementById(MAIN_CONTENT_ID)?.clientHeight ?? window.innerHeight;
  return rowsFor(height, readMeasure(key) ?? GUESS);
}

/**
 * What a panel holding a table takes on the page besides its rows: everything
 * above the first row, and under the last one the pager plus whatever padding
 * closes the page. Null until the table has a row to measure.
 */
function measure(main: HTMLElement, panel: HTMLElement): Measure | null {
  const table = panel.querySelector("table");
  const rows = table?.tBodies[0]?.rows;
  if (!table || !rows || rows.length === 0) return null;

  // The top of the page's content, wherever it is scrolled to.
  const origin = main.getBoundingClientRect().top - main.scrollTop;
  const box = table.getBoundingClientRect();
  const firstRow = box.top + (table.tHead?.getBoundingClientRect().height ?? 0) - origin;

  let below = panel.getBoundingClientRect().bottom - box.bottom;
  for (let element: HTMLElement | null = panel; element && element !== main; element = element.parentElement) {
    const style = getComputedStyle(element);
    below += parseFloat(style.marginBottom) || 0;
    if (element !== panel) below += (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderBottomWidth) || 0);
  }
  below += parseFloat(getComputedStyle(main).paddingBottom) || 0;

  return { reserved: Math.ceil(firstRow + below), row: rows[0].getBoundingClientRect().height };
}

/**
 * How many rows of a table fit on screen with the whole panel, pager
 * included, so a page of them needs no scrolling. Put `panelRef` on the panel
 * that holds the toolbar, the table and the pager.
 *
 * The answer comes before the first paint: from this table's last measure, or
 * a guess on the first visit. Once the table has rows the panel is measured
 * and the result kept, so the next visit starts right. It is worked out again
 * when the window or the panel changes size. What the panel takes besides its
 * rows does not depend on how many there are, so a new page size measures the
 * same and settles. On a phone the height is only read again when the width
 * changes, since the browser's bars change it as the page scrolls.
 */
export default function useFitRows(key: string): { fit: number | null; panelRef: (element: HTMLElement | null) => void } {
  const [fit, setFit] = useState<number | null>(() => initialFit(key));
  const [panel, panelRef] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (!main) return;
    let width = main.clientWidth;
    let height = main.clientHeight;

    const update = () => {
      if (main.clientWidth !== width || window.innerWidth >= WIDE) {
        width = main.clientWidth;
        height = main.clientHeight;
      }
      const measured = panel ? measure(main, panel) : null;
      if (measured) saveMeasure(key, measured);
      setFit(rowsFor(height, measured ?? readMeasure(key) ?? GUESS));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(main);
    if (panel) observer.observe(panel);
    return () => observer.disconnect();
  }, [key, panel]);

  return { fit, panelRef };
}
