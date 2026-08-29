"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyMfa, type MfaMethod } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { clearPendingMfa, getPendingMfa } from "@/app/lib/pendingMfa";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { SubmitButton, TextField } from "@/app/components/auth/Fields";

type Step = Exclude<MfaMethod, "webauthn">;

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // Password sign-in leaves the challenge in memory; an OAuth return has no
  // client state, so the backend passes it as a parameter instead.
  const pending = getPendingMfa();
  const mfaToken = pending?.mfaToken ?? searchParams.get("token");
  const next = pending?.next ?? "/dashboard";
  const canUseRecovery = pending ? pending.methods.includes("recovery_code") : true;

  const [method, setMethod] = useState<Step>("totp");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mfaToken) router.replace("/login");
  }, [mfaToken, router]);

  if (!mfaToken) return <AuthShellFallback />;

  const isTotp = method === "totp";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (isTotp && value.length !== 6) {
      setError("Enter the six digits from your authenticator app.");
      return;
    }
    if (!isTotp && value.length < 8) {
      setError("Enter one of your recovery codes.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await verifyMfa({ mfaToken, method, code: value });
      clearPendingMfa();
      toast.success("Signed in");
      router.replace(next);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
        toast.error(caught.message);
        // A dead challenge cannot be retried on this screen.
        if (caught.is("MFA_TOKEN_EXPIRED")) {
          clearPendingMfa();
          router.replace("/login");
          return;
        }
      } else {
        toast.error("We could not reach the server. Check your connection and try again.");
      }
      setCode("");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Two-step verification"
      subtitle={
        isTotp
          ? "Enter the code from your authenticator app."
          : "Enter one of the recovery codes you saved."
      }
      footer={
        <button
          type="button"
          onClick={() => {
            clearPendingMfa();
            router.replace("/login");
          }}
          className="cursor-pointer text-cyan-400 hover:text-cyan-300"
        >
          Back to sign in
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField
          label={isTotp ? "Six-digit code" : "Recovery code"}
          inputMode={isTotp ? "numeric" : "text"}
          autoComplete="one-time-code"
          autoFocus
          placeholder={isTotp ? "000000" : "XXXX-XXXX"}
          value={code}
          onChange={(event) =>
            setCode(
              isTotp
                ? event.target.value.replace(/\D/g, "").slice(0, 6)
                : event.target.value.slice(0, 12),
            )
          }
          error={error}
          className={isTotp ? "[&_input]:text-center [&_input]:text-xl [&_input]:tracking-[0.4em]" : ""}
          disabled={loading}
        />

        <SubmitButton loading={loading} loadingLabel="Verifying…">
          Verify and sign in
        </SubmitButton>

        {canUseRecovery ? (
          <button
            type="button"
            onClick={() => {
              setMethod(isTotp ? "recovery_code" : "totp");
              setCode("");
              setError(null);
            }}
            className="w-full cursor-pointer text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            {isTotp ? "Use a recovery code instead" : "Use your authenticator app instead"}
          </button>
        ) : null}
      </form>
    </AuthShell>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<AuthShellFallback />}>
      <MfaForm />
    </Suspense>
  );
}
