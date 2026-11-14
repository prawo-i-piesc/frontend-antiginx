/** Page sizes the data tables offer. The admin API accepts 1–100 and defaults to 25. */
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/**
 * A table's page size: a fixed number, or "fit" for as many rows as the
 * window holds with the pager on screen (useFitRows). Fit is the default.
 */
export type SizeChoice = "fit" | number;

/**
 * Stands in for a fitted page size until the window has been measured, which
 * happens before the first paint. Nothing is loaded with it (useAddressPaging's
 * `ready`), and it is as few rows as a fitted page has, so the placeholders
 * standing in for the rows never make the page scroll before that.
 */
export const FIT_FALLBACK = 5;
