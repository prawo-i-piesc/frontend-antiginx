"use client";

import React, { useId } from "react";

/**
 * Shared shell and controls for the profile sections, so the three of them
 * stay one design instead of three copies that drift apart.
 */

export function ProfileCard({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-300 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-500/30 dark:bg-zinc-900/20">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700/50">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        on
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <i className={on ? "ri-shield-check-line" : "ri-shield-line"} aria-hidden="true" />
      {on ? onLabel : offLabel}
    </span>
  );
}

const INPUT =
  "w-full h-12 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all";

export function ProfileField({
  label,
  icon,
  error,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: string;
  error?: string | null;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
      >
        {label}
      </label>
      <div className="relative">
        <i
          className={`${icon} absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500`}
          aria-hidden="true"
        />
        <input
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${INPUT} pl-11 ${
            error
              ? "border-rose-500/60"
              : "border-zinc-300 focus:border-cyan-500/50 dark:border-zinc-700/60"
          }`}
        />
      </div>
      {error ? (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-sm text-rose-500">
          <i className="ri-error-warning-line" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const BUTTON_BASE =
  "h-12 px-6 rounded-xl transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";

export const BUTTON_PRIMARY = `${BUTTON_BASE} border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60`;
export const BUTTON_QUIET = `${BUTTON_BASE} border border-zinc-300 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800/50`;
export const BUTTON_DANGER = `${BUTTON_BASE} border border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15`;

export function SubmitRow({
  busy,
  label,
  icon,
  disabled,
  children,
}: {
  busy: boolean;
  label: string;
  icon: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      {children}
      <button type="submit" disabled={busy || disabled} className={BUTTON_PRIMARY}>
        <i className={busy ? "ri-loader-4-line animate-spin" : icon} aria-hidden="true" />
        <span>{label}</span>
      </button>
    </div>
  );
}

const TONE_STYLES = {
  on: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  off: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
} as const;

export function SecurityRow({
  icon,
  tone,
  title,
  detail,
  action,
}: {
  icon: string;
  tone: keyof typeof TONE_STYLES;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
      <span
        className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${TONE_STYLES[tone]}`}
      >
        <i className={`${icon} text-lg`} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{detail}</p>
      </div>
      {action}
    </div>
  );
}

