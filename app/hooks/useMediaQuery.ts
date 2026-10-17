"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in sync as the viewport or the user's
 * settings change. `serverValue` is what the server render assumes.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** For event handlers and effects; components use useMediaQuery(REDUCED_MOTION_QUERY). */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export default useMediaQuery;
