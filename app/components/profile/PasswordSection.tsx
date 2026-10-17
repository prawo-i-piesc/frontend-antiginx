"use client";

import { useId, useState } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { evaluatePassword } from "@/app/lib/passwordPolicy";
import { updatePassword } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import PasswordStrength from "@/app/components/auth/PasswordStrength";
import {
  ExpandableRow,
  ProfileCard,
  ProfileField,
  SubmitRow,
  useFocusFirstInvalid,
} from "@/app/components/profile/ui";

/** The fields this form can show a message under; the API may name others. */
const FIELDS = ["old_password", "new_password", "confirm"];

export default function PasswordSection() {
  const { t } = useI18n();
  const copy = t.profile.password;
  const { user } = useAuth();
  const toast = useToast();
  const meterId = useId();
  const [formRef, focusFirstInvalid] = useFocusFirstInvalid<HTMLFormElement>();

  // An account created through Google has no password to compare against, and
  // the endpoint requires the current one, so there is nothing this form could
  // do yet. Saying so beats a form that always fails.
  const hasPassword = user?.auth?.password_set ?? true;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const context = { name: user?.full_name, email: user?.email };
  const passwordOk = evaluatePassword(newPassword, context).satisfied;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);

    const found: Record<string, string> = {};
    if (!currentPassword) found.old_password = copy.currentRequired;
    if (confirmPassword !== newPassword) found.confirm = copy.mismatch;

    setErrors(found);

    // The strength meter states what is missing; no second message above it.
    if (!passwordOk || Object.keys(found).length > 0) {
      focusFirstInvalid();
      return;
    }

    setBusy(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success(copy.updated, { description: copy.updatedHint });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAttempted(false);
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const shown = Object.fromEntries(
          Object.entries(fieldMessages(error.fields)).filter(([field]) => FIELDS.includes(field)),
        );
        // With no field named, a rejected new password is about the new one;
        // anything else — a wrong password, a lockout — about the current one.
        const field =
          error.is("PASSWORD_TOO_WEAK") || error.is("PASSWORD_SAME_AS_OLD")
            ? "new_password"
            : "old_password";
        setErrors(Object.keys(shown).length > 0 ? shown : { [field]: error.message });
        focusFirstInvalid();
      } else {
        toast.error(t.common.networkError);
      }
    } finally {
      setBusy(false);
    }
  };

  // Nothing to change on an account that signs in through a provider; the
  // connected-accounts card is where those are managed instead.
  if (!hasPassword) return null;

  return (
    <ProfileCard title={copy.title} description={copy.description}>
      <ExpandableRow
        icon="ri-lock-line"
        title={copy.rowTitle}
        value="••••••••••"
        valueLabel={copy.hidden}
        actionLabel={t.common.change}
        actionContext={copy.changeContext}
        cancelContext={copy.cancelContext}
        open={open}
        onToggle={() => {
          setOpen((current) => !current);
          setErrors({});
          setAttempted(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}
      >
        <form ref={formRef} onSubmit={submit} className="max-w-md" noValidate>
          <div className="space-y-5">
            <ProfileField
              label={copy.current}
              icon="ri-lock-line"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              autoFocus
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              error={errors.old_password}
              disabled={busy}
            />
            <div>
              <ProfileField
                label={copy.next}
                icon="ri-lock-password-line"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                error={errors.new_password}
                invalid={attempted && !passwordOk}
                describedBy={meterId}
                disabled={busy}
              />
              <div id={meterId}>
                <PasswordStrength password={newPassword} context={context} showFailures={attempted} />
              </div>
            </div>
            <ProfileField
              label={copy.confirm}
              icon="ri-lock-password-line"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={errors.confirm}
              disabled={busy}
            />
          </div>

          <SubmitRow busy={busy} label={copy.submit} icon="ri-shield-keyhole-line" />
        </form>
      </ExpandableRow>
    </ProfileCard>
  );
}
