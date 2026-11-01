"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { deletePreference, getPreference, putPreference, type PreferenceKey, type PreferenceWrite } from "@/app/lib/statsApi";
import { useAuth } from "@/app/providers/AuthProvider";

export type WidgetSize = "1x1" | "2x1" | "1x2" | "2x2";

/** One widget on a board: `type` picks what it shows, `id` is unique on the board. */
export interface WidgetConfig<T extends string = string> {
  id: string;
  type: T;
  size: WidgetSize;
}

/** Returns a copy of `items` with the one at `from` moved to `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Edits are sent to the server once they pause, not on every step of a drag. */
const SAVE_DELAY = 800;

/**
 * This browser's copy of an account's layout. `layout` null means the
 * defaults. `dirty` marks a change the server has not confirmed yet: it goes up
 * on the next visit instead of being overwritten by the older server copy.
 */
interface CacheEntry {
  layout: unknown[] | null;
  dirty: boolean;
}

const listeners = new Set<() => void>();
/** The cache when localStorage is disabled or full: it then lasts until the page is reloaded. */
const memory = new Map<string, string | null>();

function subscribe(onChange: () => void) {
  // Another tab saving its layout: its value replaces this tab's in-memory copy.
  const onStorage = (event: StorageEvent) => {
    if (event.key) memory.delete(event.key);
    else memory.clear();
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readStored(key: string): string | null {
  // The newest write wins even when storage refused it.
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, raw: string | null) {
  memory.set(key, raw);
  try {
    if (raw === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, raw);
  } catch {
    // Storage is full or disabled; the in-memory copy stands in.
  }
  for (const listener of listeners) listener();
}

function parseEntry(raw: string | null): CacheEntry | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<CacheEntry>;
    if (typeof value !== "object" || value === null || typeof value.dirty !== "boolean") return null;
    return { layout: Array.isArray(value.layout) ? value.layout : null, dirty: value.dirty };
  } catch {
    return null;
  }
}

/**
 * Before layouts were cached per account they were cached under the bare
 * preference key, where the next person to sign in on the same browser would
 * have picked them up. Nothing reads those keys any more; drop them.
 */
function forgetUnscopedCache(storageKey: PreferenceKey) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Storage is disabled: there is nothing to forget.
  }
}

/**
 * The saved layout, keeping only well-formed entries of known types, each type
 * once, at the size the code gives that widget today. Null when nothing usable
 * is saved — an emptied board included, so it comes back with the defaults.
 */
function parseLayout<T extends string>(
  value: unknown[] | null,
  library: readonly WidgetConfig<T>[],
): WidgetConfig<T>[] | null {
  if (!value) return null;

  const seen = new Set<string>();
  const widgets: WidgetConfig<T>[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const { id, type } = entry as Record<string, unknown>;
    const known = library.find((widget) => widget.type === type);
    if (!known || seen.has(known.type)) continue;
    seen.add(known.type);
    widgets.push({ id: typeof id === "string" ? id : known.type, type: known.type, size: known.size });
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
 * copy per account, so a return visit draws the saved layout at once instead
 * of the defaults first, and the server's copy replaces it when it arrives.
 * A change is marked unsaved in that copy until the server confirms it, so a
 * tab closed mid-save, a reload or a failed request does not lose it: the
 * next visit sends it up first.
 */
export function useWidgetLayout<T extends string>(
  storageKey: PreferenceKey,
  library: readonly WidgetConfig<T>[],
  defaults: readonly WidgetConfig<T>[],
) {
  const { user } = useAuth();
  const cacheKey = user ? `${storageKey}:${user.id}` : null;

  // The server render has no storage and draws the defaults; the browser reads
  // the cached layout without a second, effect-driven render.
  const stored = useSyncExternalStore(subscribe, () => (cacheKey ? readStored(cacheKey) : null), () => null);
  const saved = useMemo(() => parseLayout(parseEntry(stored)?.layout ?? null, library), [stored, library]);

  // Changes made on this page win over storage and the server, so an emptied
  // board stays empty until the next visit.
  const [edited, setEdited] = useState<readonly WidgetConfig<T>[] | null>(null);
  const widgets = edited ?? saved ?? defaults;

  const timer = useRef<number | undefined>(undefined);
  // Writes go out one after another, so an older layout never lands last.
  const queue = useRef<Promise<void>>(Promise.resolve());

  /** Sends the cached change, if any: the layout, or "back to defaults" as a delete. */
  const send = useCallback(
    (options: PreferenceWrite = {}) => {
      window.clearTimeout(timer.current);
      if (!cacheKey) return;
      const raw = readStored(cacheKey);
      const entry = parseEntry(raw);
      if (!entry?.dirty) return;

      queue.current = queue.current.then(async () => {
        try {
          if (entry.layout === null) await deletePreference(storageKey, options);
          else await putPreference(storageKey, entry.layout, options);
          // Confirmed, unless another change has been made since.
          if (readStored(cacheKey) === raw) writeStored(cacheKey, JSON.stringify({ ...entry, dirty: false }));
        } catch (error) {
          // Still marked unsaved: the next change or the next visit sends it again.
          console.error("Saving the widget layout failed:", error);
        }
      });
    },
    [cacheKey, storageKey],
  );

  useEffect(() => {
    if (!cacheKey) return;
    forgetUnscopedCache(storageKey);

    // An unsaved change from the last visit is newer than anything on the server.
    if (parseEntry(readStored(cacheKey))?.dirty) {
      send();
      return;
    }

    const controller = new AbortController();
    getPreference(storageKey, controller.signal).then(
      (value) => {
        // Changed on this page while the request was out: that change is on its way up.
        if (controller.signal.aborted || parseEntry(readStored(cacheKey))?.dirty) return;
        const raw = Array.isArray(value) ? JSON.stringify({ layout: value, dirty: false }) : null;
        if (raw !== readStored(cacheKey)) writeStored(cacheKey, raw);
      },
      () => {
        // Offline or refused: the cached layout stands.
      },
    );
    return () => controller.abort();
  }, [cacheKey, storageKey, send]);

  // Leaving the page sends what is still waiting; so does hiding or closing
  // the tab, with keepalive so the request outlives the page.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") send({ keepalive: true });
    };
    const onPageHide = () => send({ keepalive: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      send();
    };
  }, [send]);

  const store = useCallback(
    (layout: readonly WidgetConfig<T>[] | null) => {
      if (cacheKey) writeStored(cacheKey, JSON.stringify({ layout, dirty: true }));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => send(), SAVE_DELAY);
    },
    [cacheKey, send],
  );

  const save = useCallback(
    (next: readonly WidgetConfig<T>[]) => {
      setEdited(next);
      store(next);
    },
    [store],
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

  const isDefault = useMemo(
    () => widgets.length === defaults.length && widgets.every((widget, index) => widget.type === defaults[index].type),
    [widgets, defaults],
  );

  /** Back to the defaults by forgetting the saved layout, so later changes to the defaults reach this account too. */
  const reset = useCallback(() => {
    setEdited(null);
    store(null);
  }, [store]);

  return { widgets, available, move, remove, add, isDefault, reset };
}

export default useWidgetLayout;
