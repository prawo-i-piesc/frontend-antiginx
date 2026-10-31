/** Page sizes the data tables offer. The admin API accepts 1–100 and defaults to 25. */
export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/** The scanner's own list, paged in the browser, starts shorter: 14 rows. */
export const SCAN_LIST_SIZES = [14, 25, 50, 100] as const;
