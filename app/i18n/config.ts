/**
 * Languages the interface is translated into, and how one is chosen.
 *
 * The choice lives in a cookie rather than in the URL: every link the backend
 * puts in an email (/verify-email, /reset-password, /login/link) keeps working
 * unchanged, and the server still knows the language before it renders, so
 * `<html lang>` is right from the first byte — which is what a screen reader
 * uses to pick its pronunciation.
 */

export const LOCALES = ["pl", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** Used when neither the cookie nor the browser names a supported language. */
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "ag_locale";

/** A year: the choice is a preference, not a session. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Tags handed to Intl, so dates and numbers follow the interface language. */
export const INTL_LOCALES: Record<Locale, string> = {
  pl: "pl-PL",
  en: "en-GB",
};

/** Each language named in itself, the way a language picker should show it. */
export const LOCALE_NAMES: Record<Locale, string> = {
  pl: "Polski",
  en: "English",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported language from an Accept-Language header, honouring
 * the q-weights: "de-DE,de;q=0.9,pl;q=0.8,en;q=0.7" resolves to Polish.
 */
export function negotiateLocale(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const weight = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
      const quality = weight ? Number.parseFloat(weight.slice(2)) : 1;
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  const match = ranked.find((entry) => isLocale(entry.language));
  return match ? (match.language as Locale) : DEFAULT_LOCALE;
}
