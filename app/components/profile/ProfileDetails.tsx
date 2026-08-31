"use client";

import { useState } from "react";

import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import { MIN_NAME_LENGTH, updateEmail, updateFullName } from "@/app/lib/profileApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";

const CARD =
  "bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 shadow-sm flex flex-col h-full";
const LABEL = "block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2";
const INPUT =
  "w-full h-12 pl-11 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all";
const BUTTON =
  "h-12 px-6 w-full xl:w-auto rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60 transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export default function ProfileDetails() {
  const { user, reloadUser } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"name" | "email" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // The address on an account created through a provider belongs to that
  // provider, so changing it here would only put the two out of step.
  const canChangeEmail = user?.auth?.password_set ?? true;

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
    setBusy("name");
    try {
      await updateFullName(value);
      await reloadUser();
      setUsername("");
      toast.success("Username updated");
    } catch (error) {
      fail(error, "full_name");
    } finally {
      setBusy(null);
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
    setBusy("email");
    try {
      await updateEmail(value);
      await reloadUser();
      setEmail("");
      toast.success("Email updated");
    } catch (error) {
      fail(error, "email");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={`grid grid-cols-1 gap-6 ${canChangeEmail ? "lg:grid-cols-2" : ""}`}>
      <form onSubmit={submitName} className={CARD} noValidate>
        <div className="pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Change Username</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Update your public display name.</p>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-end mt-auto">
          <div className="flex-1 w-full">
            <label htmlFor="profile-username" className={LABEL}>
              New Username
            </label>
            <div className="relative">
              <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                id="profile-username"
                type="text"
                autoComplete="name"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder={user?.full_name ?? ""}
                aria-invalid={errors.full_name ? true : undefined}
                className={INPUT}
                disabled={busy !== null}
              />
            </div>
            {errors.full_name ? (
              <p className="text-xs text-rose-500 mt-2 ml-1">{errors.full_name}</p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={busy !== null || username.trim().length < MIN_NAME_LENGTH}
            className={BUTTON}
          >
            {busy === "name" ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
            <span>Update Username</span>
          </button>
        </div>
      </form>

      {canChangeEmail ? (
      <form onSubmit={submitEmail} className={CARD} noValidate>
        <div className="pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Email Address</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Change the email associated with your account.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-end mt-auto">
          <div className="flex-1 w-full">
            <label htmlFor="profile-email" className={LABEL}>
              New Email
            </label>
            <div className="relative">
              <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={user?.email ?? ""}
                aria-invalid={errors.email ? true : undefined}
                className={INPUT}
                disabled={busy !== null}
              />
            </div>
            {errors.email ? <p className="text-xs text-rose-500 mt-2 ml-1">{errors.email}</p> : null}
          </div>
          <button
            type="submit"
            disabled={busy !== null || !emailPattern.test(email.trim())}
            className={BUTTON}
          >
            {busy === "email" ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
            <span>Update Email</span>
          </button>
        </div>
      </form>
      ) : null}
    </div>
  );
}
