"use client";

import React, { useId, useState } from "react";

/**
 * Form controls for the auth screens.
 *
 * Each field owns its label, its error and the wiring between them, so a
 * screen reader announces the problem with the input it belongs to rather
 * than leaving the user to guess which one is wrong.
 */

const BASE_INPUT =
  "w-full rounded-lg border bg-zinc-800/60 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:ring-2 focus:ring-cyan-500";

export function TextField({
  label,
  error,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${BASE_INPUT} ${error ? "border-red-500/60" : "border-zinc-700"}`}
      />
      {error ? (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
          <i className="ri-error-warning-line" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-2 text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  className = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string | null;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${BASE_INPUT} pr-12 ${error ? "border-red-500/60" : "border-zinc-700"}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-zinc-500 transition-colors hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <i className={visible ? "ri-eye-off-line" : "ri-eye-line"} aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
          <i className="ri-error-warning-line" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-2 text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
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
  return (
    <button
      type="submit"
      {...props}
      disabled={loading || props.disabled}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-linear-to-r from-cyan-600 to-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-cyan-700 hover:to-cyan-800 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <i className="ri-loader-4-line animate-spin" aria-hidden="true" />
          {loadingLabel ?? "Working…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start text-sm text-zinc-400">
      <input {...props} type="checkbox" className="peer sr-only" />
      <span className="mr-2 mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-sm border border-zinc-700 bg-zinc-800/60 peer-checked:border-cyan-500 peer-checked:bg-cyan-500 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400 peer-checked:[&>svg]:block">
        <svg
          className="hidden h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
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
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-zinc-800/60" />
      <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
      <div className="h-px flex-1 bg-zinc-800/60" />
    </div>
  );
}
