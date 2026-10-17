"use client";

import { useState } from "react";

import { LOCALES, LOCALE_NAMES, type Locale } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import { MESSAGES } from "@/app/i18n/messages";

const TONES = {
  /** The landing and auth screens, which are dark whatever the theme is. */
  dark: {
    group: "border-white/15 bg-white/5",
    active: "bg-white/15 text-white",
    idle: "text-zinc-300 hover:text-white",
  },
  /** The dashboard, which follows the theme. */
  auto: {
    group: "border-zinc-300/80 bg-zinc-100/80 dark:border-zinc-700/60 dark:bg-zinc-900/55",
    active: "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100",
    idle: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
  },
} as const;

/**
 * PL / EN toggle.
 *
 * Each button is named in its own language ("Polski (PL)", "English (EN)")
 * and carries a matching `lang`, so a screen reader pronounces it correctly
 * whichever language the page is in; the visible code stays part of the name
 * for anyone driving the page by voice.
 */
export default function LanguageSwitcher({
  tone = "auto",
  className = "",
}: {
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();
  const [announcement, setAnnouncement] = useState("");
  const styles = TONES[tone];

  const choose = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    // Said in the new language, which is the one the page is now in.
    setAnnouncement(MESSAGES[next].common.language.changed);
  };

  return (
    <div
      role="group"
      aria-label={t.common.language.label}
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${styles.group} ${className}`}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            aria-label={`${LOCALE_NAMES[option]} (${option.toUpperCase()})`}
            onClick={() => choose(option)}
            className={`h-7 min-w-9 cursor-pointer rounded-full px-2 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
              active ? styles.active : styles.idle
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
