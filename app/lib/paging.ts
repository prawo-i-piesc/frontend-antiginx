/** Page sizes the data tables offer. The admin API accepts 1–100 and defaults to 25. */
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/**
 * A table's page size: a fixed number, or "fit" for as many rows as the
 * window holds with the pager on screen (useFitRows). Fit is the default.
 */
export type SizeChoice = "fit" | number;

/** Stands in for a fitted page size until the window has been measured. Nothing is loaded with it: see useAddressPaging's `ready`. */
export const FIT_FALLBACK = 14;
