"use client";

import { useState } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";
import { requestEmailVerification } from "@/app/lib/authApi";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { MIN_NAME_LENGTH, updateEmail, updateFullName } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import {
  ExpandableRow,
  ProfileCard,
  ProfileField,
  ROW_BUTTON_PRIMARY,
  SecurityRow,
  SubmitRow,
  useFocusFirstInvalid,
} from "@/app/components/profile/ui";

type Editing = "name" | "email" | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileDetails() {
  const { t } = useI18n();
  const copy = t.profile.details;
  const { user, reloadUser } = useAuth();
  const toast = useToast();
  const [rowsRef, focusFirstInvalid] = useFocusFirstInvalid<HTMLDivElement>();

  const [editing, setEditing] = useState<Editing>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The address on an account created through a provider belongs to that
  // provider, so changing it here would only put the two out of step.
  const canChangeEmail = user?.auth?.password_set ?? true;

  // Providers vouch for the address they hand over, so only accounts that
  // registered with a password can still be waiting on this.
  const emailVerified = user?.auth?.email_verified ?? true;

  const resend = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await requestEmailVerification();
      toast.success(copy.unconfirmed.sent, {
        description: user?.email
          ? copy.unconfirmed.checkAddress(user.email)
          : copy.unconfirmed.checkInbox,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message, {
          description:
            error.is("RATE_LIMITED") && error.retryAfter
              ? t.common.retryInMinutes(Math.ceil(error.retryAfter / 60))
              : undefined,
        });
      } else {
        toast.error(t.common.networkError);
      }
    } finally {
      setBusy(false);
    }
  };

  const toggle = (section: Exclude<Editing, null>) => {
    setEditing((current) => (current === section ? null : section));
    setErrors({});
    setUsername("");
    setEmail("");
  };

  // Each form has a single field, so whatever the API objects to is shown
  // under it — and focus goes back there to fix it.
  const fail = (error: unknown, field: "full_name" | "email") => {
    if (!(error instanceof ApiError)) {
      toast.error(t.common.networkError);
      return;
    }
    setErrors({ [field]: fieldMessages(error.fields)[field] ?? error.message });
    focusFirstInvalid();
  };

  const submitName = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = username.trim();

    if (value.length < MIN_NAME_LENGTH) {
      setErrors({ full_name: copy.username.tooShort(MIN_NAME_LENGTH) });
      focusFirstInvalid();
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await updateFullName(value);
      await reloadUser();
      setEditing(null);
      setUsername("");
      toast.success(copy.username.saved);
    } catch (error) {
      fail(error, "full_name");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setErrors({ email: copy.email.invalid });
      focusFirstInvalid();
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      await updateEmail(value);
      await reloadUser();
      setEditing(null);
      setEmail("");
      toast.success(copy.email.saved);
    } catch (error) {
      fail(error, "email");
    } finally {
      setBusy(false);
    }
  };

  // Save is held back only while there is nothing to save: a value that is
  // there but wrong gets submitted, so the message saying what is wrong shows.
  return (
    <ProfileCard title={copy.title} description={copy.description}>
      <div ref={rowsRef} className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
        <ExpandableRow
          icon="ri-user-line"
          title={copy.username.title}
          value={user?.full_name ?? "—"}
          actionLabel={t.common.change}
          actionContext={copy.username.changeContext}
          cancelContext={copy.username.cancelContext}
          open={editing === "name"}
          onToggle={() => toggle("name")}
        >
          <form onSubmit={submitName} className="max-w-md" noValidate>
            <ProfileField
              label={copy.username.field}
              icon="ri-user-line"
              autoComplete="name"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              error={errors.full_name}
              hint={copy.username.hint(MIN_NAME_LENGTH)}
              disabled={busy}
            />
            <SubmitRow
              busy={busy}
              disabled={username.trim().length === 0}
              label={copy.username.save}
              icon="ri-save-line"
            />
          </form>
        </ExpandableRow>

        {!emailVerified ? (
          <SecurityRow
            icon="ri-mail-check-line"
            tone="warn"
            title={copy.unconfirmed.title}
            detail={copy.unconfirmed.detail}
            action={
              // aria-disabled rather than disabled: a disabled button drops
              // the keyboard focus it had the moment it was pressed.
              <button
                type="button"
                onClick={resend}
                aria-disabled={busy || undefined}
                className={ROW_BUTTON_PRIMARY}
              >
                <i
                  className={busy ? "ri-loader-4-line animate-spin" : "ri-mail-send-line"}
                  aria-hidden="true"
                />
                <span>{copy.unconfirmed.send}</span>
              </button>
            }
          />
        ) : null}

        {canChangeEmail ? (
          <ExpandableRow
            icon="ri-mail-line"
            title={copy.email.title}
            value={user?.email ?? "—"}
            actionLabel={t.common.change}
            actionContext={copy.email.changeContext}
            cancelContext={copy.email.cancelContext}
            open={editing === "email"}
            onToggle={() => toggle("email")}
          >
            <form onSubmit={submitEmail} className="max-w-md" noValidate>
              <ProfileField
                label={copy.email.field}
                icon="ri-mail-line"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={errors.email}
                hint={copy.email.hint}
                disabled={busy}
              />
              <SubmitRow
                busy={busy}
                disabled={email.trim().length === 0}
                label={copy.email.save}
                icon="ri-save-line"
              />
            </form>
          </ExpandableRow>
        ) : null}
      </div>
    </ProfileCard>
  );
}
