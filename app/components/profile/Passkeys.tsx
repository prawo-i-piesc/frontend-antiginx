"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";
import type { Messages } from "@/app/i18n/messages";
import { ApiError } from "@/app/lib/authErrors";
import {
  deletePasskey,
  listPasskeys,
  passkeysSupported,
  registerPasskey,
  setPasskeyMode,
  type PasskeyCredential,
  type PasskeyMode,
} from "@/app/lib/webauthnApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import Modal from "@/app/components/profile/Modal";
import {
  ActionLabel,
  BUTTON_PRIMARY,
  BUTTON_QUIET,
  ProfileField,
  ROW_BUTTON_PRIMARY,
  ROW_BUTTON_QUIET,
  SecurityRow,
} from "@/app/components/profile/ui";

const MODES = [
  { value: "second_factor", copy: "secondFactor" },
  { value: "passwordless", copy: "passwordless" },
] as const satisfies readonly { value: PasskeyMode; copy: string }[];

type DeviceNames = Messages["profile"]["passkeys"]["deviceNames"];

function defaultName(names: DeviceNames): string {
  if (typeof navigator === "undefined") return names.fallback;
  const agent = navigator.userAgent;
  if (/iPhone|iPad/.test(agent)) return "iPhone";
  if (/Macintosh/.test(agent)) return "Mac";
  if (/Android/.test(agent)) return names.android;
  if (/Windows/.test(agent)) return names.windows;
  return names.fallback;
}

/**
 * Passkeys sit alongside the authenticator app rather than replacing it: one
 * is a second step after a password, the other replaces the password outright.
 */
export default function Passkeys() {
  const { t, format } = useI18n();
  const copy = t.profile.passkeys;
  const { user, reloadUser } = useAuth();
  const toast = useToast();

  const id = useId();
  const modeDetailId = `${id}-mode-detail`;
  const listHeadingId = `${id}-list`;
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const wasAdding = useRef(false);

  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<PasskeyCredential[] | null>(null);
  const [name, setName] = useState(() => defaultName(copy.deviceNames));
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingMode, setPendingMode] = useState<PasskeyMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supported = passkeysSupported();
  const count = credentials?.length ?? (user?.auth?.mfa.webauthn_enabled ? 1 : 0);
  const mode: PasskeyMode = user?.auth?.passkey_mode ?? "second_factor";
  // Shown as chosen while the request runs, so arrowing through the options
  // does not snap back under the cursor.
  const shownMode = pendingMode ?? mode;
  const shownModeCopy = copy.mode[shownMode === "passwordless" ? "passwordless" : "secondFactor"];
  // Nothing can go in front of a passkey on an account with no password, so
  // there is no choice to offer — the backend reports it as passwordless.
  const canChooseMode = user?.auth?.password_set ?? true;

  // The add panel closes — created or cancelled — with focus inside it; the
  // button that opened it is where focus comes back to.
  useEffect(() => {
    if (wasAdding.current && !adding) {
      const active = document.activeElement;
      if (!active || active === document.body) addButtonRef.current?.focus();
    }
    wasAdding.current = adding;
  }, [adding]);

  const fail = (caught: unknown) =>
    toast.error(caught instanceof ApiError ? caught.message : t.common.networkError);

  const load = async () => {
    try {
      setCredentials(await listPasskeys());
    } catch (caught) {
      fail(caught);
    }
  };

  const openManager = () => {
    setOpen(true);
    setAdding(false);
    setError(null);
    void load();
  };

  const startAdding = () => {
    if (busy) return;
    setName(defaultName(copy.deviceNames));
    setAdding(true);
    setError(null);
  };

  const add = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await registerPasskey(name.trim() || defaultName(copy.deviceNames));
      setAdding(false);
      await load();
      void reloadUser();
      toast.success(copy.added);
    } catch (caught) {
      // The add panel is still open, so the reason is shown in it.
      setError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error && caught.name === "NotAllowedError"
            ? copy.dismissed
            : caught instanceof Error && caught.message === "cancelled"
              ? copy.notCreated
              : copy.deviceFailed,
      );
    } finally {
      setBusy(false);
    }
  };

  // Arrow keys change a radio group's choice, each one a request; `busy` keeps
  // a second from starting while the first is still on its way.
  const changeMode = async (next: PasskeyMode) => {
    if (busy || next === mode) return;
    setBusy(true);
    setPendingMode(next);
    setError(null);
    try {
      await setPasskeyMode(next);
      await reloadUser();
      toast.success(copy.mode[next === "passwordless" ? "passwordless" : "secondFactor"].changed);
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
      setPendingMode(null);
    }
  };

  const remove = async (credential: PasskeyCredential) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await deletePasskey(credential.id);
      await load();
      void reloadUser();
      toast.success(copy.removed(credential.name));
      // The row and its button are gone; the list's heading is the nearest
      // place left for focus.
      listHeadingRef.current?.focus();
    } catch (caught) {
      fail(caught);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SecurityRow
      icon="ri-fingerprint-line"
      tone={count > 0 ? "on" : "off"}
      title={copy.title}
      detail={
        !supported ? copy.unsupported : count > 0 ? `${copy.count(count)} ${copy.pitch}` : copy.pitch
      }
      action={
        supported ? (
          <>
            <button
              type="button"
              onClick={openManager}
              className={count > 0 ? ROW_BUTTON_QUIET : ROW_BUTTON_PRIMARY}
            >
              <i className="ri-fingerprint-line" aria-hidden="true" />
              {count > 0 ? (
                <ActionLabel label={copy.manage} context={copy.manageContext} />
              ) : (
                <span>{copy.add}</span>
              )}
            </button>

            {/* Inside the row rather than after it: a closed <dialog> is still
                an element, and the list's divide-y and first:/last: rules
                would count it as a row. */}
            <Modal
              open={open}
              onClose={() => setOpen(false)}
              title={copy.dialog.title}
              description={copy.dialog.description}
            >
              <div className="space-y-6">
                {count > 0 && !canChooseMode ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{copy.passwordlessOnly}</p>
                ) : null}

                {count > 0 && canChooseMode ? (
                  // Native radios: arrow keys, a single tab stop and the checked
                  // state come with them; the labels carry the segmented look.
                  <fieldset aria-describedby={modeDetailId} className="min-w-0">
                    <legend className="mb-2 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      {copy.mode.legend}
                    </legend>

                    <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-700/60 dark:bg-zinc-900/40">
                      {MODES.map((option) => {
                        const checked = shownMode === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:ring-2 has-focus-visible:ring-cyan-600 dark:has-focus-visible:ring-cyan-400 ${
                              checked
                                ? "bg-white text-cyan-700 shadow-sm dark:bg-zinc-800 dark:text-cyan-400"
                                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`${id}-mode`}
                              value={option.value}
                              checked={checked}
                              onChange={() => void changeMode(option.value)}
                              // Locked only by another operation: while its own
                              // request runs it stays enabled and keeps focus.
                              disabled={busy && pendingMode === null}
                              className="sr-only"
                            />
                            {/* Not colour alone: the chosen option is also ticked. */}
                            {checked ? <i className="ri-check-line" aria-hidden="true" /> : null}
                            {copy.mode[option.copy].title}
                          </label>
                        );
                      })}
                    </div>

                    <p id={modeDetailId} className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {shownModeCopy.detail}
                    </p>
                  </fieldset>
                ) : null}

                <div className={count > 0 ? "border-t border-zinc-200 pt-5 dark:border-zinc-700/50" : ""}>
                  <h3
                    id={listHeadingId}
                    ref={listHeadingRef}
                    tabIndex={-1}
                    className="mb-1 text-xs uppercase tracking-wider text-zinc-600 focus:outline-none dark:text-zinc-400"
                  >
                    {copy.list}
                  </h3>

                  <p
                    role="status"
                    className={
                      credentials === null || credentials.length === 0
                        ? "py-3 text-sm text-zinc-600 dark:text-zinc-400"
                        : "sr-only"
                    }
                  >
                    {credentials === null ? t.common.loading : credentials.length === 0 ? copy.empty : null}
                  </p>

                  {credentials && credentials.length > 0 ? (
                    <ul
                      aria-labelledby={listHeadingId}
                      className="divide-y divide-zinc-200 dark:divide-zinc-700/50"
                    >
                      {credentials.map((credential) => (
                        <li key={credential.id} className="flex items-center gap-4 py-3">
                          <i className="ri-fingerprint-line text-lg text-zinc-500" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{credential.name}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {copy.usage(
                                format.date(credential.created_at),
                                credential.last_used_at ? format.date(credential.last_used_at) : null,
                              )}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void remove(credential)}
                            aria-disabled={busy || undefined}
                            aria-label={copy.remove(credential.name)}
                            className="-m-1 cursor-pointer rounded-lg p-1 text-zinc-500 transition-colors hover:text-rose-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:text-zinc-400 dark:hover:text-rose-400"
                          >
                            <i className="ri-delete-bin-line text-lg" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {adding ? (
                    /* A panel rather than another row: it is a step in progress, not
                       something you already have. */
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void add();
                      }}
                      className="mt-3 rounded-xl border border-cyan-500/40 bg-cyan-500/5 p-4"
                    >
                      <ProfileField
                        label={copy.name}
                        icon="ri-price-tag-3-line"
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value.slice(0, 60))}
                        placeholder={defaultName(copy.deviceNames)}
                        hint={copy.nameHint}
                        disabled={busy}
                      />

                      {/* The device said no, not the name — so the message is
                          not pinned to the field as if the name were wrong. */}
                      <p
                        role="alert"
                        className={
                          error
                            ? "mt-2 flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-400"
                            : undefined
                        }
                      >
                        {error ? (
                          <>
                            <i className="ri-error-warning-line" aria-hidden="true" />
                            {error}
                          </>
                        ) : null}
                      </p>

                      <div className="mt-4 flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAdding(false);
                            setError(null);
                          }}
                          disabled={busy}
                          className={BUTTON_QUIET}
                        >
                          {t.common.cancel}
                        </button>
                        <button
                          type="submit"
                          aria-disabled={busy || undefined}
                          className={BUTTON_PRIMARY}
                        >
                          <i
                            className={busy ? "ri-loader-4-line animate-spin" : "ri-fingerprint-line"}
                            aria-hidden="true"
                          />
                          <span>{busy ? copy.waiting : copy.create}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      ref={addButtonRef}
                      type="button"
                      onClick={startAdding}
                      aria-disabled={busy || undefined}
                      className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-cyan-700 transition-colors hover:border-cyan-500/60 hover:bg-cyan-500/5 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 dark:border-zinc-700 dark:text-cyan-400"
                    >
                      <i className="ri-add-line text-lg" aria-hidden="true" />
                      <span>{copy.addNew}</span>
                    </button>
                  )}
                </div>
              </div>
            </Modal>
          </>
        ) : null
      }
    />
  );
}
