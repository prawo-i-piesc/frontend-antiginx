"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { useI18n } from "@/app/i18n/I18nProvider";
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
  ActionLabel,
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
  useFocusFirstInvalid,
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
  const { t } = useI18n();
  const copy = t.profile.twoFactor;
  const { user, reloadUser } = useAuth();
  const toast = useToast();
  const [formRef, focusFirstInvalid] = useFocusFirstInvalid<HTMLFormElement>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const flowEnded = useRef(false);

  const [flow, setFlow] = useState<Flow>({ name: "closed" });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const mfa = user?.auth?.mfa;
  const enabled = mfa?.totp_enabled ?? false;
  const codesLeft = mfa?.recovery_codes_remaining ?? 0;
  const hasPassword = user?.auth?.password_set ?? true;
  const codesRunningOut = enabled && codesLeft <= 2;
  const hasPasskeys = mfa?.webauthn_enabled ?? false;

  const close = () => {
    flowEnded.current = true;
    setFlow({ name: "closed" });
    setPassword("");
    setCode("");
    setFieldError(null);
  };

  // The button that started a flow can be gone by the time it ends — "Set up"
  // turns into "Turn off" — and the dialog then has nowhere to return focus.
  useEffect(() => {
    if (flow.name !== "closed" || !flowEnded.current) return;
    flowEnded.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) headingRef.current?.focus();
  }, [flow]);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setFieldError(null);
    try {
      await action();
    } catch (error) {
      if (error instanceof ApiError) {
        // Every step here asks for one thing — a password or a code — so the
        // reason goes under that field and focus goes back to it.
        setFieldError(error.message);
        focusFirstInvalid();
      } else {
        toast.error(t.common.networkError);
      }
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
      toast.success(copy.turnedOn);

      reloadUser().catch(() => {
        toast.info(copy.reloadFailed);
      });
    });

  const turnOff = () =>
    run(async () => {
      await disableTotp(password);
      await reloadUser();
      toast.success(copy.turnedOff);
      close();
    });

  const regenerate = () =>
    run(async () => {
      const { recovery_codes } = await regenerateRecoveryCodes(password);

      setPassword("");
      setFlow({ name: "codes", codes: recovery_codes });
      toast.success(copy.regenerated);

      reloadUser().catch(() => undefined);
    });

  const copyText = async (text: string, done: string, failed: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(done);
    } catch {
      toast.error(failed);
    }
  };

  return (
    <>
      <ProfileCard
        title={copy.title}
        description={copy.description}
        headingRef={headingRef}
        aside={<StatusPill on={enabled || hasPasskeys} onLabel={copy.on} offLabel={copy.off} />}
      >
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
        {!hasPassword ? null : enabled ? (
          <>
            <SecurityRow
              icon="ri-smartphone-line"
              tone="on"
              title={copy.app.title}
              detail={copy.app.detail}
              action={
                <button
                  type="button"
                  onClick={() => setFlow({ name: "disable" })}
                  className={ROW_BUTTON_DANGER}
                >
                  <i className="ri-shield-cross-line" aria-hidden="true" />
                  <ActionLabel label={copy.app.turnOff} context={copy.app.turnOffContext} />
                </button>
              }
            />
            <SecurityRow
              icon="ri-key-2-line"
              tone={codesRunningOut ? "warn" : "on"}
              title={copy.codes.title}
              detail={
                codesLeft === 0
                  ? copy.codes.noneLeft
                  : codesRunningOut
                    ? copy.codes.runningLow(codesLeft, TOTAL_RECOVERY_CODES)
                    : copy.codes.left(codesLeft, TOTAL_RECOVERY_CODES)
              }
              action={
                <button
                  type="button"
                  onClick={() => setFlow({ name: "regenerate" })}
                  className={ROW_BUTTON_QUIET}
                >
                  <i className="ri-refresh-line" aria-hidden="true" />
                  <ActionLabel label={copy.codes.regenerate} context={copy.codes.regenerateContext} />
                </button>
              }
            />
          </>
        ) : (
          <SecurityRow
            icon="ri-shield-line"
            tone="off"
            title={copy.notSetUp.title}
            detail={copy.notSetUp.detail}
            action={
              <button
                type="button"
                onClick={() => setFlow({ name: "enroll", step: "password" })}
                className={ROW_BUTTON_PRIMARY}
              >
                <i className="ri-shield-check-line" aria-hidden="true" />
                <ActionLabel label={copy.notSetUp.setUp} context={copy.notSetUp.setUpContext} />
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
        title={copy.enroll.title}
        description={copy.enroll.description}
      >
        <ConfirmWithPassword
          formRef={formRef}
          value={password}
          onChange={setPassword}
          onSubmit={startEnrollment}
          onCancel={close}
          submitLabel={t.common.continue}
          busy={busy}
          error={fieldError}
        />
      </Modal>

      <Modal
        open={flow.name === "enroll" && flow.step === "verify"}
        onClose={close}
        title={copy.verify.title}
        description={copy.verify.description}
      >
        {flow.name === "enroll" && flow.step === "verify" ? (
          // A form, so Enter in the code field turns it on like everywhere else.
          <form
            ref={formRef}
            onSubmit={(event) => {
              event.preventDefault();
              if (code.length === 6) void confirmEnrollment();
            }}
            className="flex flex-col gap-6 sm:flex-row"
            noValidate
          >
            <div className="flex flex-col items-center gap-2">
              {/* Scanners need a light quiet zone, in either theme. The key
                  beside it is the real alternative to the picture. */}
              <div role="img" aria-label={copy.verify.qr} className="rounded-xl bg-white p-3">
                <QRCodeSVG value={flow.uri} size={160} level="M" aria-hidden="true" />
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {copy.verify.manualKey}
                </p>
                <code
                  translate="no"
                  className="block break-all rounded-xl border border-zinc-300 bg-zinc-50/80 px-4 py-3 font-mono text-sm dark:border-zinc-700/60 dark:bg-zinc-900/50"
                >
                  {chunkSecret(flow.secret)}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    void copyText(flow.secret, copy.verify.keyCopied, copy.verify.keyCopyFailed)
                  }
                  className={`${BUTTON_QUIET} mt-2`}
                >
                  <i className="ri-file-copy-line" aria-hidden="true" />
                  <span>{copy.verify.copyKey}</span>
                </button>
              </div>

              <ProfileField
                label={t.profile.fields.totp}
                icon="ri-key-2-line"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                error={fieldError}
                disabled={busy}
              />

              <div className="flex flex-wrap justify-end gap-3">
                <button type="button" onClick={close} disabled={busy} className={BUTTON_QUIET}>
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={busy || code.length !== 6}
                  className={BUTTON_PRIMARY}
                >
                  <i
                    className={busy ? "ri-loader-4-line animate-spin" : "ri-shield-check-line"}
                    aria-hidden="true"
                  />
                  <span>{copy.verify.turnOn}</span>
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={flow.name === "codes"}
        onClose={close}
        title={copy.recovery.title}
        description={copy.recovery.description}
      >
        {flow.name === "codes" ? (
          <RecoveryCodes
            codes={flow.codes}
            onCopy={() =>
              void copyText(flow.codes.join("\n"), copy.recovery.copied, copy.recovery.copyFailed)
            }
            onDone={close}
          />
        ) : null}
      </Modal>

      <Modal
        open={flow.name === "disable"}
        onClose={close}
        title={copy.disable.title}
        description={copy.disable.description}
      >
        <ConfirmWithPassword
          formRef={formRef}
          value={password}
          onChange={setPassword}
          onSubmit={turnOff}
          onCancel={close}
          submitLabel={copy.disable.submit}
          busy={busy}
          error={fieldError}
          danger
        />
      </Modal>

      <Modal
        open={flow.name === "regenerate"}
        onClose={close}
        title={copy.regenerate.title}
        description={copy.regenerate.description}
      >
        <ConfirmWithPassword
          formRef={formRef}
          value={password}
          onChange={setPassword}
          onSubmit={regenerate}
          onCancel={close}
          submitLabel={copy.regenerate.submit}
          busy={busy}
          error={fieldError}
        />
      </Modal>
    </>
  );
}

function ConfirmWithPassword({
  formRef,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
  error,
  danger,
}: {
  formRef: React.Ref<HTMLFormElement>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  busy: boolean;
  error: string | null;
  danger?: boolean;
}) {
  const { t } = useI18n();

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      <ProfileField
        label={t.profile.fields.password}
        icon="ri-lock-line"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••"
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        disabled={busy}
      />

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className={BUTTON_QUIET}>
          {t.common.cancel}
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
  const { t } = useI18n();
  const copy = t.profile.twoFactor.recovery;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
        <i className="ri-alert-line mt-0.5 text-lg" aria-hidden="true" />
        <p>{copy.warning}</p>
      </div>

      <ul aria-label={copy.list} translate="no" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          <ActionLabel label={copy.copyAll} context={copy.copyAllContext} />
        </button>
        <button type="button" onClick={onDone} className={BUTTON_PRIMARY}>
          <i className="ri-check-line" aria-hidden="true" />
          <span>{copy.saved}</span>
        </button>
      </div>
    </div>
  );
}
