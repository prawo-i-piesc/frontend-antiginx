"use client";

import { useEffect, useId, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import { linkProviderUrl, unlinkProvider } from "@/app/lib/authApi";
import { ApiError, messageForCode } from "@/app/lib/authErrors";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/app/lib/oauthProviders";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import {
  ActionLabel,
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
  const { t } = useI18n();
  const copy = t.profile.connected;
  const { user, reloadUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailIdBase = useId();
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
  // button is unavailable first so it never comes up as an error.
  const isOnlyWayIn = (provider: OAuthProvider) =>
    !hasPassword && linked.size === 1 && linked.has(provider);

  const connect = async (provider: OAuthProvider) => {
    if (busy !== null) return;
    setBusy(provider);
    try {
      window.location.assign(await linkProviderUrl(provider));
    } catch (error) {
      setBusy(null);
      toast.error(error instanceof ApiError ? error.message : t.common.networkError);
    }
  };

  const disconnect = async (provider: OAuthProvider, label: string) => {
    if (busy !== null || isOnlyWayIn(provider)) return;
    setBusy(provider);
    try {
      await unlinkProvider(provider);
      await reloadUser();
      toast.success(copy.disconnected(label));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.common.networkError);
    } finally {
      setBusy(null);
    }
  };

  // Which forms this page shows depends on whether the account has a password,
  // so it is spelled out rather than left to be guessed from what is missing.
  const methods = [
    ...(hasPassword ? [copy.password] : []),
    ...OAUTH_PROVIDERS.filter((provider) => linked.has(provider.id)).map(
      (provider) => provider.label,
    ),
  ];

  return (
    <ProfileCard title={copy.title} description={copy.description}>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        {copy.methods}{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {methods.length > 0 ? methods.join(" · ") : copy.noMethods}
        </span>
      </p>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700/50">
        {OAUTH_PROVIDERS.map((provider) => {
          const connected = linked.has(provider.id);
          const onlyWayIn = isOnlyWayIn(provider.id);
          const detailId = `${detailIdBase}-${provider.id}`;

          return (
            <SecurityRow
              key={provider.id}
              icon={provider.icon}
              tone={connected ? "on" : "off"}
              title={provider.label}
              detail={
                !provider.available
                  ? copy.unavailable
                  : connected
                    ? onlyWayIn
                      ? copy.onlyWayIn
                      : copy.linked
                    : copy.notLinked
              }
              detailId={detailId}
              action={
                // aria-disabled rather than disabled: the button stays
                // reachable, so the reason it is unavailable — the row's
                // detail — is read with it, and pressing it keeps focus.
                !provider.available ? null : connected ? (
                  <button
                    type="button"
                    onClick={() => void disconnect(provider.id, provider.label)}
                    aria-disabled={busy !== null || onlyWayIn || undefined}
                    aria-describedby={onlyWayIn ? detailId : undefined}
                    className={ROW_BUTTON_DANGER}
                  >
                    <i
                      className={
                        busy === provider.id ? "ri-loader-4-line animate-spin" : "ri-link-unlink"
                      }
                      aria-hidden="true"
                    />
                    <ActionLabel label={copy.disconnect} context={provider.label} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void connect(provider.id)}
                    aria-disabled={busy !== null || undefined}
                    className={ROW_BUTTON_PRIMARY}
                  >
                    <i
                      className={busy === provider.id ? "ri-loader-4-line animate-spin" : "ri-link"}
                      aria-hidden="true"
                    />
                    <ActionLabel label={copy.connect} context={provider.label} />
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
