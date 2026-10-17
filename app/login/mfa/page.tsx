"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { verifyMfa, type MfaMethod } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { clearPendingMfa, getPendingMfa } from "@/app/lib/pendingMfa";
import { confirmWithPasskey, passkeysSupported } from "@/app/lib/webauthnApi";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { Divider, SubmitButton, TextField, useFormFocus } from "@/app/components/auth/Fields";

type CodeMethod = Exclude<MfaMethod, "webauthn">;

/** Where a failure came from decides where its message is shown. */
type Failure = { source: "passkey" | "code"; message: string };

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure, restoreFocus } = useFormFocus<HTMLDivElement>();
  const codeRef = useRef<HTMLInputElement>(null);

  // Password sign-in leaves the challenge in memory; an OAuth return has no
  // client state, so the backend passes the token as a parameter instead and
  // the offered methods are unknown.
  const pending = getPendingMfa();
  const mfaToken = pending?.mfaToken ?? searchParams.get("token");
  const next = pending?.next ?? "/dashboard";
  const methods: MfaMethod[] = pending?.methods ?? ["totp", "recovery_code"];

  const canUsePasskey = methods.includes("webauthn") && passkeysSupported();
  const canUseTotp = methods.includes("totp");
  const canUseRecovery = methods.includes("recovery_code");

  // Whatever the account actually has decides what opens first.
  const [method, setMethod] = useState<CodeMethod>(canUseTotp ? "totp" : "recovery_code");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  useEffect(() => {
    if (!mfaToken) router.replace("/login");
  }, [mfaToken, router]);

  if (!mfaToken) return <AuthShellFallback />;

  const isTotp = method === "totp";
  const showCodeForm = canUseTotp || canUseRecovery;

  const done = () => {
    clearPendingMfa();
    toast.success(t.auth.signedIn);
    router.replace(next);
  };

  const fail = (caught: unknown, source: Failure["source"]) => {
    setBusy(false);
    setCode("");

    if (caught instanceof Error && caught.message === "cancelled") {
      setFailure({ source, message: t.auth.mfa.noPasskeyUsed });
    } else if (!(caught instanceof ApiError)) {
      setFailure({
        source,
        message: source === "passkey" ? t.auth.mfa.deviceFailed : t.common.networkError,
      });
    } else {
      setFailure({ source, message: caught.message });
      if (caught.is("MFA_TOKEN_EXPIRED")) {
        clearPendingMfa();
        router.replace("/login");
        return;
      }
    }

    if (source === "code") focusAfterFailure();
    else restoreFocus();
  };

  const handlePasskey = async () => {
    if (busy) return;
    setBusy(true);
    setFailure(null);
    try {
      await confirmWithPasskey(mfaToken);
      done();
    } catch (caught) {
      fail(caught, "passkey");
    }
  };

  const submitCode = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (value.length < (isTotp ? 6 : 8)) {
      setFailure({
        source: "code",
        message: isTotp ? t.auth.fields.totpRequired : t.auth.fields.recoveryCodeRequired,
      });
      focusAfterFailure();
      return;
    }

    setFailure(null);
    setBusy(true);
    try {
      await verifyMfa({ mfaToken, method, code: value });
      done();
    } catch (caught) {
      fail(caught, "code");
    }
  };

  // Someone switching to a recovery code is about to type one, so focus goes
  // to the field — synchronously rendered first, so it is announced under its
  // new label.
  const switchMethod = () => {
    flushSync(() => {
      setMethod(isTotp ? "recovery_code" : "totp");
      setCode("");
      setFailure(null);
    });
    codeRef.current?.focus();
  };

  return (
    <AuthShell
      title={t.auth.mfa.title}
      subtitle={
        canUsePasskey && !showCodeForm
          ? t.auth.mfa.passkeyPrompt
          : isTotp
            ? t.auth.mfa.totpPrompt
            : t.auth.mfa.recoveryPrompt
      }
      footer={
        // A button rather than a link: the pending challenge is cleared first.
        <button
          type="button"
          onClick={() => {
            clearPendingMfa();
            router.replace("/login");
          }}
          className="cursor-pointer text-cyan-400 hover:text-cyan-300"
        >
          {t.auth.backToSignIn}
        </button>
      }
    >
      <div ref={formRef} onFocus={trackFocus} className="space-y-3.5">
        {canUsePasskey ? (
          <button
            type="button"
            onClick={handlePasskey}
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-cyan-500/30 bg-linear-to-r from-cyan-700 to-cyan-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-cyan-800 hover:to-cyan-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i
              className={busy ? "ri-loader-4-line animate-spin" : "ri-fingerprint-line"}
              aria-hidden="true"
            />
            <span>{t.auth.mfa.passkey}</span>
          </button>
        ) : null}

        {failure?.source === "passkey" ? (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-red-400">
            <i className="ri-error-warning-line" aria-hidden="true" />
            {failure.message}
          </p>
        ) : null}

        {canUsePasskey && showCodeForm ? <Divider label={t.common.or} /> : null}

        {showCodeForm ? (
          <form onSubmit={submitCode} className="space-y-3.5" noValidate>
            <TextField
              ref={codeRef}
              label={isTotp ? t.auth.fields.totpCode : t.auth.fields.recoveryCode}
              inputMode={isTotp ? "numeric" : "text"}
              autoComplete="one-time-code"
              autoFocus={!canUsePasskey}
              placeholder={isTotp ? "000000" : "XXXX-XXXX"}
              value={code}
              onChange={(event) =>
                setCode(
                  isTotp
                    ? event.target.value.replace(/\D/g, "").slice(0, 6)
                    : event.target.value.slice(0, 12),
                )
              }
              error={failure?.source === "code" ? failure.message : null}
              hint={isTotp ? undefined : t.auth.fields.recoveryCodeHint}
              className={isTotp ? "[&_input]:text-center [&_input]:tracking-[0.4em]" : ""}
              disabled={busy}
            />

            <SubmitButton loading={busy} loadingLabel={t.auth.mfa.submitting}>
              {t.auth.mfa.submit}
            </SubmitButton>

            {canUseTotp && canUseRecovery ? (
              <button
                type="button"
                onClick={switchMethod}
                className="w-full cursor-pointer text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                {isTotp ? t.auth.fields.useRecoveryCode : t.auth.fields.useAuthenticator}
              </button>
            ) : null}
          </form>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <MfaForm />
    </Suspense>
  );
}
