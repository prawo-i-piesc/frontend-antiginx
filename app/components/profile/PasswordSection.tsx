"use client";

import { useState } from "react";

import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { evaluatePassword } from "@/app/lib/passwordPolicy";
import { updatePassword } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import PasswordStrength from "@/app/components/auth/PasswordStrength";
import { ExpandableRow, ProfileCard, ProfileField, SubmitRow } from "@/app/components/profile/ui";

export default function PasswordSection() {
  const { user } = useAuth();
  const toast = useToast();

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);

    const found: Record<string, string> = {};
    if (!currentPassword) found.old_password = "Enter your current password.";
    if (confirmPassword !== newPassword) found.confirm = "Both passwords have to match.";

    setErrors(found);

    // The strength meter states what is missing; no second message above it.
    const passwordOk = evaluatePassword(newPassword, context).satisfied;
    if (!passwordOk || Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success("Password updated", { description: "Use it the next time you sign in." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAttempted(false);
      setOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const mapped = fieldMessages(error.fields);
        setErrors(
          Object.keys(mapped).length > 0 ? mapped : { old_password: error.message },
        );
        toast.error(error.message);
      } else {
        toast.error("We could not reach the server. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  };

  // Nothing to change on an account that signs in through a provider; the
  // connected-accounts card is where those are managed instead.
  if (!hasPassword) return null;

  return (
    <ProfileCard title="Password" description="How you prove it is you.">
      <ExpandableRow
        icon="ri-lock-line"
        title="Password"
        value="••••••••••"
        actionLabel="Change"
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
        <form onSubmit={submit} className="max-w-md" noValidate>
          <div className="space-y-5">
            <ProfileField
              label="Current password"
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
                label="New password"
                icon="ri-lock-password-line"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••••"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                error={errors.new_password}
                disabled={busy}
              />
              <PasswordStrength password={newPassword} context={context} showFailures={attempted} />
            </div>
            <ProfileField
              label="Confirm new password"
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

          <SubmitRow busy={busy} label="Update password" icon="ri-shield-keyhole-line" />
        </form>
      </ExpandableRow>
    </ProfileCard>
  );
}
