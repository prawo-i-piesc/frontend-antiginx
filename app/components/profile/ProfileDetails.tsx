"use client";

import { useState } from "react";

import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { MIN_NAME_LENGTH, updateEmail, updateFullName } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import {
  ExpandableRow,
  ProfileCard,
  ProfileField,
  SubmitRow,
} from "@/app/components/profile/ui";

type Editing = "name" | "email" | null;

export default function ProfileDetails() {
  const { user, reloadUser } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState<Editing>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // The address on an account created through a provider belongs to that
  // provider, so changing it here would only put the two out of step.
  const canChangeEmail = user?.auth?.password_set ?? true;

  const toggle = (section: Exclude<Editing, null>) => {
    setEditing((current) => (current === section ? null : section));
    setErrors({});
    setUsername("");
    setEmail("");
  };

  const fail = (error: unknown, fallbackField: string) => {
    if (!(error instanceof ApiError)) {
      toast.error("We could not reach the server. Try again in a moment.");
      return;
    }
    const mapped = fieldMessages(error.fields);
    setErrors(Object.keys(mapped).length > 0 ? mapped : { [fallbackField]: error.message });
    toast.error(error.message);
  };

  const submitName = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = username.trim();

    if (value.length < MIN_NAME_LENGTH) {
      setErrors({ full_name: `Use at least ${MIN_NAME_LENGTH} characters.` });
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await updateFullName(value);
      await reloadUser();
      setEditing(null);
      setUsername("");
      toast.success("Username updated");
    } catch (error) {
      fail(error, "full_name");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();

    if (!emailPattern.test(value)) {
      setErrors({ email: "That does not look like an email address." });
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await updateEmail(value);
      await reloadUser();
      setEditing(null);
      setEmail("");
      toast.success("Email updated");
    } catch (error) {
      fail(error, "email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileCard title="Profile" description="Who you are inside the app.">
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
        <ExpandableRow
          icon="ri-user-line"
          title="Username"
          value={user?.full_name ?? "—"}
          actionLabel="Change"
          open={editing === "name"}
          onToggle={() => toggle("name")}
        >
          <form onSubmit={submitName} className="max-w-md" noValidate>
            <ProfileField
              label="New username"
              icon="ri-user-line"
              autoComplete="name"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              error={errors.full_name}
              hint={`At least ${MIN_NAME_LENGTH} characters.`}
              disabled={busy}
            />
            <SubmitRow
              busy={busy}
              disabled={username.trim().length < MIN_NAME_LENGTH}
              label="Save username"
              icon="ri-save-line"
            />
          </form>
        </ExpandableRow>

        {canChangeEmail ? (
          <ExpandableRow
            icon="ri-mail-line"
            title="Email address"
            value={user?.email ?? "—"}
            actionLabel="Change"
            open={editing === "email"}
            onToggle={() => toggle("email")}
          >
            <form onSubmit={submitEmail} className="max-w-md" noValidate>
              <ProfileField
                label="New email"
                icon="ri-mail-line"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={errors.email}
                hint="You sign in with this address."
                disabled={busy}
              />
              <SubmitRow
                busy={busy}
                disabled={!emailPattern.test(email.trim())}
                label="Save email"
                icon="ri-save-line"
              />
            </form>
          </ExpandableRow>
        ) : null}
      </div>
    </ProfileCard>
  );
}
