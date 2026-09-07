"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { requestEmailVerification } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { SubmitButton } from "@/app/components/auth/Fields";

/**
 * Where an account waits until its address is confirmed.
 *
 * The link is opened in the mailbox, which is often another device, so this
 * screen cannot detect the change on its own — hence the button to re-check
 * rather than a spinner that would never resolve.
 */
export default function ConfirmEmailPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, initialized, reloadUser } = useAuth();

  const [busy, setBusy] = useState<"resend" | "check" | null>(null);

  const verified = user?.auth?.email_verified ?? false;

  useEffect(() => {
    if (!initialized) return;
    if (!user) router.replace("/login");
    else if (verified) router.replace("/dashboard");
  }, [initialized, user, verified, router]);

  if (!initialized || !user || verified) return <AuthShellFallback />;

  const report = (caught: unknown) => {
    if (!(caught instanceof ApiError)) {
      toast.error("We could not reach the server. Try again in a moment.");
      return;
    }
    toast.error(caught.message, {
      description:
        caught.is("RATE_LIMITED") && caught.retryAfter
          ? `Try again in about ${Math.ceil(caught.retryAfter / 60)} minute(s).`
          : undefined,
    });
  };

  const resend = async () => {
    if (busy) return;
    setBusy("resend");
    try {
      await requestEmailVerification();
      toast.success("Confirmation sent", { description: `Check ${user.email}.` });
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(null);
    }
  };

  const recheck = async () => {
    if (busy) return;
    setBusy("check");
    try {
      const fresh = await reloadUser();
      if (fresh.auth?.email_verified) {
        toast.success("Address confirmed");
        router.replace("/dashboard");
        return;
      }
      toast.info("Still waiting on that link.", {
        description: "Open the one we sent, or send yourself a new one.",
      });
    } catch (caught) {
      report(caught);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthShell
      title="Confirm your email"
      subtitle={`We sent a link to ${user.email}.`}
      footer={
        <button
          type="button"
          onClick={() => void logoutAndLeave(router)}
          className="cursor-pointer text-cyan-400 hover:text-cyan-300"
        >
          Sign out
        </button>
      }
    >
      <div className="space-y-3.5">
        <div className="flex items-start gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-zinc-300">
          <i className="ri-mail-send-line mt-0.5 text-lg text-cyan-400" aria-hidden="true" />
          <p>
            Open it and you are in. The link is good for a limited time, and confirming also lets us
            reach you if you ever need to reset your password.
          </p>
        </div>

        <SubmitButton
          type="button"
          onClick={recheck}
          loading={busy === "check"}
          loadingLabel="Checking…"
        >
          I have confirmed it
        </SubmitButton>

        <button
          type="button"
          onClick={resend}
          disabled={busy !== null}
          className="w-full cursor-pointer text-sm text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-60"
        >
          {busy === "resend" ? "Sending…" : "Send the link again"}
        </button>
      </div>
    </AuthShell>
  );
}

async function logoutAndLeave(router: ReturnType<typeof useRouter>) {
  const { logout } = await import("@/app/lib/authApi");
  await logout();
  router.replace("/login");
}
