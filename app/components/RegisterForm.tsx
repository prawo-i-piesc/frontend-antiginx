"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { register } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import OAuthButtons from "@/app/components/auth/OAuthButtons";
import {
  Checkbox,
  Divider,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/app/components/auth/Fields";

/** Mirrors the server-side policy so the user is told before the round trip. */
const MIN_PASSWORD_LENGTH = 12;

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.full_name = "Enter your name.";
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = "That does not look like an email address.";

    if (password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (confirmPassword !== password) errors.confirm_password = "Both passwords have to match.";
    if (!accepted) errors.terms = "Accept the terms to create an account.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const result = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (result.kind === "session") {
        toast.success("Account created", { description: "You are signed in and ready to scan." });
        router.replace("/dashboard");
        return;
      }

      // Pre-E1 backend: the account exists but no session was issued.
      toast.success("Account created", { description: "Sign in to continue." });
      router.replace("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fields);
        toast.error(error.message);
      } else {
        toast.error("We could not reach the server. Check your connection and try again.");
      }
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start scanning your sites in a couple of minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Jan Kowalski"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={fieldErrors.full_name}
          disabled={loading}
        />

        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          disabled={loading}
        />

        <PasswordField
          label="Password"
          name="new-password"
          autoComplete="new-password"
          placeholder="At least 12 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          hint={`Use at least ${MIN_PASSWORD_LENGTH} characters. Avoid anything you use elsewhere.`}
          disabled={loading}
        />

        <PasswordField
          label="Confirm password"
          name="confirm-password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirm_password}
          disabled={loading}
        />

        <div>
          <Checkbox
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            disabled={loading}
            label="I accept the terms of service and the privacy policy."
          />
          {fieldErrors.terms ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
              <i className="ri-error-warning-line" aria-hidden="true" />
              {fieldErrors.terms}
            </p>
          ) : null}
        </div>

        <SubmitButton loading={loading} loadingLabel="Creating account…">
          Create account
        </SubmitButton>

        <Divider label="or" />

        <OAuthButtons disabled={loading} />
      </form>
    </AuthShell>
  );
}
