"use client";

import { useId } from "react";

import { evaluatePassword, type PasswordContext } from "@/app/lib/passwordPolicy";

/**
 * Live checklist under a new-password field.
 *
 * The list itself is not a live region — announcing it on every keystroke
 * would be unusable — so the input describes it on focus and a single hidden
 * status line reports how many rules are still open.
 */
export function PasswordRequirements({
  id,
  password,
  context,
  showFailures,
}: {
  id?: string;
  password: string;
  context?: PasswordContext;
  /** Turns unmet rules red; set once the user has tried to submit. */
  showFailures?: boolean;
}) {
  const fallbackId = useId();
  const listId = id ?? fallbackId;
  const { results, remaining, satisfied } = evaluatePassword(password, context);

  return (
    <div className="mt-3">
      <ul id={listId} className="space-y-1.5">
        {results.map((result) => {
          const failed = !result.met && showFailures;
          return (
            <li
              key={result.id}
              className={`flex items-start gap-2 text-xs transition-colors ${
                result.met ? "text-emerald-400" : failed ? "text-red-400" : "text-zinc-500"
              }`}
            >
              <i
                className={`mt-0.5 ${
                  result.met ? "ri-check-line" : failed ? "ri-close-line" : "ri-circle-line"
                }`}
                aria-hidden="true"
              />
              <span>{result.label}</span>
            </li>
          );
        })}
      </ul>

      <p role="status" aria-live="polite" className="sr-only">
        {password.length === 0
          ? ""
          : satisfied
            ? "Password meets every requirement."
            : `${remaining} password requirement${remaining === 1 ? "" : "s"} left.`}
      </p>
    </div>
  );
}

export default PasswordRequirements;
