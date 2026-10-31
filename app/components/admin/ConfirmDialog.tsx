"use client";

import { useId, useState } from "react";

import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_QUIET } from "@/app/components/profile/ui";
import Dialog from "@/app/components/ui/Dialog";
import { useI18n } from "@/app/i18n/I18nProvider";
import { ApiError } from "@/app/lib/authErrors";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  /**
   * Text the admin has to type before the action goes through — the email of
   * an account about to be deleted. Compared ignoring case and outer spaces.
   */
  confirmText?: string;
  confirmTextLabel?: string;
  mismatch?: string;
  /** Rejects to keep the dialog open with the reason; resolves to close it. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/**
 * The one step between an admin action and the API. Cancel comes first in the
 * markup, so it is what the dialog focuses when there is nothing to type.
 */
export default function ConfirmDialog(props: ConfirmDialogProps) {
  const id = useId();

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      labelledBy={`${id}-title`}
      describedBy={`${id}-description`}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-zinc-300 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/70 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {/* Mounted per opening, so a second opening starts from a clean form. */}
      <ConfirmForm id={id} {...props} />
    </Dialog>
  );
}

function ConfirmForm({
  id,
  title,
  description,
  confirmLabel,
  tone = "danger",
  confirmText,
  confirmTextLabel,
  mismatch,
  onConfirm,
  onClose,
}: ConfirmDialogProps & { id: string }) {
  const { t } = useI18n();
  const [typed, setTyped] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const matches = confirmText === undefined || typed.trim().toLowerCase() === confirmText.trim().toLowerCase();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!matches) {
      setFieldError(mismatch ?? null);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (failure) {
      setError(
        failure instanceof ApiError
          ? failure.message
          : failure instanceof TypeError
            ? t.common.networkError
            : t.common.genericError,
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="p-6" noValidate>
      <h2 id={`${id}-title`} className="text-lg font-semibold">
        {title}
      </h2>
      <p id={`${id}-description`} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 wrap-anywhere">
        {description}
      </p>

      {confirmText !== undefined ? (
        <div className="mt-5">
          <label htmlFor={`${id}-confirm`} className="mb-2 block text-xs text-zinc-600 dark:text-zinc-400">
            {confirmTextLabel}{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100 wrap-anywhere">{confirmText}</span>
          </label>
          <input
            id={`${id}-confirm`}
            value={typed}
            onChange={(event) => {
              setTyped(event.target.value);
              setFieldError(null);
            }}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={`${id}-confirm-error`}
            className={`h-10 w-full rounded-lg border bg-zinc-50 px-3 text-sm dark:bg-zinc-950/50 ${
              fieldError ? "border-rose-500/60" : "border-zinc-300 dark:border-zinc-700/70"
            }`}
          />
          <p id={`${id}-confirm-error`} className="mt-1.5 min-h-4 text-xs text-rose-700 dark:text-rose-400">
            {fieldError}
          </p>
        </div>
      ) : null}

      {/* In the tree before there is anything to say, so the reason is announced. */}
      <p role="alert" className="text-sm text-rose-700 not-empty:mt-3 dark:text-rose-400">
        {error}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={BUTTON_QUIET}>
          {t.common.cancel}
        </button>
        <button
          type="submit"
          aria-disabled={busy || !matches || undefined}
          className={tone === "danger" ? BUTTON_DANGER : BUTTON_PRIMARY}
        >
          {busy ? <i className="ri-loader-4-line animate-spin" aria-hidden="true" /> : null}
          {busy ? t.common.working : confirmLabel}
        </button>
      </div>
    </form>
  );
}
