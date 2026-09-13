"use client";

import { evaluatePassword, MIN_PASSWORD_LENGTH, type PasswordContext } from "@/app/lib/passwordPolicy";

/**
 * Compact feedback under a new-password field.
 *
 * A checklist of every rule took more room than the rest of the form, so the
 * blocking rules are stated as one line naming what is still missing, and the
 * advisory ones are folded into the bar — adding a symbol visibly moves it
 * without spending a line on saying so.
 *
 * Colours avoid `dark:` variants on purpose: this renders both on the
 * dark-only auth screens and on the theme-aware profile page.
 */

const LEVELS = [
  { label: "Weak", bar: "bg-red-500", text: "text-red-500", filled: 1 },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-500", filled: 2 },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-600", filled: 3 },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-500", filled: 4 },
] as const;

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
}: {
  password: string;
  context?: PasswordContext;
  /** Turns the blocking line red; set once the user has tried to submit. */
  showFailures?: boolean;
}) {
  const { required, suggested, satisfied } = evaluatePassword(password, context);

  if (password.length === 0) {
    return (
      <p className="mt-2 text-xs text-zinc-500">
        At least {MIN_PASSWORD_LENGTH} characters. A passphrase works well.
      </p>
    );
  }

  const missing = required.filter((rule) => !rule.met);
  const weakSpots = suggested.filter((rule) => !rule.met);
  const level = strengthOf(password, satisfied);

  return (
    <div className="mt-2 space-y-1.5">
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
        <span className={`text-xs font-medium ${level.text}`}>{level.label}</span>
      </div>

      <p className={`text-xs ${missing.length > 0 && showFailures ? "text-red-500" : "text-zinc-500"}`}>
        {missing.length > 0
          ? missing.map((rule) => rule.label).join(" · ")
          : weakSpots.length > 0
            ? `Stronger with ${weakSpots.map((rule) => rule.short).join(", ")}.`
            : "Good to go."}
      </p>

      <p role="status" aria-live="polite" className="sr-only">
        {satisfied
          ? "Password meets every requirement."
          : `${missing.length} requirement${missing.length === 1 ? "" : "s"} left.`}
      </p>
    </div>
  );
}

export default PasswordStrength;
