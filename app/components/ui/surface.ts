/**
 * The card every dashboard widget and data table sits on, so the overview,
 * the scanner and the admin lists read as one interface.
 */
export const SURFACE =
  "rounded-xl border border-zinc-300 bg-white/85 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30";

/**
 * Accent colours for icons and bars. Icons use the 700 shades on the light
 * theme: the 400 ones fall below 3:1 on white (WCAG 1.4.11).
 */
export const TONES = {
  cyan: { icon: "text-cyan-700 dark:text-cyan-400", bar: "bg-cyan-500" },
  emerald: { icon: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" },
  rose: { icon: "text-rose-700 dark:text-rose-400", bar: "bg-rose-500" },
  orange: { icon: "text-orange-700 dark:text-orange-400", bar: "bg-orange-500" },
  amber: { icon: "text-amber-700 dark:text-amber-400", bar: "bg-amber-500" },
  violet: { icon: "text-violet-700 dark:text-violet-400", bar: "bg-violet-500" },
  sky: { icon: "text-sky-700 dark:text-sky-400", bar: "bg-sky-500" },
} as const;

export type Tone = keyof typeof TONES;
