"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { login, safeNextPath } from "@/app/lib/authApi";
import { ApiError, fieldMessages, messageForCode } from "@/app/lib/authErrors";
import { setPendingMfa } from "@/app/lib/pendingMfa";
import { passkeysSupported, signInWithPasskey } from "@/app/lib/webauthnApi";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import OAuthButtons from "@/app/components/auth/OAuthButtons";
import { Divider, PasswordField, SubmitButton, TextField } from "@/app/components/auth/Fields";

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

      setFieldErrors(fieldMessages(error.fields));
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
      title="Sign in to Antiginx"
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
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
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
          labelAction={
            <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
              Forgot password?
            </Link>
          }
        />

        <SubmitButton loading={loading} loadingLabel="Signing in…">
          Sign in
        </SubmitButton>

        <Divider label="or" />

        {passkeysSupported() ? (
          <button
            type="button"
            disabled={loading}
            // The email is passed when there is one, so the browser can narrow
            // the list; empty falls back to whatever passkey the device offers.
            onClick={async () => {
              setLoading(true);
              try {
                const session = await signInWithPasskey(email.trim() || undefined);
                toast.success("Signed in", {
                  description: `Welcome back, ${session.user.full_name}.`,
                });
                router.replace(next);
                return;
              } catch (error) {
                setLoading(false);
                if (error instanceof Error && error.message === "cancelled") return;
                if (error instanceof ApiError) toast.error(error.message);
                else toast.error("Your device could not offer a passkey here.");
              }
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="ri-fingerprint-line text-lg" aria-hidden="true" />
            Sign in with a passkey
          </button>
        ) : null}

        <OAuthButtons next={next} disabled={loading} />
      </form>
    </AuthShell>
  );
}
