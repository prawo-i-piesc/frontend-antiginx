"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useI18n } from "@/app/i18n/I18nProvider";
import type { Messages } from "@/app/i18n/messages/en";
import type { Formatters } from "@/app/i18n/format";
import { ApiError } from "@/app/lib/authErrors";
import { checkoutUrl, getBilling, portalUrl, syncBilling, type BillingStatus } from "@/app/lib/billingApi";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";
import {
  ActionLabel,
  BUTTON_PRIMARY,
  BUTTON_QUIET,
  ProfileCard,
  SecurityRow,
} from "@/app/components/profile/ui";

/** Set by the backend on the addresses Stripe sends the browser back to. */
const RETURN_PARAM = "billing";

type Tone = "on" | "warn" | "off";

/** What the row says about the subscription, and how urgently. */
function describe(
  status: BillingStatus,
  copy: Messages["profile"]["plan"],
  format: Formatters,
): { detail: string; tone: Tone } {
  switch (status.status) {
    case "past_due":
      return { detail: copy.pastDue, tone: "warn" };
    case "unpaid":
      return { detail: copy.unpaid, tone: "warn" };
    case "paused":
      return { detail: copy.paused, tone: "warn" };
  }

  if (status.plan === "pro") {
    if (status.cancel_at) return { detail: copy.endsOn(format.date(status.cancel_at)), tone: "warn" };
    if (status.current_period_end) return { detail: copy.renews(format.date(status.current_period_end)), tone: "on" };
    return { detail: copy.active, tone: "on" };
  }

  if (!status.enabled) return { detail: copy.unavailable, tone: "off" };
  if (status.status === "canceled" || status.status === "incomplete_expired") return { detail: copy.ended, tone: "off" };
  return { detail: copy.freeDetail, tone: "off" };
}

export default function PlanSection() {
  const { t, format } = useI18n();
  const copy = t.profile.plan;
  const { user, reloadUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const returnedFrom = useSearchParams().get(RETURN_PARAM);
  const sectionRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<"checkout" | "portal" | null>(null);

  // Runs once. The return from Stripe is read and dropped from the address,
  // so reloading the page does not announce the payment a second time.
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (returnedFrom) router.replace(pathname, { scroll: false });
    // The page renders after the session settles, too late for the browser
    // to follow #plan from the pricing page on its own.
    if (returnedFrom || window.location.hash === "#plan") {
      sectionRef.current?.scrollIntoView({ block: "center" });
    }

    void (async () => {
      try {
        if (returnedFrom === "success" || returnedFrom === "portal") {
          // A webhook may come later or, behind the VPN, never; the backend
          // asks Stripe right away instead.
          const fresh = await syncBilling();
          setStatus(fresh);
          void reloadUser();
          if (returnedFrom === "portal") return;
          if (fresh.plan === "pro") toast.success(copy.welcome, { description: copy.welcomeHint });
          else toast.info(copy.processing, { description: copy.processingHint });
          return;
        }

        setStatus(await getBilling());
        if (returnedFrom === "cancel") toast.info(copy.cancelled, { description: copy.cancelledHint });
      } catch {
        setFailed(true);
      }
    })();
  }, [returnedFrom, router, pathname, reloadUser, toast, copy]);

  const go = async (target: "checkout" | "portal") => {
    if (busy !== null) return;
    setBusy(target);
    try {
      window.location.href = await (target === "checkout" ? checkoutUrl() : portalUrl());
    } catch (caught) {
      setBusy(null);
      toast.error(caught instanceof ApiError ? caught.message : t.common.networkError);
      // The row was out of date: show what the backend knows now.
      if (caught instanceof ApiError && caught.code === "ALREADY_SUBSCRIBED") {
        getBilling().then(setStatus, () => undefined);
      }
    }
  };

  const plan = status?.plan ?? user?.plan ?? "free";
  const { detail, tone } = status
    ? describe(status, copy, format)
    : { detail: failed ? copy.loadError : t.common.loading, tone: "off" as const };

  // unpaid and paused are settled in the portal, not with a second subscription.
  const settledInPortal =
    status !== null && (status.plan === "pro" || status.status === "unpaid" || status.status === "paused");
  const canUpgrade = status !== null && status.enabled && !settledInPortal;
  const canManage = status !== null && status.manageable;

  const button = (target: "checkout" | "portal", className: string, icon: string, label: string) => (
    <button
      type="button"
      onClick={() => void go(target)}
      aria-disabled={busy !== null || undefined}
      className={className}
    >
      <i className={busy === target ? "ri-loader-4-line animate-spin" : icon} aria-hidden="true" />
      <ActionLabel label={label} />
    </button>
  );

  return (
    <div id="plan" ref={sectionRef} className="scroll-mt-6">
      <ProfileCard title={copy.title} description={copy.description}>
        <SecurityRow
          icon={plan === "pro" ? "ri-vip-diamond-line" : "ri-user-line"}
          tone={tone}
          title={copy.names[plan]}
          detail={detail}
          action={
            <div className="flex flex-wrap gap-2">
              {/* What each plan includes, even where this server sells none of them. */}
              <Link href="/pricing" className={BUTTON_QUIET}>
                <i className="ri-price-tag-3-line" aria-hidden="true" />
                <ActionLabel label={copy.comparePlans} />
              </Link>
              {canManage
                ? button(
                    "portal",
                    canUpgrade || tone !== "warn" ? BUTTON_QUIET : BUTTON_PRIMARY,
                    "ri-external-link-line",
                    copy.manage,
                  )
                : null}
              {/* Full labels, unlike the icon-only row buttons elsewhere: on a
                  phone a bare diamond would not say what it buys. */}
              {canUpgrade ? button("checkout", BUTTON_PRIMARY, "ri-vip-diamond-line", copy.upgrade) : null}
            </div>
          }
        />
        {canManage ? <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">{copy.manageHint}</p> : null}
      </ProfileCard>
    </div>
  );
}
