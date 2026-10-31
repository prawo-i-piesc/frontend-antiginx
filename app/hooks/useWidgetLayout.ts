"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { getPreference, putPreference, type PreferenceKey } from "@/app/lib/statsApi";

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

/** Edits are sent to the server once they pause, not on every step of a drag. */
const SAVE_DELAY = 800;

const listeners = new Set<() => void>();
/** The cache when localStorage is disabled: the layout then lasts until the page is reloaded. */
const memory = new Map<string, string>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab saving its layout.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStored(key: string): string | null {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    // Storage is disabled; the in-memory copy stands in.
  }
  return memory.get(key) ?? null;
}

function writeStored(key: string, raw: string) {
  memory.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Storage is full or disabled.
  }
  for (const listener of listeners) listener();
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
 * The widgets on a board and what is left in its library, as `[{ id, type,
 * size }]`.
 *
 * The layout belongs to the account: it is saved as the preference
 * `storageKey` and follows the person to any browser. localStorage keeps a
 * copy, so a return visit draws the saved layout at once instead of the
 * defaults first; the server's copy replaces it when it arrives. A layout
 * saved only in this browser, from before layouts were kept on the server,
 * is uploaded the first time the server has none.
 */
export function useWidgetLayout<T extends string>(
  storageKey: PreferenceKey,
  library: readonly WidgetConfig<T>[],
  defaults: readonly WidgetConfig<T>[],
) {
  // The server render has no storage and draws the defaults; the browser reads
  // the cached layout without a second, effect-driven render.
  const stored = useSyncExternalStore(subscribe, () => readStored(storageKey), () => null);
  const saved = useMemo(() => parseLayout(stored, library), [stored, library]);

  // Changes made on this page win over storage and the server, so an emptied
  // board stays empty until the next visit.
  const [edited, setEdited] = useState<readonly WidgetConfig<T>[] | null>(null);
  const widgets = edited ?? saved ?? defaults;

  const pending = useRef<readonly WidgetConfig<T>[] | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    getPreference(storageKey, controller.signal).then(
      (value) => {
        // Edited while the request was out: those edits are on their way up.
        if (controller.signal.aborted || pending.current) return;
        if (value === null) {
          const local = readStored(storageKey);
          if (local === null) return;
          try {
            void putPreference(storageKey, JSON.parse(local)).catch(() => {});
          } catch {
            // Not JSON: nothing worth keeping.
          }
          return;
        }
        const raw = JSON.stringify(value);
        if (raw !== readStored(storageKey)) writeStored(storageKey, raw);
      },
      () => {
        // Offline or refused: the cached layout stands.
      },
    );
    return () => controller.abort();
  }, [storageKey]);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const value = pending.current;
    if (!value) return;
    pending.current = null;
    putPreference(storageKey, value).catch((error: unknown) => {
      // The browser keeps the layout; the next change tries again.
      console.error("Saving the widget layout failed:", error);
    });
  }, [storageKey]);

  // Leaving the page sends what is still waiting.
  useEffect(() => flush, [flush]);

  const save = useCallback(
    (next: readonly WidgetConfig<T>[]) => {
      setEdited(next);
      writeStored(storageKey, JSON.stringify(next));
      pending.current = next;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, SAVE_DELAY);
    },
    [storageKey, flush],
  );

  const available = useMemo(
    () => library.filter((widget) => !widgets.some((active) => active.type === widget.type)),
    [library, widgets],
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
