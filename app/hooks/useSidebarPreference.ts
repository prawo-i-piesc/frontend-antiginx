"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether the person collapsed the sidebar to icons or expanded it, kept in
 * localStorage and shared live between tabs. Null until they choose: the
 * shell then picks by screen width.
 */

export type SidebarPreference = "collapsed" | "expanded" | null;

const KEY = "sidebar.collapsed";
const listeners = new Set<() => void>();
/** This page's choice, for when storage refuses to keep it. */
let chosen: SidebarPreference | undefined;

function read(): SidebarPreference {
  if (chosen !== undefined) return chosen;
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "1" ? "collapsed" : value === "0" ? "expanded" : null;
  } catch {
    // Storage throws in private mode or with site data blocked.
    return null;
  }
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  // Another tab changed it.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    chosen = undefined;
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export default function useSidebarPreference() {
  const preference = useSyncExternalStore(subscribe, read, () => null);

  const setCollapsed = useCallback((collapsed: boolean) => {
    chosen = collapsed ? "collapsed" : "expanded";
    // Read by the loading skeleton's CSS; the bootstrap script in the root
    // layout sets it on the next page load.
    document.documentElement.dataset.sidebar = chosen;
    try {
      window.localStorage.setItem(KEY, collapsed ? "1" : "0");
    } catch {
      // Not remembered, but the change below still applies to this page.
    }
    for (const notify of listeners) notify();
  }, []);

  return [preference, setCollapsed] as const;
}
