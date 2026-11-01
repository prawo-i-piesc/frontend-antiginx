"use client";

import { useEffect, useState } from "react";

/** Longer than the slowest staggered entrance in globals.css: the last card's delay plus its rise. */
const ENTRANCE_MS = 600;

/**
 * True while a list's entrance animation plays after it mounts, then false.
 * Moving a DOM node restarts its CSS animation, so a list whose items are
 * reordered later (the widget board in customize mode) drops the animation
 * class once it has played instead of replaying it on every move.
 */
export default function useEntrance(): boolean {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setEntering(false), ENTRANCE_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return entering;
}
