"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "@/app/i18n/config";
import { getFormatters, type Formatters } from "@/app/i18n/format";
import { MESSAGES, type Messages } from "@/app/i18n/messages";

interface I18nContextValue {
  locale: Locale;
  /** The dictionary for the current language: `t.auth.login.title`. */
  t: Messages;
  /** Dates and numbers in the current language. */
  format: Formatters;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function saveLocale(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function I18nProvider({
  locale: serverLocale,
  children,
}: {
  /** Resolved on the server from the cookie or Accept-Language. */
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [locale, setLocaleState] = useState(serverLocale);

  // A refresh after the cookie changed in another tab renders a new server
  // locale; follow it instead of holding on to the old one.
  const [lastServerLocale, setLastServerLocale] = useState(serverLocale);
  if (serverLocale !== lastServerLocale) {
    setLastServerLocale(serverLocale);
    setLocaleState(serverLocale);
  }

  const setLocale = useCallback(
    (next: Locale) => {
      saveLocale(next);
      // Before the re-render, so code outside React (error messages built in
      // the API helpers) already sees the new language.
      document.documentElement.lang = next;
      setLocaleState(next);
      // Client components switch at once; the refresh brings the parts the
      // server renders — the document title — into the same language.
      startTransition(() => router.refresh());
    },
    [router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: MESSAGES[locale], format: getFormatters(locale), setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

export default I18nProvider;
