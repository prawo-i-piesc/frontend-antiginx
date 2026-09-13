"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { verifyEmail } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useAuth } from "@/app/providers/AuthProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";

type State = { name: "working" } | { name: "done" } | { name: "failed"; message: string };

/**
 * Opened from the link in the verification email.
 *
 * The work happens on arrival — there is nothing for the reader to fill in —
 * so the screen only reports how it went and where to go next.
 */
function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { reloadUser } = useAuth();

  const [state, setState] = useState<State>(() =>
    token ? { name: "working" } : { name: "failed", message: "This link is missing its token." },
  );

  useEffect(() => {
    if (!token) return;
    let active = true;

    verifyEmail(token)
      .then(async () => {
        // The session in this tab still carries the old profile, and the gate
        // reads it — without this the dashboard link would bounce straight
        // back to the confirmation screen. Signed out, there is nothing to
        // refresh and the failure is expected.
        await reloadUser().catch(() => undefined);
        if (active) setState({ name: "done" });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setState({
          name: "failed",
          message:
            caught instanceof ApiError
              ? caught.message
              : "We could not reach the server. Try the link again in a moment.",
        });
      });

    return () => {
      active = false;
    };
  }, [token, reloadUser]);

  if (state.name === "working") {
    return (
      <AuthShell title="Confirming your address" subtitle="This takes a second.">
        <p className="flex items-center gap-3 text-sm text-zinc-400">
          <i className="ri-loader-4-line animate-spin text-lg" aria-hidden="true" />
          Checking the link…
        </p>
      </AuthShell>
    );
  }

  if (state.name === "done") {
    return (
      <AuthShell
        title="Address confirmed"
        subtitle="Your email address is verified."
        footer={
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            Go to the dashboard
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-zinc-300">
          <i className="ri-checkbox-circle-line mt-0.5 text-lg text-emerald-400" aria-hidden="true" />
          <p>
            Signing in with a provider on this address will now connect to this account instead of
            asking for your password.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="That link did not work"
      subtitle="Confirmation links expire and can only be used once."
      footer={
        <Link href="/dashboard/profile" className="text-cyan-400 hover:text-cyan-300">
          Send a new one from your profile
        </Link>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-zinc-300">
        <i className="ri-error-warning-line mt-0.5 text-lg text-red-400" aria-hidden="true" />
        <p>{state.message}</p>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <VerifyEmail />
    </Suspense>
  );
}
