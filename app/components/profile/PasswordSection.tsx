"use client";

import { useState } from "react";

import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { evaluatePassword } from "@/app/lib/passwordPolicy";
import { updatePassword } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import PasswordRequirements from "@/app/components/auth/PasswordRequirements";
import { ProfileCard, ProfileField, SubmitRow } from "@/app/components/profile/ui";

export default function PasswordSection() {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const context = { name: user?.full_name, email: user?.email };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);

    const found: Record<string, string> = {};
    if (!currentPassword) found.old_password = "Enter your current password.";
    if (!evaluatePassword(newPassword, context).satisfied)
      found.new_password = "Your new password does not meet the requirements below.";
    if (confirmPassword !== newPassword) found.confirm = "Both passwords have to match.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success("Password updated", { description: "Use it the next time you sign in." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAttempted(false);
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

  return (
    <ProfileCard title="Password" description="Change the password you sign in with.">
      <form onSubmit={submit} noValidate>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ProfileField
              label="Current password"
              icon="ri-lock-line"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              error={errors.old_password}
              disabled={busy}
            />
            <ProfileField
              label="New password"
              icon="ri-lock-password-line"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={errors.new_password}
              disabled={busy}
            />
            <ProfileField
              label="Confirm new password"
              icon="ri-lock-password-line"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              error={errors.confirm}
              disabled={busy}
            />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-700/50 dark:bg-zinc-900/30">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Your new password needs
            </p>
            <PasswordRequirements
              password={newPassword}
              context={context}
              showFailures={attempted}
            />
          </div>
        </div>

        <SubmitRow busy={busy} label="Update password" icon="ri-shield-keyhole-line" />
      </form>
    </ProfileCard>
  );
}
