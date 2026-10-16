"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

export type WidgetSize = "1x1" | "2x1" | "1x2" | "2x2";

/** One widget on a board: `type` picks what it shows, `id` is unique on the board. */
export interface WidgetConfig<T extends string = string> {
  id: string;
  type: T;
  size: WidgetSize;
}

const SIZES: readonly string[] = ["1x1", "2x1", "1x2", "2x2"];

/** Returns a copy of `items` with the one at `from` moved to `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function subscribe(onChange: () => void) {
  // Another tab saving its layout.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * The saved layout, keeping only well-formed entries of known types, each type
 * once. Null when nothing usable is saved — an emptied board included, so it
 * comes back with the defaults.
 */
function parseLayout<T extends string>(
  raw: string | null,
  library: readonly WidgetConfig<T>[],
): WidgetConfig<T>[] | null {
  if (!raw) return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(value)) return null;

  const seen = new Set<string>();
  const widgets: WidgetConfig<T>[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const { id, type, size } = entry as Record<string, unknown>;
    if (typeof id !== "string" || typeof size !== "string" || !SIZES.includes(size)) continue;
    const known = library.find((widget) => widget.type === type);
    if (!known || seen.has(known.type)) continue;
    seen.add(known.type);
    widgets.push({ id, type: known.type, size: size as WidgetSize });
  }

  return widgets.length > 0 ? widgets : null;
}

function nextIdSuffix(widgets: readonly WidgetConfig[]): number {
  return widgets.reduce((next, widget) => {
    const match = widget.id.match(/-(\d+)$/);
    return match ? Math.max(next, Number(match[1]) + 1) : next;
  }, 0);
}

/**
 * The widgets on a board and what is left in its library, kept in
 * localStorage under `storageKey` as `[{ id, type, size }]`.
 */
export function useWidgetLayout<T extends string>(
  storageKey: string,
  library: readonly WidgetConfig<T>[],
  defaults: readonly WidgetConfig<T>[],
) {
  // The server has no storage and renders the defaults; the browser reads the
  // saved layout without a second, effect-driven render.
  const stored = useSyncExternalStore(subscribe, () => readStored(storageKey), () => null);
  const saved = useMemo(() => parseLayout(stored, library), [stored, library]);

  // Changes made on this page win over storage, so an emptied board stays
  // empty until the next visit.
  const [edited, setEdited] = useState<readonly WidgetConfig<T>[] | null>(null);
  const widgets = edited ?? saved ?? defaults;

  const available = useMemo(
    () => library.filter((widget) => !widgets.some((active) => active.type === widget.type)),
    [library, widgets],
  );

  const save = useCallback(
    (next: readonly WidgetConfig<T>[]) => {
      setEdited(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Storage is full or disabled: the layout lasts until the page is left.
      }
    },
    [storageKey],
  );

  const move = useCallback((from: number, to: number) => save(moveItem(widgets, from, to)), [save, widgets]);

  const remove = useCallback((id: string) => save(widgets.filter((widget) => widget.id !== id)), [save, widgets]);

  const add = useCallback(
    (widget: WidgetConfig<T>): WidgetConfig<T> => {
      const created = { ...widget, id: `${widget.type}-${nextIdSuffix(widgets)}` };
      save([...widgets, created]);
      return created;
    },
    [save, widgets],
  );

  return { widgets, available, move, remove, add };
}

export default useWidgetLayout;
