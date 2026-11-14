"use client";

import { useLayoutEffect, useState } from "react";

import { MAIN_CONTENT_ID } from "@/app/components/ui/SkipLink";

const MIN_ROWS = 5;
const MAX_ROWS = 100;
/** Tailwind's lg: below it a phone's browser bars come and go as the page scrolls. */
const LG = 1024;

/**
 * How TableFooter lays itself out in the page's main content, by the
 * container sizes it switches at (@xl and @5xl, in rem), and how tall it is
 * then: each part on a line of its own, the page buttons under the rest, or
 * all on one line. It comes only with the data, so before the first request
 * on this device it is taken from here; once it has been on screen its real
 * height is kept instead.
 */
const PAGER_LAYOUTS = [
  { name: "wide", from: 64, guess: 67 },
  { name: "medium", from: 36, guess: 111 },
  { name: "narrow", from: 0, guess: 139 },
] as const;

function pagerLayout(main: HTMLElement): (typeof PAGER_LAYOUTS)[number] {
  const style = getComputedStyle(main);
  const width = main.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return PAGER_LAYOUTS.find((layout) => width >= layout.from * rem) ?? PAGER_LAYOUTS[PAGER_LAYOUTS.length - 1];
}

function readPager(key: string, main: HTMLElement): number {
  const layout = pagerLayout(main);
  try {
    const saved = Number(localStorage.getItem(`fitPager:${key}:${layout.name}`));
    if (Number.isFinite(saved) && saved > 0) return saved;
  } catch {
    // Without storage every visit starts from the guess.
  }
  return layout.guess;
}

function savePager(key: string, main: HTMLElement, height: number): void {
  try {
    localStorage.setItem(`fitPager:${key}:${pagerLayout(main).name}`, String(height));
  } catch {
    // The next visit starts from the guess and corrects itself.
  }
}

/**
 * The first row in a panel: the table's, or while it loads the first of the
 * placeholders standing in for the rows, which TableLoading lays out at the
 * same heights. With it, the scrollbar under a table that scrolls sideways.
 */
function firstRow(panel: HTMLElement): { row: HTMLElement; scrollbar: number } | null {
  const table = panel.querySelector("table");
  const row = table?.tBodies[0]?.rows[0];
  if (table && row) {
    const region = table.parentElement?.getBoundingClientRect().bottom ?? 0;
    return { row, scrollbar: Math.max(0, region - table.getBoundingClientRect().bottom) };
  }
  const placeholder = panel.querySelector<HTMLElement>("[data-placeholder-row]");
  return placeholder ? { row: placeholder, scrollbar: 0 } : null;
}

type Fit = {
  /** How many rows fit. */
  rows: number;
  /** The room under the rows held for the pager. */
  pager: number;
  /** How tall the panel is with a full page of rows. */
  panel: number;
};

/**
 * How many rows fit under what the page shows above them, with the pager
 * and whatever padding closes the page below them. Null when the panel has
 * neither rows nor placeholders to measure, e.g. while it shows a message.
 *
 * Only what the panel holds besides its rows is measured, never its own
 * height: that is held at a full page (`panel`), and a short page leaves room
 * above the pager.
 */
function measure(key: string, main: HTMLElement, panel: HTMLElement, height: number): Fit | null {
  const first = firstRow(panel);
  if (!first) return null;

  // A table's rows can sit half a pixel lower than the placeholders; that is
  // no reason to load the page again, so the half pixel is dropped.
  const box = first.row.getBoundingClientRect();
  const top = Math.floor(box.top - (main.getBoundingClientRect().top - main.scrollTop));
  const head = Math.floor(box.top - panel.getBoundingClientRect().top);
  const row = box.height;

  const shown = panel.querySelector<HTMLElement>("[data-pager]");
  const pager = shown ? Math.ceil(first.scrollbar + shown.getBoundingClientRect().height) : readPager(key, main);
  if (shown) savePager(key, main, pager);

  const border = parseFloat(getComputedStyle(panel).borderBottomWidth) || 0;
  let below = pager + border;
  for (let element: HTMLElement | null = panel; element && element !== main; element = element.parentElement) {
    const style = getComputedStyle(element);
    below += parseFloat(style.marginBottom) || 0;
    if (element !== panel) below += (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderBottomWidth) || 0);
  }
  below += parseFloat(getComputedStyle(main).paddingBottom) || 0;

  const rows = Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.floor((height - top - Math.ceil(below)) / row)));
  return { rows, pager, panel: Math.ceil(head + rows * row + pager + border) };
}

/**
 * How many rows of a table fit on screen with the whole panel, pager
 * included, so a page of them needs no scrolling. Put `panelRef` on the panel
 * that holds the toolbar, the table and the pager; it scrolls with the page's
 * main content (MAIN_CONTENT_ID), which every page has for its skip link.
 *
 * `fit` is null until the panel is laid out, so a table that loads a page of
 * this size waits for it rather than asking for a guess and then again. That
 * happens before the first paint: while loading, the panel shows placeholder
 * rows as tall as the real ones under a header as tall as the real one. The
 * pager comes with the data, so its height is the one kept from the last time
 * this table was shown at this width, or a guess the first time. `pager` is
 * that height, for TableLoading to hold the room.
 *
 * `panel` is how tall the panel is with a full page. Held as its minimum
 * height, the panel keeps its size whatever comes in: placeholders, a short
 * last page, a filter that leaves a few rows, or none.
 *
 * The answer is worked out again when the window or the panel changes size.
 * On a phone the height is only read again when the width changes, since the
 * browser's bars change it as the page scrolls.
 */
export default function useFitRows(key: string): {
  fit: number | null;
  pager: number | null;
  panel: number | null;
  panelRef: (element: HTMLElement | null) => void;
} {
  const [fit, setFit] = useState<Fit | null>(null);
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
      const next = measure(key, main, panel, height);
      if (!next) return;
      setFit((current) =>
        current?.rows === next.rows && current.pager === next.pager && current.panel === next.panel ? current : next,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(main);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [key, panel]);

  return { fit: fit?.rows ?? null, pager: fit?.pager ?? null, panel: fit?.panel ?? null, panelRef };
}
