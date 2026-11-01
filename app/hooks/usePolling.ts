"use client";

import { useEffect, useEffectEvent } from "react";

/**
 * Calls `tick` every `interval` ms while the tab is visible, and once more as
 * soon as it becomes visible again, so a view left in a background tab does
 * not keep the server busy and is current the moment someone looks. A null
 * interval polls nothing.
 */
export default function usePolling(tick: () => void, interval: number | null) {
  const onTick = useEffectEvent(tick);

  useEffect(() => {
    if (interval === null) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") onTick();
    }, interval);
    const onVisibility = () => {
      if (document.visibilityState === "visible") onTick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [interval]);
}
