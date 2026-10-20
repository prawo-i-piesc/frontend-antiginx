import type { Variants } from "framer-motion";

/**
 * Same fade-and-rise the landing page opens with, toned down: the blocks come
 * in one after another rather than as one slab. Shared by the auth card and
 * the pricing page, so the two move alike. With reduced motion only the fade
 * is left. `delay` holds the first block back, for a group that should follow
 * another one onto the screen.
 */
export function entrance(reduced: boolean | null, delay = 0.04): { container: Variants; item: Variants } {
  return {
    container: {
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : 0.07, delayChildren: reduced ? 0 : delay } },
    },
    item: {
      hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduced ? 0.15 : 0.35, ease: "easeOut" },
      },
    },
  };
}
