"use client";

import Link from "next/link";
import { useState } from "react";

import { requestPasswordReset } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell from "@/app/components/auth/AuthShell";
import { SubmitButton, TextField } from "@/app/components/auth/Fields";

export default function ForgotPasswordPage() {
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter the email address you signed up with.");
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
        toast.error("We could not reach the server. Check your connection and try again.");
      }
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="If an account exists for that address, a reset link is on its way."
        footer={
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
            Back to sign in
          </Link>
        }
      >
        <div className="space-y-4 text-sm text-zinc-400">
          <div className="flex items-start gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
            <i className="ri-mail-send-line mt-0.5 text-lg text-cyan-400" aria-hidden="true" />
            <p>
              We sent the link to <span className="text-zinc-200">{email.trim()}</span>. It stays
              valid for 30 minutes.
            </p>
          </div>
          <p>
            Nothing arrived? Check your spam folder, then{" "}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setLoading(false);
              }}
              className="cursor-pointer text-cyan-400 hover:text-cyan-300"
            >
              try another address
            </button>
            .
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email address and we will send you a reset link."
      footer={
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          autoFocus
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
          disabled={loading}
        />

        <SubmitButton loading={loading} loadingLabel="Sending…">
          Send reset link
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
