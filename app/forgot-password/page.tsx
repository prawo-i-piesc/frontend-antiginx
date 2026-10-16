"use client";

import Link from "next/link";
import { useState } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";
import { requestPasswordReset } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import { SubmitButton, TextField, useFormFocus } from "@/app/components/auth/Fields";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure } = useFormFocus();
  const copy = t.auth.forgotPassword;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(copy.emailRequired);
      focusAfterFailure();
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      // The API answers the same way whether or not the account exists, and so
      // does this screen — confirming an address here would leak who has one.
      setSent(true);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        toast.error(caught.message);
      } else {
        toast.error(t.common.networkError);
      }
      setLoading(false);
      focusAfterFailure();
    }
  };

  const backToSignIn = (
    <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
      {t.auth.backToSignIn}
    </Link>
  );

  if (sent) {
    return (
      <AuthShell view="sent" title={copy.sentTitle} subtitle={copy.sentSubtitle} footer={backToSignIn}>
        <div className="space-y-4 text-sm text-zinc-400">
          <div className="flex items-start gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <i className="ri-mail-send-line mt-0.5 text-lg text-cyan-400" aria-hidden="true" />
            <p>
              {copy.sentTo.before}
              <span className="text-zinc-200">{email.trim()}</span>
              {copy.sentTo.after}
            </p>
          </div>
          <p>
            {copy.retry.before}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setLoading(false);
              }}
              className="cursor-pointer text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
            >
              {copy.retry.action}
            </button>
            {copy.retry.after}
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell view="form" title={copy.title} subtitle={copy.subtitle} footer={backToSignIn}>
      <form
        ref={formRef}
        onFocus={trackFocus}
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <TextField
          label={t.auth.fields.email}
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          placeholder={t.auth.fields.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
          disabled={loading}
        />

        <SubmitButton loading={loading} loadingLabel={copy.submitting}>
          {copy.submit}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
