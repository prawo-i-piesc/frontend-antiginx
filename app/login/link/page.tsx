"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import {
  confirmOAuthLink,
  pendingOAuthLink,
  type MfaMethod,
  type PendingOAuthLink,
} from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { OAUTH_PROVIDERS } from "@/app/lib/oauthProviders";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import {
  PasswordField,
  SubmitButton,
  TextField,
  useFormFocus,
} from "@/app/components/auth/Fields";

type Step = "password" | "second-factor";

function providerLabel(provider: string): string {
  return OAUTH_PROVIDERS.find((entry) => entry.id === provider)?.label ?? provider;
}

/**
 * Confirms that whoever just signed in with a provider also controls the
 * account that already holds that address, before the two are joined.
 */
export default function LinkAccountPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure, restoreFocus } = useFormFocus();
  const codeRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<PendingOAuthLink | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [step, setStep] = useState<Step>("password");
  const [methods, setMethods] = useState<MfaMethod[]>([]);
  const [method, setMethod] = useState<Exclude<MfaMethod, "webauthn">>("totp");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    pendingOAuthLink()
      .then((link) => {
        if (active) setPending(link);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const expiredMessage = t.auth.link.expired;
  useEffect(() => {
    if (!loadFailed) return;
    toast.error(expiredMessage);
    router.replace("/login");
  }, [loadFailed, toast, router, expiredMessage]);

  if (!pending) return <AuthShellFallback />;

  const isTotp = method === "totp";
  const label = providerLabel(pending.provider);

  const backToSignIn = (text: string) => (
    <Link href="/login" replace className="text-cyan-400 hover:text-cyan-300">
      {text}
    </Link>
  );

  // The backend only asks for confirmation when the existing account has an
  // unverified address, which today means it has a password. Reaching this
  // without one would be a dead end — an explanation beats a field that
  // cannot be filled in.
  if (!pending.password_set) {
    return (
      <AuthShell
        title={t.auth.link.title(label)}
        subtitle={t.auth.link.accountExists(pending.email)}
        footer={backToSignIn(t.auth.backToSignIn)}
      >
        <div className="flex items-start gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-zinc-300">
          <i className="ri-information-line mt-0.5 text-lg text-cyan-400" aria-hidden="true" />
          <p>{t.auth.link.noPassword(label)}</p>
        </div>
      </AuthShell>
    );
  }

  const submit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (step === "password" && password.length === 0) {
      setError(t.errors.fields.required.password);
      focusAfterFailure();
      return;
    }

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (step === "second-factor" && value.length < (isTotp ? 6 : 8)) {
      setError(isTotp ? t.auth.fields.totpRequired : t.auth.fields.recoveryCodeRequired);
      focusAfterFailure();
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const result = await confirmOAuthLink({
        password,
        ...(step === "second-factor" ? { method, code: value } : {}),
      });

      if (result.kind === "mfa") {
        setMethods(result.methods);
        setStep("second-factor");
        setBusy(false);
        return;
      }

      toast.success(t.auth.link.connected(label), { description: t.auth.link.connectedDetail });
      router.replace("/dashboard");
    } catch (caught) {
      setBusy(false);
      setCode("");

      if (!(caught instanceof ApiError)) {
        toast.error(t.common.networkError);
        restoreFocus();
        return;
      }

      setError(caught.message);
      // A dead or exhausted link cannot be retried on this screen.
      if (caught.is("OAUTH_STATE_INVALID") || caught.is("RATE_LIMITED")) {
        toast.error(caught.message);
        router.replace("/login");
        return;
      }
      focusAfterFailure();
    }
  };

  // Rendered synchronously first, so the field is announced under its new label.
  const switchMethod = () => {
    flushSync(() => {
      setMethod(isTotp ? "recovery_code" : "totp");
      setCode("");
      setError(null);
    });
    codeRef.current?.focus();
  };

  return (
    <AuthShell
      view={step}
      title={t.auth.link.title(label)}
      subtitle={
        step === "password" ? t.auth.link.passwordPrompt(pending.email) : t.auth.link.codePrompt
      }
      footer={backToSignIn(t.auth.link.cancel)}
    >
      <form
        ref={formRef}
        onFocus={trackFocus}
        onSubmit={submit}
        className="space-y-3.5"
        noValidate
      >
        {step === "password" ? (
          <PasswordField
            label={t.auth.fields.password}
            name="password"
            autoComplete="current-password"
            autoFocus
            placeholder={t.auth.link.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
            disabled={busy}
          />
        ) : (
          <TextField
            ref={codeRef}
            label={isTotp ? t.auth.fields.totpCode : t.auth.fields.recoveryCode}
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
            hint={isTotp ? undefined : t.auth.fields.recoveryCodeHint}
            className={isTotp ? "[&_input]:text-center [&_input]:tracking-[0.4em]" : ""}
            disabled={busy}
          />
        )}

        <SubmitButton loading={busy} loadingLabel={t.auth.link.connecting}>
          {step === "password" ? t.auth.link.confirm : t.auth.link.verify}
        </SubmitButton>

        {step === "second-factor" && methods.includes("recovery_code") ? (
          <button
            type="button"
            onClick={switchMethod}
            className="w-full cursor-pointer text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            {isTotp ? t.auth.fields.useRecoveryCode : t.auth.fields.useAuthenticator}
          </button>
        ) : null}
      </form>
    </AuthShell>
  );
}
