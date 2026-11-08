/** Page sizes the data tables offer. The admin API accepts 1–100 and defaults to 25. */
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/**
 * A table's page size: a fixed number, or "fit" for as many rows as the
 * window holds with the pager on screen (useFitRows). Fit is the default.
 */
export type SizeChoice = "fit" | number;

/** The size used before the window has been measured, e.g. while rendering on the server. */
export const FIT_FALLBACK = 14;
