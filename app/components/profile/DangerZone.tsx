"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteAccount, type MfaMethod } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import Modal from "@/app/components/profile/Modal";
import {
  BUTTON_DANGER,
  BUTTON_QUIET,
  ROW_BUTTON_DANGER,
  ProfileCard,
  ProfileField,
  SecurityRow,
} from "@/app/components/profile/ui";

/** Typed by hand, never pasted — the point is that it is read, not completed. */
const CONFIRM_PHRASE = "I want to delete my account";

type Step = "phrase" | "password" | "second-factor";

export default function DangerZone() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("phrase");
  const [phrase, setPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [methods, setMethods] = useState<MfaMethod[]>([]);
  const [method, setMethod] = useState<Exclude<MfaMethod, "webauthn">>("totp");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPassword = user?.auth?.password_set ?? true;
  const isTotp = method === "totp";
  const phraseMatches = phrase.trim() === CONFIRM_PHRASE;

  const close = () => {
    setOpen(false);
    setStep("phrase");
    setPhrase("");
    setPassword("");
    setCode("");
    setError(null);
  };

  const finish = () => {
    toast.success("Account deleted", { description: "Everything tied to it is gone." });
    router.replace("/");
  };

  const remove = async (payload: { password?: string; method?: Exclude<MfaMethod, "webauthn">; code?: string }) => {
    setBusy(true);
    setError(null);
    try {
      const result = await deleteAccount(payload);

      if (result.kind === "mfa") {
        setMethods(result.methods);
        setStep("second-factor");
        setBusy(false);
        return;
      }

      finish();
    } catch (caught) {
      setBusy(false);
      setCode("");
      if (caught instanceof ApiError) setError(caught.message);
      else toast.error("We could not reach the server. Try again in a moment.");
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (step === "phrase") {
      if (!phraseMatches) return;
      // Nothing to confirm with on a provider-only account without a second
      // factor, so the valid session is the confirmation.
      if (hasPassword) {
        setStep("password");
        return;
      }
      void remove({});
      return;
    }

    if (step === "password") {
      if (password.length === 0) {
        setError("Enter your password.");
        return;
      }
      void remove({ password });
      return;
    }

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (value.length < (isTotp ? 6 : 8)) {
      setError(isTotp ? "Enter the six digits from your app." : "Enter one of your recovery codes.");
      return;
    }
    void remove({ password: hasPassword ? password : undefined, method, code: value });
  };

  return (
    <>
      <ProfileCard
        title="Delete account"
        description="Removes the account and everything scanned under it."
      >
        <SecurityRow
          icon="ri-delete-bin-line"
          tone="warn"
          title="This cannot be undone"
          detail="Your scans, their results and every sign-in method go with the account."
          action={
            <button type="button" onClick={() => setOpen(true)} className={ROW_BUTTON_DANGER}>
              <i className="ri-delete-bin-line" aria-hidden="true" />
              <span>Delete account</span>
            </button>
          }
        />
      </ProfileCard>

      <Modal
        open={open}
        onClose={close}
        title="Delete your account"
        description={
          step === "phrase"
            ? "Read this before confirming."
            : step === "password"
              ? "Confirm it is you."
              : "One more step."
        }
      >
        <form onSubmit={submit} className="space-y-5" noValidate>
          {step === "phrase" ? (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-400">
                <i className="ri-alert-line mt-0.5 text-lg" aria-hidden="true" />
                <p>
                  Deleting removes your scans and their results, your recovery codes and every
                  connected account. Nothing here can be restored afterwards.
                </p>
              </div>

              <ProfileField
                label={`Type “${CONFIRM_PHRASE}” to continue`}
                icon="ri-keyboard-line"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                value={phrase}
                onChange={(event) => setPhrase(event.target.value)}
                // Pasting would let someone confirm without reading. This is
                // friction by design, not a security boundary.
                onPaste={(event) => event.preventDefault()}
                onDrop={(event) => event.preventDefault()}
                placeholder={CONFIRM_PHRASE}
                disabled={busy}
              />
            </>
          ) : step === "password" ? (
            <ProfileField
              label="Your password"
              icon="ri-lock-line"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={error}
              disabled={busy}
            />
          ) : (
            <ProfileField
              label={isTotp ? "Six-digit code" : "Recovery code"}
              icon="ri-key-2-line"
              inputMode={isTotp ? "numeric" : "text"}
              autoComplete="one-time-code"
              autoFocus
              placeholder={isTotp ? "000000" : "XXXX-XXXX"}
              value={code}
              onChange={(event) =>
                setCode(
                  isTotp
                    ? event.target.value.replace(/\D/g, "").slice(0, 6)
                    : event.target.value.slice(0, 12),
                )
              }
              error={error}
              disabled={busy}
            />
          )}

          {step === "phrase" && error ? <p className="text-sm text-rose-500">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} disabled={busy} className={BUTTON_QUIET}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || (step === "phrase" && !phraseMatches)}
              className={BUTTON_DANGER}
            >
              {busy ? <i className="ri-loader-4-line animate-spin" aria-hidden="true" /> : null}
              <span>{step === "phrase" ? "Continue" : "Delete permanently"}</span>
            </button>
          </div>

          {step === "second-factor" && methods.includes("recovery_code") ? (
            <button
              type="button"
              onClick={() => {
                setMethod(isTotp ? "recovery_code" : "totp");
                setCode("");
                setError(null);
              }}
              className="w-full cursor-pointer text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              {isTotp ? "Use a recovery code instead" : "Use your authenticator app instead"}
            </button>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
