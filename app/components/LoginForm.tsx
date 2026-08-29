"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { login, safeNextPath } from "@/app/lib/authApi";
import { ApiError, messageForCode } from "@/app/lib/authErrors";
import { setPendingMfa } from "@/app/lib/pendingMfa";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import OAuthButtons from "@/app/components/auth/OAuthButtons";
import { Divider, PasswordField, SubmitButton, TextField } from "@/app/components/auth/Fields";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const next = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // A failed OAuth attempt returns as a redirect carrying the code, because
  // there is no fetch response to read it from.
  const oauthError = searchParams.get("error");
  useEffect(() => {
    if (!oauthError) return;
    toast.error(messageForCode(oauthError));
    router.replace(next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`);
  }, [oauthError, toast, router, next]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = "That does not look like an email address.";
    if (!password) errors.password = "Enter your password.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading || !validate()) return;

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

      toast.success("Signed in", {
        description: `Welcome back, ${result.session.user.full_name}.`,
      });
      router.replace(next);
    } catch (error) {
      // Loading stays on through the success paths, which navigate away.
      setLoading(false);

      if (!(error instanceof ApiError)) {
        toast.error("We could not reach the server. Check your connection and try again.");
        return;
      }

      setFieldErrors(error.fields);
      toast.error(error.message, {
        description:
          error.is("ACCOUNT_LOCKED") && error.retryAfter
            ? `Try again in about ${Math.ceil(error.retryAfter / 60)} minute(s).`
            : undefined,
      });
    }
  };

  return (
    <AuthShell
      title="Sign in to AntiGinx"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={loading}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={loading} loadingLabel="Signing in…">
          Sign in
        </SubmitButton>

        <Divider label="or" />

        <OAuthButtons next={next} disabled={loading} />
      </form>
    </AuthShell>
  );
}
