"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Form controls for the auth screens.
 *
 * Each field owns its label, its error and the wiring between them, so a
 * screen reader announces the problem with the input it belongs to rather
 * than leaving the user to guess which one is wrong.
 */

const BASE_INPUT =
  "w-full rounded-lg border bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:ring-2 focus:ring-cyan-500";

/** zinc-500 is the darkest grey that still sets a field off from the card at 3:1 (WCAG 1.4.11). */
function borderFor(invalid: boolean): string {
  return invalid ? "border-red-500" : "border-zinc-500";
}

type InputProps = React.ComponentProps<"input">;

/**
 * A field is invalid when it has an error, or when the caller says so: the
 * password meter states what is wrong under the field rather than in it.
 */
function isInvalid(error: string | null | undefined, marked: InputProps["aria-invalid"]): boolean {
  return Boolean(error) || marked === true || marked === "true";
}

/** The field's own error or hint first, then anything the caller links in. */
function describedBy(own: string | undefined, linked: string | undefined): string | undefined {
  return [own, linked].filter(Boolean).join(" ") || undefined;
}

function FieldMessage({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
        <i className="ri-error-warning-line" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-zinc-400">
        {hint}
      </p>
    );
  }
  return null;
}

function ownDescription(id: string, error: string | null | undefined, hint: string | undefined) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({
  label,
  error,
  hint,
  className = "",
  "aria-invalid": markedInvalid,
  "aria-describedby": linked,
  ...props
}: InputProps & {
  label: string;
  error?: string | null;
  hint?: string;
}) {
  const id = useId();
  const invalid = isInvalid(error, markedInvalid);

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-400">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(ownDescription(id, error, hint), linked)}
        className={`${BASE_INPUT} ${borderFor(invalid)}`}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  className = "",
  /** Rendered opposite the label, so a link does not cost its own row. */
  labelAction,
  "aria-invalid": markedInvalid,
  "aria-describedby": linked,
  ...props
}: Omit<InputProps, "type"> & {
  label: string;
  error?: string | null;
  hint?: string;
  labelAction?: React.ReactNode;
}) {
  const { t } = useI18n();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const invalid = isInvalid(error, markedInvalid);

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm text-zinc-400">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy(ownDescription(id, error, hint), linked)}
          className={`${BASE_INPUT} pr-12 ${borderFor(invalid)}`}
        />
        {/* A toggle with a fixed name: "pressed" is what tells the state. */}
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={t.auth.fields.showPassword}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-zinc-500 transition-colors hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <i className={visible ? "ri-eye-off-line" : "ri-eye-line"} aria-hidden="true" />
        </button>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function SubmitButton({
  loading,
  loadingLabel,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
}) {
  const { t } = useI18n();

  return (
    <button
      type="submit"
      {...props}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-linear-to-r from-cyan-700 to-cyan-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-cyan-800 hover:to-cyan-900 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <i className="ri-loader-4-line animate-spin" aria-hidden="true" />
          {loadingLabel ?? t.common.working}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Checkbox({
  label,
  error,
  className = "",
  ...props
}: Omit<InputProps, "type"> & {
  label: React.ReactNode;
  error?: string | null;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start text-sm text-zinc-400">
        <input
          {...props}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="peer sr-only"
        />
        {/* The input is visually hidden, so this box draws its state and its
            focus indicator: an outline rather than a ring, and a check in the
            box's own text colour, both of which forced-colours mode keeps. */}
        <span
          className={`mr-2 mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-sm border bg-zinc-800/60 text-white peer-checked:border-cyan-500 peer-checked:bg-cyan-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-400 peer-checked:[&>svg]:block ${borderFor(Boolean(error))}`}
        >
          <svg
            className="hidden h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span>{label}</span>
      </label>
      {error ? (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
          <i className="ri-error-warning-line" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-800/60" />
      <span className="text-xs uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="h-px flex-1 bg-zinc-800/60" />
    </div>
  );
}

/**
 * Keeps keyboard focus useful across a failed submit.
 *
 * Fields and buttons are disabled while a request runs, and a focused control
 * that gets disabled drops focus to the page, so Tab would start over from the
 * top. Once the error has rendered, `focusAfterFailure()` moves focus to the
 * first field marked invalid — a screen reader reads its error out with it —
 * or else back to the control that had it; `restoreFocus()` only does the
 * latter.
 *
 * `formRef` and `trackFocus` (as onFocus) go on the form, or on whatever holds
 * the controls.
 */
export function useFormFocus<T extends HTMLElement = HTMLFormElement>() {
  const formRef = useRef<T>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const [request, setRequest] = useState<{ invalidFirst: boolean } | null>(null);

  useEffect(() => {
    if (!request) return;

    const invalid = request.invalidFirst
      ? formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
      : null;
    if (invalid) {
      // Enter pressed in the field leaves focus on it, and focusing it again
      // announces nothing; blurring first gets the new error read out.
      if (document.activeElement === invalid) invalid.blur();
      invalid.focus();
      return;
    }

    const active = document.activeElement;
    if ((!active || active === document.body) && lastFocused.current?.isConnected) {
      lastFocused.current.focus();
    }
  }, [request]);

  const trackFocus = useCallback((event: React.FocusEvent) => {
    if (event.target instanceof HTMLElement) lastFocused.current = event.target;
  }, []);
  const focusAfterFailure = useCallback(() => setRequest({ invalidFirst: true }), []);
  const restoreFocus = useCallback(() => setRequest({ invalidFirst: false }), []);

  return { formRef, trackFocus, focusAfterFailure, restoreFocus };
}
