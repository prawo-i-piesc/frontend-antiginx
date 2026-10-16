"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { safeNextPath } from "@/app/lib/authApi";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { MIN_NAME_LENGTH, updateFullName } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { SubmitButton, TextField, useFormFocus } from "@/app/components/auth/Fields";

/**
 * Shown once, straight after an account is created through a provider.
 *
 * The provider already supplied a name and it is saved, so this is a chance to
 * correct it before it turns up across the app — not a gate. Skipping keeps
 * what came from the provider.
 */
function WelcomeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure, restoreFocus } = useFormFocus();
  const { user, initialized, reloadUser } = useAuth();
  const copy = t.auth.welcome;

  const next = safeNextPath(searchParams.get("next"));

  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The field starts from whatever the provider gave, once the profile lands.
  const value = touched ? name : (user?.full_name ?? "");

  useEffect(() => {
    if (initialized && !user) router.replace("/login");
  }, [initialized, user, router]);

  if (!initialized || !user) return <AuthShellFallback />;

  const submit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const trimmed = value.trim();
    if (trimmed.length < MIN_NAME_LENGTH) {
      setError(t.errors.fields.min(MIN_NAME_LENGTH));
      focusAfterFailure();
      return;
    }

    if (trimmed === user.full_name) {
      router.replace(next);
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await updateFullName(trimmed);
      await reloadUser();
      toast.success(copy.saved);
      router.replace(next);
    } catch (caught) {
      setBusy(false);
      if (!(caught instanceof ApiError)) {
        toast.error(t.common.networkError);
        restoreFocus();
        return;
      }
      setError(fieldMessages(caught.fields).full_name ?? caught.message);
      focusAfterFailure();
    }
  };

  return (
    <AuthShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <Link href={next} replace className="text-cyan-400 hover:text-cyan-300">
          {copy.keep(user.full_name)}
        </Link>
      }
    >
      <form
        ref={formRef}
        onFocus={trackFocus}
        onSubmit={submit}
        className="space-y-3.5"
        noValidate
      >
        <TextField
          label={copy.name}
          name="name"
          autoComplete="name"
          autoFocus
          value={value}
          onChange={(event) => {
            setTouched(true);
            setName(event.target.value);
            setError(null);
          }}
          error={error}
          hint={copy.nameHint(MIN_NAME_LENGTH)}
          disabled={busy}
        />

        <SubmitButton loading={busy} loadingLabel={copy.submitting}>
          {t.common.continue}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <WelcomeForm />
    </Suspense>
  );
}
