"use client";

import Link from "next/link";
import { Suspense, useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { resetPassword } from "@/app/lib/authApi";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { evaluatePassword } from "@/app/lib/passwordPolicy";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import PasswordStrength from "@/app/components/auth/PasswordStrength";
import { PasswordField, SubmitButton, useFormFocus } from "@/app/components/auth/Fields";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure } = useFormFocus();
  const strengthId = useId();
  const copy = t.auth.resetPassword;

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!token) {
    return (
      <AuthShell
        title={copy.incompleteTitle}
        subtitle={copy.incompleteSubtitle}
        footer={
          <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300">
            {copy.requestNew}
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-zinc-400">
          <i className="ri-error-warning-line mt-0.5 text-lg text-red-400" aria-hidden="true" />
          <p>{copy.expiryNote}</p>
        </div>
      </AuthShell>
    );
  }

  // The strength meter states what is missing, so a weak password marks the
  // field invalid without a second message above it.
  const passwordOk = evaluatePassword(password).satisfied;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (loading) return;

    const errors: Record<string, string> = {};
    if (confirmPassword !== password) errors.confirm = t.auth.fields.passwordsMismatch;

    setFieldErrors(errors);

    if (!passwordOk || Object.keys(errors).length > 0) {
      focusAfterFailure();
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      // Every session was invalidated server-side, and the account may have a
      // second factor, so the user signs in again rather than landing inside.
      toast.success(copy.updated, { description: copy.updatedDetail });
      router.replace("/login");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setFieldErrors(fieldMessages(caught.fields, { new_password: "password" }));
        toast.error(caught.message);
        if (caught.is("TOKEN_EXPIRED") || caught.is("TOKEN_INVALID")) {
          router.replace("/forgot-password");
          return;
        }
      } else {
        toast.error(t.common.networkError);
      }
      setLoading(false);
      focusAfterFailure();
    }
  };

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
          {t.auth.backToSignIn}
        </Link>
      }
    >
      <form
        ref={formRef}
        onFocus={trackFocus}
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <div>
          <PasswordField
            label={copy.newPassword}
            name="new-password"
            autoComplete="new-password"
            autoFocus
            placeholder={t.auth.fields.newPasswordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            aria-invalid={attempted && !passwordOk ? true : undefined}
            aria-describedby={strengthId}
            disabled={loading}
          />
          <PasswordStrength
            id={strengthId}
            tone="dark"
            password={password}
            showFailures={attempted}
          />
        </div>

        <PasswordField
          label={copy.confirmPassword}
          name="confirm-password"
          autoComplete="new-password"
          placeholder={copy.confirmPlaceholder}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirm}
          disabled={loading}
        />

        <SubmitButton loading={loading} loadingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
