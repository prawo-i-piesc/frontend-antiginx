"use client";

import { useId } from "react";

import { LOCALES, LOCALE_NAMES, type Locale } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import { MESSAGES } from "@/app/i18n/messages";
import { useToast } from "@/app/providers/ToastProvider";
import { ProfileCard } from "@/app/components/profile/ui";

/**
 * Settings that change how the app behaves for this person, starting with the
 * interface language. Inside the dashboard the switcher lives here rather
 * than in the top bar, where it sat on every page.
 */
export default function Preferences() {
  const { t, locale, setLocale } = useI18n();
  const toast = useToast();
  const id = useId();
  const hintId = `${id}-hint`;
  const copy = t.profile.preferences;

  const choose = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    // In the language just picked: that is the one the page is now in.
    toast.success(MESSAGES[next].profile.preferences.changed);
  };

  return (
    <ProfileCard title={copy.title} description={copy.description}>
      <fieldset aria-describedby={hintId} className="min-w-0 max-w-md">
        <legend className="mb-2 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {copy.language}
        </legend>

        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-700/60 dark:bg-zinc-900/40">
          {LOCALES.map((option) => {
            const checked = option === locale;
            return (
              <label
                key={option}
                className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors has-focus-visible:ring-2 has-focus-visible:ring-cyan-600 dark:has-focus-visible:ring-cyan-400 ${
                  checked
                    ? "bg-white text-cyan-700 shadow-sm dark:bg-zinc-800 dark:text-cyan-400"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-language`}
                  value={option}
                  checked={checked}
                  onChange={() => choose(option)}
                  className="sr-only"
                />
                {/* Not colour alone: the chosen option is also ticked. */}
                {checked ? <i className="ri-check-line" aria-hidden="true" /> : null}
                {/* Each language named in itself, and pronounced that way. */}
                <span lang={option}>{LOCALE_NAMES[option]}</span>
              </label>
            );
          })}
        </div>

        <p id={hintId} className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          {copy.languageHint}
        </p>
      </fieldset>
    </ProfileCard>
  );
}
