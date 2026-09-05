"use client";

import { useState } from "react";

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
  BUTTON_PRIMARY,
  BUTTON_QUIET,
  ProfileField,
  ROW_BUTTON_PRIMARY,
  ROW_BUTTON_QUIET,
  SecurityRow,
} from "@/app/components/profile/ui";

const MODES = [
  {
    value: "second_factor" as const,
    title: "Password, then passkey",
    detail: "Both are needed. Losing the device still leaves your password.",
  },
  {
    value: "passwordless" as const,
    title: "Passkey only",
    detail: "No password at sign-in. Lose every passkey and you lose the account.",
  },
];

function defaultName(): string {
  if (typeof navigator === "undefined") return "Passkey";
  const agent = navigator.userAgent;
  if (/iPhone|iPad/.test(agent)) return "iPhone";
  if (/Macintosh/.test(agent)) return "Mac";
  if (/Android/.test(agent)) return "Android phone";
  if (/Windows/.test(agent)) return "Windows PC";
  return "Passkey";
}

/**
 * Passkeys sit alongside the authenticator app rather than replacing it: one
 * is a second step after a password, the other replaces the password outright.
 */
export default function Passkeys() {
  const { user, reloadUser } = useAuth();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<PasskeyCredential[] | null>(null);
  const [name, setName] = useState(defaultName);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = passkeysSupported();
  const count = credentials?.length ?? (user?.auth?.mfa.webauthn_enabled ? 1 : 0);
  const mode: PasskeyMode = user?.auth?.passkey_mode ?? "second_factor";

  const report = (caught: unknown) => {
    if (caught instanceof ApiError) toast.error(caught.message);
    else if (caught instanceof Error && caught.name === "NotAllowedError")
      setError("The prompt was dismissed. Try again when you are ready.");
    else if (caught instanceof Error && caught.message === "cancelled")
      setError("No passkey was created.");
    else toast.error("Your device could not create a passkey here.");
  };

  const load = async () => {
    try {
      setCredentials(await listPasskeys());
    } catch (caught) {
      report(caught);
    }
  };

  const openManager = () => {
    setOpen(true);
    setAdding(false);
    setError(null);
    void load();
  };

  const add = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await registerPasskey(name.trim() || defaultName());
      setAdding(false);
      await load();
      void reloadUser();
      toast.success("Passkey added");
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(false);
    }
  };

  const changeMode = async (next: PasskeyMode) => {
    if (busy || next === mode) return;
    setBusy(true);
    setError(null);
    try {
      await setPasskeyMode(next);
      await reloadUser();
      toast.success(
        next === "passwordless"
          ? "Passkeys now sign you in on their own"
          : "Passkeys now confirm your password",
      );
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(false);
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
      toast.success(`${credential.name} removed`);
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SecurityRow
        icon="ri-fingerprint-line"
        tone={count > 0 ? "on" : "off"}
        title="Passkeys"
        detail={
          !supported
            ? "This browser cannot use passkeys."
            : count > 0
              ? `${count} saved. Sign in with Face ID, Touch ID or a security key instead of a password.`
              : "Sign in with Face ID, Touch ID or a security key instead of a password."
        }
        action={
          supported ? (
            <button
              type="button"
              onClick={openManager}
              className={count > 0 ? ROW_BUTTON_QUIET : ROW_BUTTON_PRIMARY}
            >
              <i className="ri-fingerprint-line" aria-hidden="true" />
              <span>{count > 0 ? "Manage" : "Add passkey"}</span>
            </button>
          ) : null
        }
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Passkeys"
        description="Each one is tied to a device or a password manager."
      >
        <div className="space-y-6">
          {count > 0 ? (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
                How signing in works
              </p>

              <div
                role="radiogroup"
                aria-label="How signing in works"
                className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100/70 p-1 dark:border-zinc-700/60 dark:bg-zinc-900/40"
              >
                {MODES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={mode === option.value}
                    disabled={busy}
                    onClick={() => void changeMode(option.value)}
                    className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      mode === option.value
                        ? "bg-white text-cyan-600 shadow-sm dark:bg-zinc-800 dark:text-cyan-400"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {option.title}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                {MODES.find((option) => option.value === mode)?.detail}
              </p>
            </div>
          ) : null}

          <div className={count > 0 ? "border-t border-zinc-200 pt-5 dark:border-zinc-700/50" : ""}>
            <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">Your passkeys</p>

            <ul className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
              {credentials === null ? (
                <li className="py-3 text-sm text-zinc-500">Loading…</li>
              ) : (
                credentials.map((credential) => (
                  <li key={credential.id} className="flex items-center gap-4 py-3">
                    <i className="ri-fingerprint-line text-lg text-zinc-500" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{credential.name}</p>
                      <p className="text-xs text-zinc-500">
                        Added {new Date(credential.created_at).toLocaleDateString()}
                        {credential.last_used_at
                          ? ` · last used ${new Date(credential.last_used_at).toLocaleDateString()}`
                          : " · never used"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(credential)}
                      disabled={busy}
                      aria-label={`Remove ${credential.name}`}
                      className="-m-1 cursor-pointer rounded-lg p-1 text-zinc-400 transition-colors hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <i className="ri-delete-bin-line text-lg" aria-hidden="true" />
                    </button>
                  </li>
                ))
              )}
            </ul>

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
                  label="Name this passkey"
                  icon="ri-price-tag-3-line"
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value.slice(0, 60))}
                  placeholder={defaultName()}
                  error={error}
                  hint="Something you will recognise later, like the device it lives on."
                  disabled={busy}
                />

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
                    Cancel
                  </button>
                  <button type="submit" disabled={busy} className={BUTTON_PRIMARY}>
                    <i
                      className={busy ? "ri-loader-4-line animate-spin" : "ri-fingerprint-line"}
                      aria-hidden="true"
                    />
                    <span>{busy ? "Waiting for your device…" : "Create passkey"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setName(defaultName());
                  setAdding(true);
                  setError(null);
                }}
                disabled={busy}
                className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-cyan-600 transition-colors hover:border-cyan-500/60 hover:bg-cyan-500/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-cyan-400"
              >
                <i className="ri-add-line text-lg" aria-hidden="true" />
                <span>Add new passkey</span>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
