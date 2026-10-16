"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { register } from "@/app/lib/authApi";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { evaluatePassword } from "@/app/lib/passwordPolicy";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import OAuthButtons from "@/app/components/auth/OAuthButtons";
import PasswordStrength from "@/app/components/auth/PasswordStrength";
import {
  Checkbox,
  Divider,
  PasswordField,
  SubmitButton,
  TextField,
  useFormFocus,
} from "@/app/components/auth/Fields";

/** Mirrors the backend binding on full_name, so it fails before the round trip. */
const MIN_NAME_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();
  const { formRef, trackFocus, focusAfterFailure } = useFormFocus();
  const strengthId = useId();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // The strength meter under the field already names what is missing, so a
  // weak password marks the field invalid without adding a second message.
  const passwordOk = evaluatePassword(password, { name: fullName, email }).satisfied;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.full_name = t.errors.fields.required.full_name;
    else if (fullName.trim().length < MIN_NAME_LENGTH)
      errors.full_name = t.errors.fields.min(MIN_NAME_LENGTH);
    if (!email.trim()) errors.email = t.errors.fields.required.email;
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = t.errors.fields.invalidEmail;

    if (confirmPassword !== password) errors.confirm_password = t.auth.fields.passwordsMismatch;
    if (!accepted) errors.terms = t.auth.register.termsRequired;

    setFieldErrors(errors);
    return passwordOk && Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    if (loading) return;
    if (!validate()) {
      focusAfterFailure();
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (result.kind === "session") {
        // A fresh password account has an unverified address, so it goes to the
        // confirmation screen rather than the dashboard.
        toast.success(t.auth.register.created, { description: t.auth.register.confirmToFinish });
        router.replace("/confirm-email");
        return;
      }

      // Pre-E1 backend: the account exists but no session was issued.
      toast.success(t.auth.register.created, { description: t.auth.register.signInToContinue });
      router.replace("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        // A taken address is a problem with that field, so it is shown there too.
        setFieldErrors(
          error.is("EMAIL_TAKEN") ? { email: error.message } : fieldMessages(error.fields),
        );
        toast.error(error.message);
      } else {
        toast.error(t.common.networkError);
      }
      setLoading(false);
      focusAfterFailure();
    }
  };

  return (
    <AuthShell
      wide
      title={t.auth.register.title}
      subtitle={t.auth.register.subtitle}
      footer={
        <>
          {t.auth.register.haveAccount}{" "}
          <Link
            href="/login"
            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
          >
            {t.auth.register.signIn}
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
        <div className="grid gap-3.5 sm:grid-cols-2">
          <TextField
            label={t.auth.register.name}
            name="name"
            autoComplete="name"
            placeholder={t.auth.register.namePlaceholder}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            error={fieldErrors.full_name}
            disabled={loading}
          />

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
        </div>

        <div>
          <PasswordField
            label={t.auth.fields.password}
            name="new-password"
            autoComplete="new-password"
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
            context={{ name: fullName, email }}
            showFailures={attempted}
          />
        </div>

        <PasswordField
          label={t.auth.register.confirmPassword}
          name="confirm-password"
          autoComplete="new-password"
          placeholder={t.auth.register.confirmPlaceholder}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirm_password}
          disabled={loading}
        />

        <Checkbox
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          disabled={loading}
          label={t.auth.register.terms}
          error={fieldErrors.terms}
        />

        <SubmitButton loading={loading} loadingLabel={t.auth.register.submitting}>
          {t.auth.register.submit}
        </SubmitButton>

        <Divider label={t.common.or} />

        <OAuthButtons disabled={loading} />
      </form>
    </AuthShell>
  );
}
