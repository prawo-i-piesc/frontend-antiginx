"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { login, safeNextPath } from "@/app/lib/authApi";
import { ApiError, fieldMessages, messageForCode } from "@/app/lib/authErrors";
import { setPendingMfa } from "@/app/lib/pendingMfa";
import { passkeysSupported, signInWithPasskey } from "@/app/lib/webauthnApi";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import OAuthButtons from "@/app/components/auth/OAuthButtons";
import {
  Divider,
  PasswordField,
  SubmitButton,
  TextField,
  useFormFocus,
} from "@/app/components/auth/Fields";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Which OAuth failure has already been announced.
 *
 * Kept outside the component so a remount does not repeat the toast —
 * StrictMode remounts on every mount in development, and the Suspense boundary
 * around this form can do the same. A new attempt is a full page load, which
 * clears this along with the rest of the module state.
 */
let reportedOAuthError: string | null = null;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure, restoreFocus } = useFormFocus();

  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // A failed OAuth attempt returns as a redirect carrying the code, because
  // there is no fetch response to read it from.
  const oauthError = searchParams.get("error");
  useEffect(() => {
    if (!oauthError || reportedOAuthError === oauthError) return;
    reportedOAuthError = oauthError;

    toast.error(messageForCode(oauthError));
    router.replace(next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`);
  }, [oauthError, toast, router, next]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = t.errors.fields.required.email;
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = t.errors.fields.invalidEmail;
    if (!password) errors.password = t.errors.fields.required.password;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (!validate()) {
      focusAfterFailure();
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });

      if (result.kind === "mfa") {
        setPendingMfa({
          mfaToken: result.mfaToken,
          methods: result.methods,
          email: email.trim(),
          next,
        });
        router.push("/login/mfa");
        return;
      }

      toast.success(t.auth.signedIn, {
        description: t.auth.welcomeBack(result.session.user.full_name),
      });
      router.replace(next);
    } catch (error) {
      // Loading stays on through the success paths, which navigate away.
      setLoading(false);
      focusAfterFailure();

      if (!(error instanceof ApiError)) {
        toast.error(t.common.networkError);
        return;
      }

      setFieldErrors(fieldMessages(error.fields));
      toast.error(error.message, {
        description:
          error.is("ACCOUNT_LOCKED") && error.retryAfter
            ? t.common.retryInMinutes(Math.ceil(error.retryAfter / 60))
            : undefined,
      });
    }
  };

  // The email is passed when there is one, so the browser can narrow the
  // list; empty falls back to whatever passkey the device offers.
  const handlePasskey = async () => {
    setLoading(true);
    try {
      const session = await signInWithPasskey(email.trim() || undefined);
      toast.success(t.auth.signedIn, {
        description: t.auth.welcomeBack(session.user.full_name),
      });
      router.replace(next);
    } catch (error) {
      setLoading(false);
      restoreFocus();
      if (error instanceof Error && error.message === "cancelled") return;
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error(t.auth.login.passkeyUnavailable);
    }
  };

  return (
    <AuthShell
      title={t.auth.login.title}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.noAccount}{" "}
          <Link
            href="/register"
            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
          >
            {t.auth.login.signUp}
          </Link>
        </>
      }
    >
      <form
        ref={formRef}
        onFocus={trackFocus}
        onSubmit={handleSubmit}
        className="space-y-3.5"
        noValidate
      >
        <TextField
          label={t.auth.fields.email}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t.auth.fields.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          disabled={loading}
        />

        <PasswordField
          label={t.auth.fields.password}
          name="password"
          autoComplete="current-password"
          placeholder={t.auth.login.passwordPlaceholder}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={loading}
          labelAction={
            <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
              {t.auth.login.forgotPassword}
            </Link>
          }
        />

        <SubmitButton loading={loading} loadingLabel={t.auth.login.submitting}>
          {t.auth.login.submit}
        </SubmitButton>

        <Divider label={t.common.or} />

        {passkeysSupported() ? (
          <button
            type="button"
            disabled={loading}
            onClick={handlePasskey}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="ri-fingerprint-line text-lg" aria-hidden="true" />
            {t.auth.login.passkey}
          </button>
        ) : null}

        <OAuthButtons next={next} disabled={loading} />
      </form>
    </AuthShell>
  );
}
