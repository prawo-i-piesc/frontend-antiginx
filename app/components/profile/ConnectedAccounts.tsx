"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { linkProviderUrl, unlinkProvider } from "@/app/lib/authApi";
import { ApiError, messageForCode } from "@/app/lib/authErrors";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/app/lib/oauthProviders";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import {
  ROW_BUTTON_DANGER,
  ROW_BUTTON_PRIMARY,
  ProfileCard,
  SecurityRow,
} from "@/app/components/profile/ui";

/**
 * Which failure has already been announced.
 *
 * Kept outside the component so a remount does not repeat the toast, the same
 * way the sign-in screen handles its own redirect errors.
 */
let reportedLinkError: string | null = null;

export default function ConnectedAccounts() {
  const { user, reloadUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState<OAuthProvider | null>(null);

  // Linking finishes with a redirect back here, so a failure arrives as a
  // query parameter rather than as a response this component could catch.
  const linkError = searchParams.get("error");
  useEffect(() => {
    if (!linkError || reportedLinkError === linkError) return;
    reportedLinkError = linkError;

    toast.error(messageForCode(linkError));
    router.replace(pathname);
  }, [linkError, toast, router, pathname]);

  const linked = new Set(user?.auth?.providers ?? []);
  const hasPassword = user?.auth?.password_set ?? true;

  // Removing the only way back into an account is refused by the API; the
  // button is disabled first so it never comes up as an error.
  const isOnlyWayIn = (provider: OAuthProvider) =>
    !hasPassword && linked.size === 1 && linked.has(provider);

  const connect = async (provider: OAuthProvider) => {
    setBusy(provider);
    try {
      window.location.href = await linkProviderUrl(provider);
    } catch (error) {
      setBusy(null);
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("We could not reach the server. Try again in a moment.");
    }
  };

  const disconnect = async (provider: OAuthProvider, label: string) => {
    setBusy(provider);
    try {
      await unlinkProvider(provider);
      await reloadUser();
      toast.success(`${label} disconnected`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("We could not reach the server. Try again in a moment.");
    } finally {
      setBusy(null);
    }
  };

  // Which forms this page shows depends on whether the account has a password,
  // so it is spelled out rather than left to be guessed from what is missing.
  const methods = [
    ...(hasPassword ? ["Password"] : []),
    ...OAUTH_PROVIDERS.filter((provider) => linked.has(provider.id)).map(
      (provider) => provider.label,
    ),
  ];

  return (
    <ProfileCard
      title="Connected accounts"
      description="Sign in with an account you already have, instead of a password."
    >
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        You can sign in with:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {methods.length > 0 ? methods.join(" · ") : "nothing yet"}
        </span>
      </p>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
        {OAUTH_PROVIDERS.map((provider) => {
          const connected = linked.has(provider.id);
          const onlyWayIn = isOnlyWayIn(provider.id);

          return (
            <SecurityRow
              key={provider.id}
              icon={provider.icon}
              tone={connected ? "on" : "off"}
              title={provider.label}
              detail={
                !provider.available
                  ? "Not available yet."
                  : connected
                    ? onlyWayIn
                      ? "Connected — and currently your only way to sign in."
                      : "Connected. You can sign in with it."
                    : "Not connected."
              }
              action={
                !provider.available ? null : connected ? (
                  <button
                    type="button"
                    onClick={() => disconnect(provider.id, provider.label)}
                    disabled={busy !== null || onlyWayIn}
                    title={onlyWayIn ? "Add another way to sign in first." : undefined}
                    className={ROW_BUTTON_DANGER}
                  >
                    <i
                      className={
                        busy === provider.id ? "ri-loader-4-line animate-spin" : "ri-link-unlink"
                      }
                      aria-hidden="true"
                    />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => connect(provider.id)}
                    disabled={busy !== null}
                    className={ROW_BUTTON_PRIMARY}
                  >
                    <i
                      className={busy === provider.id ? "ri-loader-4-line animate-spin" : "ri-link"}
                      aria-hidden="true"
                    />
                    <span>Connect</span>
                  </button>
                )
              }
            />
          );
        })}
      </div>
    </ProfileCard>
  );
}
