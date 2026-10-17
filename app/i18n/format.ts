import { INTL_LOCALES, type Locale } from "@/app/i18n/config";

/**
 * Locale-aware formatting for dates and numbers.
 *
 * `toLocaleString()` without an argument follows the browser, not the language
 * the interface is shown in, which put English month names next to Polish
 * labels. Everything goes through here instead.
 */

export interface Formatters {
  /** 7 Oct 2026 / 7 paź 2026 */
  date: (value: string | number | Date | null | undefined) => string;
  /** 7 Oct 2026, 14:05 / 7 paź 2026, 14:05 */
  dateTime: (value: string | number | Date | null | undefined) => string;
  /** 1,234 / 1 234 */
  number: (value: number) => string;
}

/** Shown for a missing or unparseable value. */
const EMPTY = "—";

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const cache = new Map<Locale, Formatters>();

export function getFormatters(locale: Locale): Formatters {
  const cached = cache.get(locale);
  if (cached) return cached;

  const tag = INTL_LOCALES[locale];
  const dateFormat = new Intl.DateTimeFormat(tag, { dateStyle: "medium" });
  const dateTimeFormat = new Intl.DateTimeFormat(tag, { dateStyle: "medium", timeStyle: "short" });
  const numberFormat = new Intl.NumberFormat(tag);

  const formatters: Formatters = {
    date: (value) => {
      const date = toDate(value);
      return date ? dateFormat.format(date) : EMPTY;
    },
    dateTime: (value) => {
      const date = toDate(value);
      return date ? dateTimeFormat.format(date) : EMPTY;
    },
    number: (value) => numberFormat.format(value),
  };

  cache.set(locale, formatters);
  return formatters;
}
