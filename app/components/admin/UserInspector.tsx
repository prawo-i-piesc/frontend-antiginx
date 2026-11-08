"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { NoAccess } from "@/app/components/admin/AdminFrame";
import ConfirmDialog from "@/app/components/admin/ConfirmDialog";
import { Empty, Field, Section, SectionTitle, SheetDialog, SheetLayout, SheetSkeleton } from "@/app/components/admin/Sheet";
import { Flag, IdCell, LoadFailure, Stamp, Tag } from "@/app/components/ui/table";
import { BUTTON_DANGER, BUTTON_PRIMARY, BUTTON_QUIET } from "@/app/components/profile/ui";
import Segmented from "@/app/components/ui/Segmented";
import useApiQuery from "@/app/hooks/useApiQuery";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  deleteUser,
  getUser,
  grantPro,
  GRANT_DAYS,
  logoutUser,
  revokePro,
  setUserRole,
  type AdminPlan,
  type AdminUser,
  type GrantDays,
} from "@/app/lib/adminApi";
import type { Messages } from "@/app/i18n/messages/en";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/app/providers/ToastProvider";

export type InspectorChange =
  | { type: "role"; user: AdminUser }
  | { type: "plan"; plan: AdminPlan }
  | { type: "logout" }
  | { type: "delete" };

/** grant and revoke are the administrator role; grantPro and revokePro the plan. */
type Action = "grant" | "revoke" | "grantPro" | "revokePro" | "signOut" | "remove";

/** The confirmation copy for each action. */
function confirmCopyOf(action: Action, copy: Messages["admin"]["inspector"]) {
  switch (action) {
    case "grantPro":
      return copy.grantProDialog;
    case "revokePro":
      return copy.revokeProDialog;
    default:
      return copy[action];
  }
}

/**
 * Everything GET /api/admin/users/:id knows about one account, and the
 * operations on it, in a panel that slides over the right edge of the list.
 */
export default function UserInspector({
  userId,
  onClose,
  onChange,
}: {
  userId: string | null;
  onClose: () => void;
  /** After a write went through, so the list behind can catch up. */
  onChange: (change: InspectorChange) => void;
}) {
  const id = useId();

  return (
    <SheetDialog open={userId !== null} onClose={onClose} labelledBy={`${id}-title`}>
      {userId ? <Inspector key={userId} titleId={`${id}-title`} userId={userId} onClose={onClose} onChange={onChange} /> : null}
    </SheetDialog>
  );
}

function Inspector({
  titleId,
  userId,
  onClose,
  onChange,
}: {
  titleId: string;
  userId: string;
  onClose: () => void;
  onChange: (change: InspectorChange) => void;
}) {
  const { t } = useI18n();
  const copy = t.admin.inspector;
  const toast = useToast();
  const { user: me } = useAuth();
  const [action, setAction] = useState<Action | null>(null);
  const [grantDays, setGrantDays] = useState<GrantDays>(GRANT_DAYS[0]);

  const { data, loading, error, reload } = useApiQuery(`user:${userId}`, (signal) => getUser(userId, signal));
  // Keyed by account, so the data on hand is always this account's: after an
  // action it stays on screen while the fresh copy loads.
  const details = data;
  const account = details?.user;
  const self = me?.id === userId;

  async function perform(current: Action, email: string) {
    switch (current) {
      case "grant":
      case "revoke": {
        const updated = await setUserRole(userId, current === "grant" ? "admin" : "user");
        toast.success(copy[current].done(email));
        onChange({ type: "role", user: updated });
        reload();
        return;
      }
      case "grantPro":
      case "revokePro": {
        const plan = current === "grantPro" ? await grantPro(userId, grantDays) : await revokePro(userId);
        toast.success(confirmCopyOf(current, copy).done(email));
        onChange({ type: "plan", plan });
        reload();
        return;
      }
      case "signOut":
        await logoutUser(userId);
        toast.success(copy.signOut.done(email));
        onChange({ type: "logout" });
        reload();
        return;
      case "remove":
        await deleteUser(userId);
        toast.success(copy.remove.done(email));
        onChange({ type: "delete" });
        onClose();
        return;
    }
  }

  const confirmCopy = action ? confirmCopyOf(action, copy) : null;
  const yesNo = (value: boolean) => (value ? copy.yes : copy.no);

  return (
    <SheetLayout
      titleId={titleId}
      title={copy.title}
      subtitle={account?.email ?? userId}
      busy={loading}
      onClose={onClose}
    >
      {loading && !details ? <SheetSkeleton sections={[5, 2, 7, 2]} /> : null}
      {error?.kind === "forbidden" ? <NoAccess /> : null}
      {error && error.kind !== "forbidden" ? (
        <LoadFailure error={error} title={copy.loadError} onRetry={reload} />
      ) : null}

      {details && account ? (
        <>
          <Section title={copy.sections.identity}>
            <Field label={copy.fields.id}>
              <IdCell id={account.id} />
            </Field>
            <Field label={copy.fields.email}>
              <span className="wrap-anywhere">{account.email}</span>
            </Field>
            <Field label={copy.fields.name}>{account.full_name || <Empty />}</Field>
            <Field label={copy.fields.role}>
              <Tag tone={account.role === "admin" ? "cyan" : "zinc"}>{t.admin.roles[account.role]}</Tag>
            </Field>
            <Field label={copy.fields.created}>
              <Stamp value={account.created_at} />
            </Field>
          </Section>

          <div>
            <PlanFields plan={details.plan} />
            <div className="mt-2">
              {details.plan.grant ? (
                <button type="button" onClick={() => setAction("revokePro")} className={BUTTON_QUIET}>
                  <i className="ri-close-circle-line" aria-hidden="true" />
                  {copy.revokePro}
                </button>
              ) : details.plan.can_grant ? (
                <button
                  type="button"
                  onClick={() => {
                    setGrantDays(GRANT_DAYS[0]);
                    setAction("grantPro");
                  }}
                  className={BUTTON_PRIMARY}
                >
                  <i className="ri-vip-diamond-line" aria-hidden="true" />
                  {copy.grantPro}
                </button>
              ) : (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{copy.paysNote}</p>
              )}
            </div>
          </div>

          <Section title={copy.sections.security}>
            <Field label={copy.fields.emailVerified}>
              <Flag on={account.email_verified} label={yesNo(account.email_verified)} />
            </Field>
            <Field label={copy.fields.password}>
              <Flag on={details.password_set} label={details.password_set ? copy.set : copy.notSet} />
            </Field>
            <Field label={copy.fields.totp}>
              <Flag on={account.totp_enabled} label={account.totp_enabled ? copy.on : copy.off} />
            </Field>
            <Field label={copy.fields.passkeys}>{details.passkeys}</Field>
            <Field label={copy.fields.passkeyMode}>{copy.passkeyModes[details.passkey_mode] ?? details.passkey_mode}</Field>
            <Field label={copy.fields.recoveryCodes}>{details.recovery_codes_remaining}</Field>
            <Field label={copy.fields.providers}>
              {details.providers.length > 0 ? details.providers.join(", ") : copy.none}
            </Field>
          </Section>

          <Section title={copy.sections.activity}>
            <Field label={copy.fields.sessions}>{details.active_sessions}</Field>
            <Field label={copy.fields.premiumScans}>
              {details.premium_scans}
              {details.premium_scans > 0 ? (
                <Link
                  href={`/admin/scans?owner=${encodeURIComponent(userId)}`}
                  className="ml-3 font-sans text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  {copy.showScans}
                  <span className="sr-only"> {copy.showScansContext}</span>
                </Link>
              ) : null}
            </Field>
          </Section>

          <section>
            <SectionTitle>{copy.sections.actions}</SectionTitle>
            {self ? (
              <div className="mt-2 rounded-lg border border-zinc-200 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                <p>{copy.selfNote}</p>
                <Link
                  href="/dashboard/profile"
                  className="mt-2 inline-flex items-center gap-1 font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  {copy.profileLink}
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setAction(account.role === "admin" ? "revoke" : "grant")}
                  className={BUTTON_PRIMARY}
                >
                  <i className={account.role === "admin" ? "ri-user-unfollow-line" : "ri-shield-user-line"} aria-hidden="true" />
                  {account.role === "admin" ? copy.removeAdmin : copy.makeAdmin}
                </button>
                <button type="button" onClick={() => setAction("signOut")} className={BUTTON_QUIET}>
                  <i className="ri-logout-box-r-line" aria-hidden="true" />
                  {copy.logout}
                </button>
                <button type="button" onClick={() => setAction("remove")} className={BUTTON_DANGER}>
                  <i className="ri-delete-bin-line" aria-hidden="true" />
                  {copy.delete}
                </button>
              </div>
            )}
          </section>

          <ConfirmDialog
            open={action !== null}
            title={confirmCopy?.title ?? ""}
            description={confirmCopy?.description(account.email) ?? ""}
            confirmLabel={confirmCopy?.confirm ?? ""}
            tone={action === "grant" || action === "grantPro" ? "primary" : "danger"}
            confirmText={action === "remove" ? account.email : undefined}
            confirmTextLabel={copy.remove.typeToConfirm}
            mismatch={copy.remove.mismatch}
            onConfirm={() => (action ? perform(action, account.email) : Promise.resolve())}
            onClose={() => setAction(null)}
          >
            {action === "grantPro" ? (
              <>
                <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400" aria-hidden="true">
                  {copy.grantLength}
                </p>
                <Segmented
                  value={grantDays}
                  options={GRANT_DAYS.map((days) => ({ value: days, label: copy.grantDays[days] }))}
                  onChange={setGrantDays}
                  label={copy.grantLength}
                />
              </>
            ) : null}
          </ConfirmDialog>
        </>
      ) : null}
    </SheetLayout>
  );
}

/** Where the account's plan comes from: Stripe, a grant, or neither. */
function PlanFields({ plan }: { plan: AdminPlan }) {
  const { t, format } = useI18n();
  const copy = t.admin.inspector;
  const { subscription, grant } = plan;

  const source = grant ? copy.sources.grant : plan.plan === "pro" ? copy.sources.stripe : copy.sources.none;
  const stripeState = subscription
    ? subscription.cancel_at && plan.plan === "pro" && !grant
      ? copy.cancelsOn(format.date(subscription.cancel_at))
      : (copy.stripeStatuses[subscription.status] ?? subscription.status)
    : null;

  return (
    <Section title={copy.sections.plan}>
      <Field label={copy.fields.plan}>
        <Tag tone={plan.plan === "pro" ? "violet" : "zinc"}>{t.admin.plans[plan.plan]}</Tag>
      </Field>
      <Field label={copy.fields.source}>{source}</Field>
      {grant ? (
        <>
          <Field label={copy.fields.granted}>
            <Stamp value={grant.granted_at} />{" "}
            <span className="text-zinc-600 dark:text-zinc-400">
              {grant.granted_by_email ? copy.grantedBy(grant.granted_by_email) : copy.grantedByGone}
            </span>
          </Field>
          <Field label={copy.fields.grantEnds}>
            {grant.expires_at ? <Stamp value={grant.expires_at} /> : copy.noEnd}
          </Field>
        </>
      ) : null}
      {subscription ? (
        <>
          <Field label={copy.fields.stripe}>{stripeState}</Field>
          {subscription.current_period_end ? (
            <Field label={copy.fields.periodEnd}>
              <Stamp value={subscription.current_period_end} />
            </Field>
          ) : null}
          <Field label={copy.fields.customer}>
            <IdCell id={subscription.stripe_customer_id} short={false} />
          </Field>
          <Field label={copy.fields.synced}>
            <Stamp value={subscription.synced_at} />
          </Field>
        </>
      ) : null}
    </Section>
  );
}
