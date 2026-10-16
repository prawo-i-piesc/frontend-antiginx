"use client";

import { useMemo } from "react";

import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  evaluatePassword,
  MIN_PASSWORD_LENGTH,
  type PasswordContext,
  type RequiredRuleId,
} from "@/app/lib/passwordPolicy";

/**
 * Compact feedback under a new-password field.
 *
 * A checklist of every rule took more room than the rest of the form, so the
 * blocking rules are stated as one line naming what is still missing, and the
 * advisory ones are folded into the bar — adding a symbol visibly moves it
 * without spending a line on saying so.
 *
 * The auth screens are dark whatever the theme is, so `dark:` variants cannot
 * tell them apart from the profile page; `tone` picks the colours instead.
 */

const LEVELS = [
  {
    id: "weak",
    bar: "bg-red-500",
    text: { dark: "text-red-500", auto: "text-red-700 dark:text-red-500" },
    filled: 1,
  },
  {
    id: "fair",
    bar: "bg-amber-500",
    text: { dark: "text-amber-500", auto: "text-amber-700 dark:text-amber-500" },
    filled: 2,
  },
  {
    id: "good",
    bar: "bg-lime-500",
    text: { dark: "text-lime-600", auto: "text-lime-700 dark:text-lime-600" },
    filled: 3,
  },
  {
    id: "strong",
    bar: "bg-emerald-500",
    text: { dark: "text-emerald-500", auto: "text-emerald-700 dark:text-emerald-500" },
    filled: 4,
  },
] as const;

/** Text colours that keep 4.5:1 on each surface. */
const TONES = {
  /** The auth screens. */
  dark: { muted: "text-zinc-400", failure: "text-red-500" },
  /** Pages that follow the theme. */
  auto: { muted: "text-zinc-600 dark:text-zinc-400", failure: "text-red-700 dark:text-red-500" },
} as const;

const SEGMENTS = 4;

/**
 * Rough stand-in for how much guessing a password would take: every character
 * counts, and each extra character class is worth a few more.
 *
 * Length has to dominate, or a long passphrase — the thing the policy actually
 * wants — scores below a short password with a digit stapled on the end.
 */
export function strengthOf(password: string, meetsRequired: boolean): (typeof LEVELS)[number] {
  if (!meetsRequired) return LEVELS[0];

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password),
  ).length;
  const effort = password.length + (classes - 1) * 4;

  if (effort < 18) return LEVELS[1];
  if (effort < 24) return LEVELS[2];
  return LEVELS[3];
}

export function PasswordStrength({
  password,
  context,
  showFailures,
  id,
  tone = "auto",
}: {
  password: string;
  context?: PasswordContext;
  /** Turns the blocking line red; set once the user has tried to submit. */
  showFailures?: boolean;
  /**
   * Put on the line that says what is missing, so the field can point
   * `aria-describedby` at it.
   */
  id?: string;
  tone?: keyof typeof TONES;
}) {
  const { t, locale } = useI18n();
  const copy = t.password;
  const styles = TONES[tone];
  const list = useMemo(
    () => new Intl.ListFormat(INTL_LOCALES[locale], { type: "conjunction" }),
    [locale],
  );

  const { required, suggested, satisfied, remaining } = evaluatePassword(password, context);
  const empty = password.length === 0;

  const requiredLabels: Record<RequiredRuleId, string> = {
    length: copy.required.length(MIN_PASSWORD_LENGTH),
    obvious: copy.required.obvious,
  };

  const missing = required.filter((rule) => !rule.met);
  const weakSpots = suggested.filter((rule) => !rule.met);
  const level = strengthOf(password, satisfied);

  return (
    <div className="mt-2">
      {empty ? (
        <p id={id} className={`text-xs ${styles.muted}`}>
          {copy.hint(MIN_PASSWORD_LENGTH)}
        </p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="flex h-1 flex-1 gap-1" aria-hidden="true">
              {Array.from({ length: SEGMENTS }, (_, index) => (
                <span
                  key={index}
                  className={`flex-1 rounded-full transition-colors ${
                    index < level.filled ? level.bar : "bg-zinc-500/25"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${level.text[tone]}`}>
              <span className="sr-only">{copy.strength} </span>
              {copy.levels[level.id]}
            </span>
          </div>

          <p
            id={id}
            className={`mt-1.5 text-xs ${missing.length > 0 && showFailures ? styles.failure : styles.muted}`}
          >
            {missing.length > 0
              ? missing.map((rule) => requiredLabels[rule.id]).join(" · ")
              : weakSpots.length > 0
                ? copy.strongerWith(list.format(weakSpots.map((rule) => copy.suggestions[rule.id])))
                : copy.allGood}
          </p>
        </>
      )}

      {/* Rendered even while empty: a live region has to exist before its text changes. */}
      <p role="status" className="sr-only">
        {empty ? "" : satisfied ? copy.status.met : copy.status.remaining(remaining)}
      </p>
    </div>
  );
}

export default PasswordStrength;
