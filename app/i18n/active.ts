import { DEFAULT_LOCALE, isLocale, type Locale } from "@/app/i18n/config";
import { MESSAGES, type Messages } from "@/app/i18n/messages";

/**
 * The interface language for code that runs outside React — API helpers that
 * build an error message, the report download.
 *
 * `<html lang>` is the source of truth: the server renders it from the same
 * cookie the provider reads, and switching languages updates it before
 * anything re-renders.
 *
 * Only call these from event handlers, effects and async callbacks. During a
 * render they would answer with the default language on the server and the
 * real one in the browser — a hydration mismatch. Components use useI18n().
 */
export function activeLocale(): Locale {
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang;
    if (isLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

export function activeMessages(): Messages {
  return MESSAGES[activeLocale()];
}
