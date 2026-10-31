"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

import { BUTTON_BASE, BUTTON_VARIANTS, buttonClass } from "@/app/components/ui/buttonStyles";
import { SURFACE } from "@/app/components/ui/surface";
import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Shared shell and controls for the profile sections, so the three of them
 * stay one design instead of three copies that drift apart.
 */

export function ProfileCard({
  title,
  description,
  aside,
  headingRef,
  children,
}: {
  title: string;
  description: string;
  aside?: React.ReactNode;
  /** For a section that sends focus to its heading when the control that had it is gone. */
  headingRef?: React.Ref<HTMLHeadingElement>;
  children: React.ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`${SURFACE} p-4 sm:p-6`}
    >
      {/* No wrapping: the status belongs in the corner, so the heading column
          shrinks instead of pushing it onto its own line. */}
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700/50">
        <div className="min-w-0">
          <h2
            id={headingId}
            ref={headingRef}
            tabIndex={headingRef ? -1 : undefined}
            className="text-lg font-semibold text-zinc-900 focus:outline-none dark:text-zinc-100"
          >
            {title}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
        {aside ? <div className="flex-none">{aside}</div> : null}
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
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
      }`}
    >
      <i className={on ? "ri-shield-check-line" : "ri-shield-line"} aria-hidden="true" />
      {on ? onLabel : offLabel}
    </span>
  );
}

const INPUT =
  "w-full h-12 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 dark:placeholder-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-cyan-400 transition-all";

/**
 * React focuses an autoFocus field the moment it mounts, which inside a dialog
 * is before showModal() has made it visible — so that focus is lost. The
 * dialog then chooses its own initial focus, and it looks for this attribute.
 */
function markAutofocus(node: HTMLInputElement | null) {
  node?.setAttribute("autofocus", "");
}

export function ProfileField({
  label,
  icon,
  error,
  hint,
  invalid,
  describedBy,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: string;
  error?: string | null;
  hint?: string;
  /** Invalid, with the message shown elsewhere — the password strength meter. */
  invalid?: boolean;
  /** Ids of further elements describing the field, read after its own message. */
  describedBy?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const description = [error ? errorId : hint ? hintId : null, describedBy].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
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
          ref={props.autoFocus ? markAutofocus : undefined}
          id={id}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={description || undefined}
          className={`${INPUT} pl-11 ${
            error || invalid
              ? "border-rose-500/60"
              : "border-zinc-300 focus:border-cyan-500/50 dark:border-zinc-700/60"
          }`}
        />
      </div>
      {/* Rendered before there is anything to say, so a message is announced
          when it arrives — also when focus is already in the field. */}
      <p
        id={errorId}
        role="alert"
        className={error ? "mt-2 flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-400" : undefined}
      >
        {error ? (
          <>
            <i className="ri-error-warning-line" aria-hidden="true" />
            {error}
          </>
        ) : null}
      </p>
      {!error && hint ? (
        <p id={hintId} className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * After a failed submit, focus goes to the first field marked invalid, so the
 * keyboard and the screen reader start where the fix is needed. Call the
 * returned function in the same update that sets the errors; the search runs
 * once they are rendered and the fields are enabled again.
 */
export function useFocusFirstInvalid<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (request === 0) return;
    ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [request]);

  const focusFirstInvalid = useCallback(() => setRequest((count) => count + 1), []);

  return [ref, focusFirstInvalid] as const;
}

/**
 * A button label plus words only a screen reader needs: "Change" on screen,
 * "Change username" in a list of buttons. The visible text comes first, so a
 * voice command that names it still matches (WCAG 2.5.3). The context sits
 * inside the label's span because ROW_SIZE un-hides that span from sm up.
 */
export function ActionLabel({ label, context }: { label: string; context?: string }) {
  return (
    <span>
      {label}
      {context ? <span className="sr-only"> {context}</span> : null}
    </span>
  );
}

/**
 * Row actions shrink to the icon on a phone, where a column of full-width
 * labelled buttons crowds out what the rows actually say. The label goes to
 * sr-only rather than hidden, so the button keeps its name for a screen reader.
 */
const ROW_SIZE =
  "h-11 w-11 px-0 text-sm sm:h-9 sm:w-auto sm:px-3.5 [&>span]:sr-only sm:[&>span]:not-sr-only";

// The app's shared button styles, so the profile matches every other view.
export const BUTTON_PRIMARY = buttonClass("primary");
export const BUTTON_QUIET = buttonClass("secondary");
export const BUTTON_DANGER = buttonClass("danger");

// A row action changes one thing among many, so even the main one is not solid.
export const ROW_BUTTON_PRIMARY = `${BUTTON_BASE} ${ROW_SIZE} ${BUTTON_VARIANTS.secondary}`;
export const ROW_BUTTON_QUIET = `${BUTTON_BASE} ${ROW_SIZE} ${BUTTON_VARIANTS.secondary}`;
export const ROW_BUTTON_DANGER = `${BUTTON_BASE} ${ROW_SIZE} ${BUTTON_VARIANTS.danger}`;

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
  on: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  off: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
} as const;

export function SecurityRow({
  icon,
  tone,
  title,
  detail,
  detailId,
  action,
}: {
  icon: string;
  tone: keyof typeof TONE_STYLES;
  title: string;
  detail: string;
  /** Lets the action point at the detail, e.g. to say why it is unavailable. */
  detailId?: string;
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
        <p id={detailId} className="text-sm text-zinc-600 dark:text-zinc-400">
          {detail}
        </p>
      </div>
      {action}
    </div>
  );
}


/**
 * A setting shown as what it currently is, with the form folded away behind it.
 *
 * Most of these are changed once and then never again, so leaving every field
 * open turns the page into a wall of inputs. Collapsed, it reads as a list of
 * facts about the account; the form appears only when you go to change one.
 */
export function ExpandableRow({
  icon,
  title,
  value,
  valueLabel,
  actionLabel,
  actionContext,
  cancelContext,
  open,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  value: string;
  /** Read instead of `value` when that is not words, like the dots standing in for a password. */
  valueLabel?: string;
  actionLabel: string;
  /** Read after the visible label, see ActionLabel. */
  actionContext?: string;
  /** The same for the Cancel the button turns into while the form is open. */
  cancelContext?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const regionId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  // Saving closes the form while focus is still inside it. Focus that went
  // down with the form comes back to the button rather than the page top.
  useEffect(() => {
    if (wasOpen.current && !open) {
      const active = document.activeElement;
      if (!active || active === document.body) toggleRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
          <i className={`${icon} text-lg`} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">{title}</p>
          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
            {valueLabel ? (
              <>
                <span aria-hidden="true">{value}</span>
                <span className="sr-only">{valueLabel}</span>
              </>
            ) : (
              value
            )}
          </p>
        </div>
        <button
          ref={toggleRef}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={regionId}
          className={open ? ROW_BUTTON_QUIET : ROW_BUTTON_PRIMARY}
        >
          <i className={open ? "ri-close-line" : "ri-ball-pen-line"} aria-hidden="true" />
          <ActionLabel
            label={open ? t.common.cancel : actionLabel}
            context={open ? cancelContext : actionContext}
          />
        </button>
      </div>

      <div id={regionId} hidden={!open} className="mt-5">
        {open ? children : null}
      </div>
    </div>
  );
}
