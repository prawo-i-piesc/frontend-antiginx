"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPassword } from "@/app/lib/authApi";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { evaluatePassword } from "@/app/lib/passwordPolicy";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import PasswordRequirements from "@/app/components/auth/PasswordRequirements";
import { PasswordField, SubmitButton } from "@/app/components/auth/Fields";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!token) {
    return (
      <AuthShell
        title="This link is incomplete"
        subtitle="The reset link is missing its token. Request a new one to continue."
        footer={
          <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300">
            Request a new link
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-zinc-400">
          <i className="ri-error-warning-line mt-0.5 text-lg text-red-400" aria-hidden="true" />
          <p>Reset links expire after 30 minutes and can only be used once.</p>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (loading) return;

    const errors: Record<string, string> = {};
    if (!evaluatePassword(password).satisfied)
      errors.password = "Your password does not meet the requirements below.";
    if (confirmPassword !== password) errors.confirm = "Both passwords have to match.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password });
      // Every session was invalidated server-side, and the account may have a
      // second factor, so the user signs in again rather than landing inside.
      toast.success("Password updated", { description: "Sign in with your new password." });
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
        toast.error("We could not reach the server. Check your connection and try again.");
      }
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Signing in on your other devices will be required again."
      footer={
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <PasswordField
            label="New password"
            name="new-password"
            autoComplete="new-password"
            autoFocus
            placeholder="Choose a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            disabled={loading}
          />
          <PasswordRequirements password={password} showFailures={attempted} />
        </div>

        <PasswordField
          label="Confirm new password"
          name="confirm-password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirm}
          disabled={loading}
        />

        <SubmitButton loading={loading} loadingLabel="Updating…">
          Update password
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
