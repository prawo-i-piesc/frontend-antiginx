"use client";

import { MotionConfig } from "framer-motion";

/**
 * Makes every framer-motion animation follow the system "reduce motion"
 * setting: movement and scaling are dropped, fades are kept.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export default MotionProvider;
