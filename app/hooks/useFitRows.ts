"use client";

import { useLayoutEffect, useState } from "react";

import { MAIN_CONTENT_ID } from "@/app/components/ui/SkipLink";

const MIN_ROWS = 5;
const MAX_ROWS = 100;
/** Tailwind's sm and lg. */
const SM = 640;
const LG = 1024;
/**
 * What the pager takes under the rows (TableFooter, page buttons included)
 * the first time a table is laid out on a screen of this width: on one line
 * from sm up, stacked on a phone. It comes only with the data, so it cannot
 * be measured before the first request; once it has been on screen its real
 * height is kept instead.
 */
const PAGER_GUESS = { phone: 139, other: 67 };

/** Where the pager's height is kept: per table, and per layout of the toolbar and pager. */
function storageKey(key: string): string {
  const width = window.innerWidth;
  return `fitPager:${key}:${width >= LG ? "wide" : width >= SM ? "medium" : "phone"}`;
}

function readPager(key: string): number {
  try {
    const saved = Number(localStorage.getItem(storageKey(key)));
    if (Number.isFinite(saved) && saved > 0) return saved;
  } catch {
    // Without storage every visit starts from the guess.
  }
  return window.innerWidth >= SM ? PAGER_GUESS.other : PAGER_GUESS.phone;
}

function savePager(key: string, height: number): void {
  try {
    localStorage.setItem(storageKey(key), String(height));
  } catch {
    // The next visit starts from the guess and corrects itself.
  }
}

/**
 * The rows in a panel: the table's, or while it loads the placeholders
 * standing in for them, which TableLoading lays out at the same heights.
 */
function rowsIn(panel: HTMLElement): { first: HTMLElement; bottom: number } | null {
  const table = panel.querySelector("table");
  const row = table?.tBodies[0]?.rows[0];
  if (table && row) return { first: row, bottom: table.getBoundingClientRect().bottom };

  const placeholders = panel.querySelectorAll<HTMLElement>("[data-placeholder-row]");
  if (placeholders.length === 0) return null;
  return { first: placeholders[0], bottom: placeholders[placeholders.length - 1].getBoundingClientRect().bottom };
}

/**
 * How many rows fit under what the page shows above them, with the pager
 * and whatever padding closes the page below them. Null when the panel has
 * neither rows nor placeholders to measure, e.g. while it shows an error.
 */
function rowsThatFit(key: string, main: HTMLElement, panel: HTMLElement, height: number): number | null {
  const rows = rowsIn(panel);
  if (!rows) return null;

  // The top of the page's content, wherever it is scrolled to. A table's rows
  // can sit half a pixel lower than the placeholders; that is no reason to
  // load the page again, so the half pixel is dropped.
  const origin = main.getBoundingClientRect().top - main.scrollTop;
  const top = Math.floor(rows.first.getBoundingClientRect().top - origin);
  const row = rows.first.getBoundingClientRect().height;

  let below = panel.getBoundingClientRect().bottom - rows.bottom;
  const pager = panel.querySelector<HTMLElement>("[data-pager]");
  if (pager) {
    // Everything between the last row and the pager's end: the pager itself,
    // and a scrollbar under a table that scrolls sideways.
    savePager(key, Math.ceil(pager.getBoundingClientRect().bottom - rows.bottom));
  } else {
    below += readPager(key);
  }
  for (let element: HTMLElement | null = panel; element && element !== main; element = element.parentElement) {
    const style = getComputedStyle(element);
    below += parseFloat(style.marginBottom) || 0;
    if (element !== panel) below += (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderBottomWidth) || 0);
  }
  below += parseFloat(getComputedStyle(main).paddingBottom) || 0;

  const rowsHeight = height - top - Math.ceil(below);
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.floor(rowsHeight / row)));
}

/**
 * How many rows of a table fit on screen with the whole panel, pager
 * included, so a page of them needs no scrolling. Put `panelRef` on the panel
 * that holds the toolbar, the table and the pager; it scrolls with the page's
 * main content (MAIN_CONTENT_ID), which every page has for its skip link.
 *
 * Null until the panel is laid out, so a table that loads a page of this
 * size waits for it rather than asking for a guess and then again. That
 * happens before the first paint: while loading, the panel shows placeholder
 * rows as tall as the real ones under a header as tall as the real one, so
 * only the pager, which comes with the data, is not on screen yet. Its height
 * is the one kept from the last time this table was shown at this width, or
 * a guess the first time. The answer is worked out again when the window or
 * the panel changes size. On a phone the height is only read again when the
 * width changes, since the browser's bars change it as the page scrolls.
 */
export default function useFitRows(key: string): { fit: number | null; panelRef: (element: HTMLElement | null) => void } {
  const [fit, setFit] = useState<number | null>(null);
  const [panel, panelRef] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (!panel || !main) return;
    let width = main.clientWidth;
    let height = main.clientHeight;

    const update = () => {
      if (main.clientWidth !== width || window.innerWidth >= LG) {
        width = main.clientWidth;
        height = main.clientHeight;
      }
      const rows = rowsThatFit(key, main, panel, height);
      if (rows !== null) setFit(rows);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(main);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [key, panel]);

  return { fit, panelRef };
}
