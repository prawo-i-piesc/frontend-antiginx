"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { verifyEmail } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useAuth } from "@/app/providers/AuthProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";

/**
 * `message` is the API's own, already in the interface language; the other
 * reasons are worded when they render, so they follow a language switch.
 */
type State =
  | { name: "working" }
  | { name: "done" }
  | { name: "failed"; reason: "missing-token" | "unreachable" }
  | { name: "failed"; reason: "rejected"; message: string };

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
  const { t } = useI18n();
  const copy = t.auth.verifyEmail;

  const [state, setState] = useState<State>(() =>
    token ? { name: "working" } : { name: "failed", reason: "missing-token" },
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
        setState(
          caught instanceof ApiError
            ? { name: "failed", reason: "rejected", message: caught.message }
            : { name: "failed", reason: "unreachable" },
        );
      });

    return () => {
      active = false;
    };
  }, [token, reloadUser]);

  // `view`: when the result replaces the spinner, focus goes to the heading,
  // so a screen reader announces how it went.
  if (state.name === "working") {
    return (
      <AuthShell view={state.name} title={copy.workingTitle} subtitle={copy.workingSubtitle}>
        <p className="flex items-center gap-3 text-sm text-zinc-400">
          <i className="ri-loader-4-line animate-spin text-lg" aria-hidden="true" />
          {copy.working}
        </p>
      </AuthShell>
    );
  }

  if (state.name === "done") {
    return (
      <AuthShell
        view={state.name}
        title={copy.doneTitle}
        subtitle={copy.doneSubtitle}
        footer={
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            {copy.toDashboard}
          </Link>
        }
      >
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-zinc-300">
          <i className="ri-checkbox-circle-line mt-0.5 text-lg text-emerald-400" aria-hidden="true" />
          <p>{copy.doneDetail}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      view={state.name}
      title={copy.failedTitle}
      subtitle={copy.failedSubtitle}
      footer={
        <Link href="/dashboard/profile" className="text-cyan-400 hover:text-cyan-300">
          {copy.sendNew}
        </Link>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-zinc-300">
        <i className="ri-error-warning-line mt-0.5 text-lg text-red-400" aria-hidden="true" />
        <p>
          {state.reason === "rejected"
            ? state.message
            : state.reason === "missing-token"
              ? copy.missingToken
              : t.common.networkError}
        </p>
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
