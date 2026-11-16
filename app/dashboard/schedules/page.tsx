"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

import ConfirmDialog from "@/app/components/admin/ConfirmDialog";
import { chartsHref } from "@/app/components/charts/domain";
import DashboardShell from "@/app/components/layout/DashboardShell";
import PageHeader, { PAGE_ACTION, PAGE_ACTION_LABEL, PAGE_PADDING } from "@/app/components/layout/PageHeader";
import PagePending from "@/app/components/layout/PagePending";
import { LastRun, NextRun, ScheduleStateLabel, useCadenceText } from "@/app/components/schedules/parts";
import ScheduleCalendar from "@/app/components/schedules/ScheduleCalendar";
import ScheduleForm from "@/app/components/schedules/ScheduleForm";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import SiteAddress, { ADDRESS_LINK } from "@/app/components/ui/SiteAddress";
import { SURFACE } from "@/app/components/ui/surface";
import {
  ICON_BUTTON,
  LoadFailure,
  PANEL,
  RECORD_COUNT,
  ROW,
  SCROLL_REGION,
  TABLE,
  TD,
  TH,
  THEAD,
  TOOLBAR,
  TableLoading,
  TableMessage,
} from "@/app/components/ui/table";
import useApiQuery from "@/app/hooks/useApiQuery";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useI18n } from "@/app/i18n/I18nProvider";
import { ApiError } from "@/app/lib/authErrors";
import { deleteSchedule, listSchedules, setScheduleEnabled, type Schedule } from "@/app/lib/schedulesApi";
import { useToast } from "@/app/providers/ToastProvider";

/** Closed, adding a new schedule, or editing one. */
type FormState = null | "new" | Schedule;

export default function SchedulesPage() {
  const { t } = useI18n();
  const copy = t.schedules;
  const { authenticated, initialized, auth } = useRequireAuth();
  const toast = useToast();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [form, setForm] = useState<FormState>(null);
  // Bumped by every change, so the calendar loads its month again.
  const [version, setVersion] = useState(0);
  const [deleting, setDeleting] = useState<Schedule | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const pro = auth.user?.plan === "pro";
  const { data, error, reload } = useApiQuery(authenticated ? "schedules" : null, listSchedules);

  if (!initialized || !authenticated) return <PagePending layout="table" />;

  const schedules = data?.schedules ?? [];
  const atLimit = data !== undefined && schedules.length >= data.limit;

  function changed() {
    reload();
    setVersion((value) => value + 1);
  }

  function failed(failure: unknown) {
    if (failure instanceof ApiError && failure.code === "PRO_REQUIRED") void auth.reloadUser();
    toast.error(
      failure instanceof ApiError ? failure.message : failure instanceof TypeError ? t.common.networkError : t.common.genericError,
    );
  }

  async function toggle(schedule: Schedule) {
    if (busy) return;
    setBusy(schedule.id);
    try {
      await setScheduleEnabled(schedule.id, !schedule.enabled);
      toast.success(schedule.enabled ? copy.toasts.paused : copy.toasts.resumed);
      changed();
    } catch (failure) {
      failed(failure);
    } finally {
      setBusy(null);
    }
  }

  const formOpen = form !== null;

  return (
    <DashboardShell area="dashboard" activePage="schedules">
      <div className={PAGE_PADDING}>
        <div className="page-in">
          <PageHeader
            title={copy.title}
            description={copy.subtitle}
            headingRef={headingRef}
            actions={
              pro ? (
                <button
                  type="button"
                  onClick={() => setForm((open) => (open ? null : "new"))}
                  aria-expanded={formOpen}
                  disabled={!formOpen && atLimit}
                  title={!formOpen && atLimit ? t.errors.codes.SCHEDULE_LIMIT_REACHED : undefined}
                  className={`${buttonClass(formOpen ? "secondary" : "primary")} ${PAGE_ACTION}`}
                >
                  <i className={formOpen ? "ri-close-line" : "ri-add-line"} aria-hidden="true"></i>
                  <span className={PAGE_ACTION_LABEL}>{copy.newSchedule}</span>
                </button>
              ) : null
            }
          />

          {!pro ? <Paywall /> : null}

          {formOpen ? (
            <ScheduleForm
              key={form === "new" ? "new" : form.id}
              schedule={form === "new" ? undefined : form}
              onCancel={() => setForm(null)}
              onSaved={(_, created) => {
                setForm(null);
                toast.success(created ? copy.toasts.created : copy.toasts.saved);
                changed();
                headingRef.current?.focus();
              }}
            />
          ) : null}

          {!formOpen && pro ? <ScheduleCalendar version={version} /> : null}

          {!formOpen && (pro || schedules.length > 0) ? (
            <div className={PANEL}>
              <div className={TOOLBAR}>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{copy.table.caption}</h2>
                <p role="status" className={RECORD_COUNT}>
                  {data ? (
                    <>
                      <span aria-hidden="true">{copy.table.count(schedules.length, data.limit)}</span>
                      <span className="sr-only">{copy.table.countLabel(schedules.length, data.limit)}</span>
                    </>
                  ) : null}
                </p>
              </div>
              {!pro && schedules.length > 0 ? (
                <p className="border-b border-zinc-200 px-3 py-2.5 text-sm text-amber-800 sm:px-4 dark:border-zinc-800 dark:text-amber-300">
                  <i className="ri-error-warning-line mr-1.5" aria-hidden="true" />
                  {copy.paywall.lapsed}
                </p>
              ) : null}

              {error ? (
                <LoadFailure error={error} title={copy.table.loadError} onRetry={reload} />
              ) : !data ? (
                <TableLoading columns={6} rows={3} />
              ) : schedules.length === 0 ? (
                <TableMessage>{copy.table.empty}</TableMessage>
              ) : (
                <ScheduleTable
                  schedules={schedules}
                  pro={pro}
                  busy={busy}
                  onToggle={(schedule) => void toggle(schedule)}
                  onEdit={(schedule) => setForm(schedule)}
                  onDelete={setDeleting}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={copy.deleteDialog.title}
        description={deleting ? copy.deleteDialog.description(deleting.target_url) : ""}
        confirmLabel={copy.deleteDialog.confirm}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await deleteSchedule(deleting.id);
          toast.success(copy.toasts.deleted);
          changed();
        }}
      />
    </DashboardShell>
  );
}

/** For an account without Pro: what schedules do, and the way to the plans. */
function Paywall() {
  const { t } = useI18n();
  const copy = t.schedules.paywall;
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={`${SURFACE} mb-6 px-4 py-6 sm:px-6`}>
      <div className="flex max-w-2xl items-start gap-3">
        <i className="ri-lock-line mt-0.5 text-lg text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
        <div>
          <h2 id={headingId} className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {copy.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{copy.body}</p>
          <Link href="/pricing" className={`${buttonClass("primary")} mt-4`}>
            {copy.action}
          </Link>
        </div>
      </div>
    </section>
  );
}

function ScheduleTable({
  schedules,
  pro,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  schedules: Schedule[];
  /** Without Pro a schedule can only be paused or deleted. */
  pro: boolean;
  busy: string | null;
  onToggle: (schedule: Schedule) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
}) {
  const { t, format } = useI18n();
  const copy = t.schedules.table;
  const cadence = useCadenceText();

  return (
    <div role="region" aria-label={copy.caption} tabIndex={0} className={SCROLL_REGION}>
      <table className={`${TABLE} min-w-[70rem]`}>
        <caption className="sr-only">{copy.caption}</caption>
        <thead className={THEAD}>
          <tr>
            <th scope="col" className={TH}>
              {copy.columns.target}
            </th>
            <th scope="col" className={`${TH} w-64`}>
              {copy.columns.cadence}
            </th>
            <th scope="col" className={`${TH} w-36`}>
              {copy.columns.next}
            </th>
            <th scope="col" className={`${TH} w-52`}>
              {copy.columns.last}
            </th>
            <th scope="col" className={`${TH} w-32`}>
              {copy.columns.state}
            </th>
            <th scope="col" className={`${TH} w-40 text-right`}>
              <span className="sr-only">{t.common.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            const url = schedule.target_url;
            // Resuming needs Pro and no block; pausing always works.
            const canResume = pro && !schedule.blocked;
            const toggleLabel = schedule.enabled ? copy.pause(url) : copy.resume(url);
            return (
              <tr key={schedule.id} className={ROW}>
                <td className={`${TD} w-full max-w-0`}>
                  <SiteAddress url={url} favicon={schedule.favicon}>
                    <Link href={chartsHref(url, schedule.created_at)} title={t.scan.siteCharts(url)} className={ADDRESS_LINK}>
                      {url}
                    </Link>
                  </SiteAddress>
                </td>
                <td className={`${TD} max-w-64 text-zinc-700 dark:text-zinc-300`}>
                  <span className="block truncate" title={cadence(schedule)}>
                    {cadence(schedule)}
                  </span>
                </td>
                <td className={TD}>
                  <NextRun schedule={schedule} />
                </td>
                <td className={TD}>
                  <LastRun schedule={schedule} scanHref={(id) => `/dashboard/scanner/${encodeURIComponent(id)}`} />
                </td>
                <td className={TD}>
                  <ScheduleStateLabel schedule={schedule} />
                </td>
                <td className={`${TD} text-right`}>
                  <Link
                    href={`/dashboard/scanner?schedule=${encodeURIComponent(schedule.id)}`}
                    aria-label={`${copy.history(url)}, ${copy.runs(schedule.runs)}`}
                    title={`${copy.history(url)} (${format.number(schedule.runs)})`}
                    className={`${ICON_BUTTON} h-8 w-8`}
                  >
                    <i className="ri-history-line" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggle(schedule)}
                    aria-label={toggleLabel}
                    title={schedule.blocked ? copy.blockedNote : toggleLabel}
                    disabled={busy === schedule.id || (!schedule.enabled && !canResume)}
                    className={`${ICON_BUTTON} h-8 w-8 disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <i
                      className={busy === schedule.id ? "ri-loader-4-line animate-spin" : schedule.enabled ? "ri-pause-line" : "ri-play-line"}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(schedule)}
                    aria-label={copy.edit(url)}
                    title={copy.edit(url)}
                    disabled={!pro}
                    className={`${ICON_BUTTON} h-8 w-8 disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <i className="ri-pencil-line" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(schedule)}
                    aria-haspopup="dialog"
                    aria-label={copy.delete(url)}
                    title={copy.delete(url)}
                    className={`${ICON_BUTTON} h-8 w-8 hover:text-rose-700 dark:hover:text-rose-400`}
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
