"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  confirmOAuthLink,
  pendingOAuthLink,
  type MfaMethod,
  type PendingOAuthLink,
} from "@/app/lib/authApi";
import { ApiError } from "@/app/lib/authErrors";
import { OAUTH_PROVIDERS } from "@/app/lib/oauthProviders";
import { useToast } from "@/app/providers/ToastProvider";
import AuthShell, { AuthShellFallback } from "@/app/components/auth/AuthShell";
import { PasswordField, SubmitButton, TextField } from "@/app/components/auth/Fields";

type Step = "password" | "second-factor";

function providerLabel(provider: string): string {
  return OAUTH_PROVIDERS.find((entry) => entry.id === provider)?.label ?? provider;
}

/**
 * Confirms that whoever just signed in with a provider also controls the
 * account that already holds that address, before the two are joined.
 */
export default function LinkAccountPage() {
  const router = useRouter();
  const toast = useToast();

  const [pending, setPending] = useState<PendingOAuthLink | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [step, setStep] = useState<Step>("password");
  const [methods, setMethods] = useState<MfaMethod[]>([]);
  const [method, setMethod] = useState<Exclude<MfaMethod, "webauthn">>("totp");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    pendingOAuthLink()
      .then((link) => {
        if (active) setPending(link);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loadFailed) return;
    toast.error("That sign-in attempt expired. Start again.");
    router.replace("/login");
  }, [loadFailed, toast, router]);

  if (!pending) return <AuthShellFallback />;

  const isTotp = method === "totp";
  const label = providerLabel(pending.provider);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    if (step === "password" && password.length === 0) {
      setError("Enter your password.");
      return;
    }

    const value = isTotp ? code.replace(/\D/g, "") : code.trim().toUpperCase().replace(/-/g, "");
    if (step === "second-factor" && value.length < (isTotp ? 6 : 8)) {
      setError(isTotp ? "Enter the six digits from your app." : "Enter one of your recovery codes.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const result = await confirmOAuthLink({
        password,
        ...(step === "second-factor" ? { method, code: value } : {}),
      });

      if (result.kind === "mfa") {
        setMethods(result.methods);
        setStep("second-factor");
        setBusy(false);
        return;
      }

      toast.success(`${label} connected`, { description: "You can sign in with it from now on." });
      router.replace("/dashboard");
    } catch (caught) {
      setBusy(false);
      setCode("");

      if (!(caught instanceof ApiError)) {
        toast.error("We could not reach the server. Try again in a moment.");
        return;
      }

      setError(caught.message);
      // A dead or exhausted link cannot be retried on this screen.
      if (caught.is("OAUTH_STATE_INVALID") || caught.is("RATE_LIMITED")) {
        toast.error(caught.message);
        router.replace("/login");
      }
    }
  };

  return (
    <AuthShell
      title={`Connect ${label} to your account`}
      subtitle={
        step === "password"
          ? `An account already uses ${pending.email}. Confirm its password to join them.`
          : "One more step — the code from your authenticator app."
      }
      footer={
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="cursor-pointer text-cyan-400 hover:text-cyan-300"
        >
          Cancel and sign in normally
        </button>
      }
    >
      <form onSubmit={submit} className="space-y-3.5" noValidate>
        {step === "password" ? (
          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
            autoFocus
            placeholder="Password for this account"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
            disabled={busy}
          />
        ) : (
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
            className={isTotp ? "[&_input]:text-center [&_input]:tracking-[0.4em]" : ""}
            disabled={busy}
          />
        )}

        <SubmitButton loading={busy} loadingLabel="Connecting…">
          {step === "password" ? "Confirm and connect" : "Verify and connect"}
        </SubmitButton>

        {step === "second-factor" && methods.includes("recovery_code") ? (
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
