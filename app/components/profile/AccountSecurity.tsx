"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { ApiError } from "@/app/lib/authErrors";
import {
  activateTotp,
  disableTotp,
  enrollTotp,
  regenerateRecoveryCodes,
} from "@/app/lib/mfaApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import Modal from "@/app/components/profile/Modal";
import Passkeys from "@/app/components/profile/Passkeys";
import {
  BUTTON_DANGER,
  BUTTON_PRIMARY,
  BUTTON_QUIET,
  ProfileCard,
  ProfileField,
  ROW_BUTTON_DANGER,
  ROW_BUTTON_PRIMARY,
  ROW_BUTTON_QUIET,
  SecurityRow,
  StatusPill,
} from "@/app/components/profile/ui";

type Flow =
  | { name: "closed" }
  | { name: "enroll"; step: "password" }
  | { name: "enroll"; step: "verify"; secret: string; uri: string }
  | { name: "codes"; codes: string[] }
  | { name: "disable" }
  | { name: "regenerate" };

const TOTAL_RECOVERY_CODES = 10;

/** Groups the shared secret so it can be typed by hand without losing your place. */
function chunkSecret(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

export default function AccountSecurity() {
  const { user, reloadUser } = useAuth();
  const toast = useToast();

  const [flow, setFlow] = useState<Flow>({ name: "closed" });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const mfa = user?.auth?.mfa;
  const enabled = mfa?.totp_enabled ?? false;
  const codesLeft = mfa?.recovery_codes_remaining ?? 0;
  const hasPassword = user?.auth?.password_set ?? true;
  const codesRunningOut = enabled && codesLeft <= 2;
  const hasPasskeys = mfa?.webauthn_enabled ?? false;

  const close = () => {
    setFlow({ name: "closed" });
    setPassword("");
    setCode("");
  };

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("We could not reach the server. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const startEnrollment = () =>
    run(async () => {
      const enrollment = await enrollTotp(password);
      setPassword("");
      setFlow({
        name: "enroll",
        step: "verify",
        secret: enrollment.secret,
        uri: enrollment.otpauth_uri,
      });
    });

  const confirmEnrollment = () =>
    run(async () => {
      const { recovery_codes } = await activateTotp(code);

      // Two-factor is on at this point and the codes are shown once, so they go
      // on screen before anything else can fail. Re-reading the profile only
      // updates the card, and losing that is worth far less than the codes.
      setCode("");
      setFlow({ name: "codes", codes: recovery_codes });
      toast.success("Two-factor authentication is on");

      reloadUser().catch(() => {
        toast.info("Saved. Refresh the page if the card still shows it as off.");
      });
    });

  const turnOff = () =>
    run(async () => {
      await disableTotp(password);
      await reloadUser();
      toast.success("Two-factor authentication is off");
      close();
    });

  const regenerate = () =>
    run(async () => {
      const { recovery_codes } = await regenerateRecoveryCodes(password);

      setPassword("");
      setFlow({ name: "codes", codes: recovery_codes });
      toast.success("New recovery codes generated");

      reloadUser().catch(() => undefined);
    });

  const copyCodes = async (codes: string[]) => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      toast.success("Recovery codes copied");
    } catch {
      toast.error("Copying failed. Select the codes and copy them manually.");
    }
  };

  return (
    <>
      <ProfileCard
        title="Two-factor authentication"
        description="A second step at sign-in, or a passkey instead of a password."
        aside={<StatusPill on={enabled || hasPasskeys} onLabel="On" offLabel="Off" />}
      >
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
        {!hasPassword ? null : enabled ? (
          <>
            <SecurityRow
              icon="ri-smartphone-line"
              tone="on"
              title="Authenticator app"
              detail="Codes come from the app on your phone."
              action={
                <button
                  type="button"
                  onClick={() => setFlow({ name: "disable" })}
                  className={ROW_BUTTON_DANGER}
                >
                  <i className="ri-shield-cross-line" aria-hidden="true" />
                  <span>Turn off</span>
                </button>
              }
            />
            <SecurityRow
              icon="ri-key-2-line"
              tone={codesRunningOut ? "warn" : "on"}
              title="Recovery codes"
              detail={
                codesLeft === 0
                  ? "None left — generate a new set to keep a way back in."
                  : `${codesLeft} of ${TOTAL_RECOVERY_CODES} unused${codesRunningOut ? " — running low." : "."}`
              }
              action={
                <button
                  type="button"
                  onClick={() => setFlow({ name: "regenerate" })}
                  className={ROW_BUTTON_QUIET}
                >
                  <i className="ri-refresh-line" aria-hidden="true" />
                  <span>New codes</span>
                </button>
              }
            />
          </>
        ) : (
          <SecurityRow
            icon="ri-shield-line"
            tone="off"
            title="Not set up"
            detail="Anyone with your password can sign in as you."
            action={
              <button
                type="button"
                onClick={() => setFlow({ name: "enroll", step: "password" })}
                className={ROW_BUTTON_PRIMARY}
              >
                <i className="ri-shield-check-line" aria-hidden="true" />
                <span>Set up</span>
              </button>
            }
          />
        )}

          <Passkeys />
        </div>
      </ProfileCard>

      <Modal
        open={flow.name === "enroll" && flow.step === "password"}
        onClose={close}
        title="Set up two-factor authentication"
        description="Confirm your password to begin."
      >
        <ConfirmWithPassword
          value={password}
          onChange={setPassword}
          onSubmit={startEnrollment}
          onCancel={close}
          submitLabel="Continue"
          busy={busy}
        />
      </Modal>

      <Modal
        open={flow.name === "enroll" && flow.step === "verify"}
        onClose={close}
        title="Scan the code"
        description="Add the key to your authenticator app, then enter the code it shows."
      >
        {flow.name === "enroll" && flow.step === "verify" ? (
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-2">
              {/* Scanners need a light quiet zone, in either theme. */}
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={flow.uri} size={160} level="M" />
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Cannot scan? Enter this key
                </p>
                <code className="block break-all rounded-xl border border-zinc-300 bg-zinc-50/80 px-4 py-3 font-mono text-sm dark:border-zinc-700/60 dark:bg-zinc-900/50">
                  {chunkSecret(flow.secret)}
                </code>
              </div>

              <ProfileField
                label="Six-digit code"
                icon="ri-key-2-line"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                disabled={busy}
              />

              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" onClick={close} disabled={busy} className={BUTTON_QUIET}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmEnrollment}
                  disabled={busy || code.length !== 6}
                  className={BUTTON_PRIMARY}
                >
                  <i
                    className={busy ? "ri-loader-4-line animate-spin" : "ri-shield-check-line"}
                    aria-hidden="true"
                  />
                  <span>Turn on</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={flow.name === "codes"}
        onClose={close}
        title="Your recovery codes"
        description="Shown once. Each one signs you in a single time."
      >
        {flow.name === "codes" ? (
          <RecoveryCodes
            codes={flow.codes}
            onCopy={() => copyCodes(flow.codes)}
            onDone={close}
          />
        ) : null}
      </Modal>

      <Modal
        open={flow.name === "disable"}
        onClose={close}
        title="Turn off two-factor authentication"
        description="Your account will be protected by its password alone."
      >
        <ConfirmWithPassword
          value={password}
          onChange={setPassword}
          onSubmit={turnOff}
          onCancel={close}
          submitLabel="Turn off"
          busy={busy}
          danger
        />
      </Modal>

      <Modal
        open={flow.name === "regenerate"}
        onClose={close}
        title="New recovery codes"
        description="The codes you have now stop working."
      >
        <ConfirmWithPassword
          value={password}
          onChange={setPassword}
          onSubmit={regenerate}
          onCancel={close}
          submitLabel="Generate"
          busy={busy}
        />
      </Modal>
    </>
  );
}

function ConfirmWithPassword({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
  danger,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  busy: boolean;
  danger?: boolean;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      <ProfileField
        label="Your password"
        icon="ri-lock-line"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={busy}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className={BUTTON_QUIET}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || value.length === 0}
          className={danger ? BUTTON_DANGER : BUTTON_PRIMARY}
        >
          {busy ? <i className="ri-loader-4-line animate-spin" aria-hidden="true" /> : null}
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}

function RecoveryCodes({
  codes,
  onCopy,
  onDone,
}: {
  codes: string[];
  onCopy: () => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
        <i className="ri-alert-line mt-0.5 text-lg" aria-hidden="true" />
        <p>
          Save these somewhere safe now. They are your way back in if you lose your authenticator
          app, and this is the only time they are shown.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {codes.map((recoveryCode) => (
          <li
            key={recoveryCode}
            className="rounded-lg border border-zinc-300 bg-zinc-50/80 px-3 py-2 text-center font-mono text-sm dark:border-zinc-700/60 dark:bg-zinc-900/50"
          >
            {recoveryCode}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCopy} className={BUTTON_QUIET}>
          <i className="ri-file-copy-line" aria-hidden="true" />
          <span>Copy all</span>
        </button>
        <button type="button" onClick={onDone} className={BUTTON_PRIMARY}>
          <i className="ri-check-line" aria-hidden="true" />
          <span>I saved them</span>
        </button>
      </div>
    </div>
  );
}
