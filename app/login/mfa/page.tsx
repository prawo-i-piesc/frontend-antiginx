"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyMfa, type MfaMethod } from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { clearPendingMfa, getPendingMfa } from "@/app/lib/pendingMfa";
import { confirmWithPasskey, passkeysSupported } from "@/app/lib/webauthnApi";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { SubmitButton, TextField } from "@/app/components/auth/Fields";

type CodeMethod = Exclude<MfaMethod, "webauthn">;

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // Password sign-in leaves the challenge in memory; an OAuth return has no
  // client state, so the backend passes the token as a parameter instead and
  // the offered methods are unknown.
  const pending = getPendingMfa();
  const mfaToken = pending?.mfaToken ?? searchParams.get("token");
  const next = pending?.next ?? "/dashboard";
  const methods: MfaMethod[] = pending?.methods ?? ["totp", "recovery_code"];

  const canUsePasskey = methods.includes("webauthn") && passkeysSupported();
  const canUseTotp = methods.includes("totp");
  const canUseRecovery = methods.includes("recovery_code");

  // Whatever the account actually has decides what opens first.
  const [method, setMethod] = useState<CodeMethod>(canUseTotp ? "totp" : "recovery_code");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mfaToken) router.replace("/login");
  }, [mfaToken, router]);

  if (!mfaToken) return <AuthShellFallback />;

  const isTotp = method === "totp";
  const showCodeForm = canUseTotp || canUseRecovery;

  const done = () => {
    clearPendingMfa();
    toast.success("Signed in");
    router.replace(next);
  };

  const fail = (caught: unknown) => {
    setBusy(false);
    setCode("");

    if (caught instanceof Error && caught.message === "cancelled") {
      setError("No passkey was used.");
      return;
    }
    if (!(caught instanceof ApiError)) {
      setError("Your device could not confirm this. Try another way.");
      return;
    }

    setError(caught.message);
    if (caught.is("MFA_TOKEN_EXPIRED")) {
      clearPendingMfa();
      router.replace("/login");
    }
  };

  const usePasskey = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await confirmWithPasskey(mfaToken);
      done();
    } catch (caught) {
      fail(caught);
    }
  };

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (value.length < (isTotp ? 6 : 8)) {
      setError(isTotp ? "Enter the six digits from your app." : "Enter one of your recovery codes.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await verifyMfa({ mfaToken, method, code: value });
      done();
    } catch (caught) {
      fail(caught);
    }
  };

  return (
    <AuthShell
      title="Two-step verification"
      subtitle={
        canUsePasskey && !showCodeForm
          ? "Confirm with the passkey on this device."
          : isTotp
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
      <div className="space-y-3.5">
        {canUsePasskey ? (
          <button
            type="button"
            onClick={usePasskey}
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-cyan-500/30 bg-linear-to-r from-cyan-600 to-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-cyan-700 hover:to-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i
              className={busy ? "ri-loader-4-line animate-spin" : "ri-fingerprint-line"}
              aria-hidden="true"
            />
            <span>Confirm with your passkey</span>
          </button>
        ) : null}

        {canUsePasskey && showCodeForm ? (
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800/60" />
            <span className="text-xs uppercase tracking-wider text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-800/60" />
          </div>
        ) : null}

        {showCodeForm ? (
          <form onSubmit={submitCode} className="space-y-3.5" noValidate>
            <TextField
              label={isTotp ? "Six-digit code" : "Recovery code"}
              inputMode={isTotp ? "numeric" : "text"}
              autoComplete="one-time-code"
              autoFocus={!canUsePasskey}
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
              className={isTotp ? "[&_input]:text-center [&_input]:tracking-[0.4em]" : ""}
              disabled={busy}
            />

            <SubmitButton loading={busy} loadingLabel="Verifying…">
              Verify and sign in
            </SubmitButton>

            {canUseTotp && canUseRecovery ? (
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
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : null}
      </div>
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
