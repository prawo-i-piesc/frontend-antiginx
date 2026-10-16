"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
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
  useFocusFirstInvalid,
} from "@/app/components/profile/ui";

/**
 * Case, accents and doubled spaces do not count. Pasting is blocked, so the
 * Polish phrase has to be typeable on a keyboard without Polish letters too.
 */
function normalizePhrase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/\s+/g, " ");
}

type Step = "phrase" | "password" | "second-factor";

export default function DangerZone() {
  const { t } = useI18n();
  const copy = t.profile.deleteAccount;
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const phraseId = useId();
  const [formRef, focusFirstInvalid] = useFocusFirstInvalid<HTMLFormElement>();

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
  // Typed by hand, never pasted — the point is that it is read, not completed.
  // The phrase is the one shown, in the language of the interface.
  const phraseMatches = normalizePhrase(phrase) === normalizePhrase(copy.phrase);

  const close = () => {
    setOpen(false);
    setStep("phrase");
    setPhrase("");
    setPassword("");
    setMethod("totp");
    setCode("");
    setError(null);
  };

  const finish = () => {
    toast.success(copy.deleted, { description: copy.deletedHint });
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
      if (caught instanceof ApiError) {
        setError(caught.message);
        focusFirstInvalid();
      } else {
        toast.error(t.common.networkError);
      }
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
        setError(copy.passwordRequired);
        focusFirstInvalid();
        return;
      }
      void remove({ password });
      return;
    }

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (value.length < (isTotp ? 6 : 8)) {
      setError(isTotp ? copy.totpRequired : copy.recoveryRequired);
      focusFirstInvalid();
      return;
    }
    void remove({ password: hasPassword ? password : undefined, method, code: value });
  };

  return (
    <>
      <ProfileCard title={copy.title} description={copy.description}>
        <SecurityRow
          icon="ri-delete-bin-line"
          tone="warn"
          title={copy.rowTitle}
          detail={copy.rowDetail}
          action={
            <button type="button" onClick={() => setOpen(true)} className={ROW_BUTTON_DANGER}>
              <i className="ri-delete-bin-line" aria-hidden="true" />
              <span>{copy.open}</span>
            </button>
          }
        />
      </ProfileCard>

      <Modal
        open={open}
        onClose={close}
        title={copy.dialog.title}
        description={
          step === "phrase"
            ? copy.dialog.phraseStep
            : step === "password"
              ? copy.dialog.passwordStep
              : copy.dialog.secondFactorStep
        }
      >
        <form ref={formRef} onSubmit={submit} className="space-y-5" noValidate>
          {step === "phrase" ? (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-400">
                <i className="ri-alert-line mt-0.5 text-lg" aria-hidden="true" />
                <p>{copy.warning}</p>
              </div>

              {/* The phrase sits here rather than in the label, which is
                  styled uppercase and would show it in a case the check does
                  not accept. */}
              <p id={phraseId} className="text-sm text-zinc-600 dark:text-zinc-400">
                {copy.typePhrase}{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{copy.phrase}</span>
              </p>

              <ProfileField
                label={copy.confirmation}
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
                placeholder={copy.phrase}
                describedBy={phraseId}
                disabled={busy}
              />
            </>
          ) : step === "password" ? (
            // Keyed per step, so each field mounts fresh and takes focus.
            <ProfileField
              key="password"
              label={t.profile.fields.password}
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
              key={`second-factor-${method}`}
              label={isTotp ? t.profile.fields.totp : t.profile.fields.recoveryCode}
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

          {/* Errors of the later steps show under their field; this one has
              none. Kept in place, empty, so its message is announced. */}
          <p
            role="alert"
            className={step === "phrase" && error ? "text-sm text-rose-700 dark:text-rose-400" : "sr-only"}
          >
            {step === "phrase" ? error : null}
          </p>

          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} disabled={busy} className={BUTTON_QUIET}>
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={step === "phrase" && !phraseMatches}
              // Not disabled while busy: that would drop the focus it has.
              aria-disabled={busy || undefined}
              className={BUTTON_DANGER}
            >
              {busy ? <i className="ri-loader-4-line animate-spin" aria-hidden="true" /> : null}
              <span>{step === "phrase" ? t.common.continue : copy.submit}</span>
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
              className="w-full cursor-pointer text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {isTotp ? copy.useRecoveryCode : copy.useApp}
            </button>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
