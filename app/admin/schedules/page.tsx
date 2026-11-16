"use client";

import { useId, useState } from "react";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import ConfirmDialog from "@/app/components/admin/ConfirmDialog";
import ScanInspector from "@/app/components/admin/ScanInspector";
import UserInspector from "@/app/components/admin/UserInspector";
import { LastRun, NextRun, ScheduleStateLabel, useCadenceText } from "@/app/components/schedules/parts";
import Dropdown from "@/app/components/ui/Dropdown";
import SiteAddress, { ADDRESS_TEXT } from "@/app/components/ui/SiteAddress";
import {
  CONTROL,
  ICON_BUTTON,
  LoadFailure,
  RECORD_COUNT,
  ROW,
  SCROLL_REGION,
  TABLE,
  TD,
  TH,
  THEAD,
  TOOLBAR,
  TableFooter,
  TableLoading,
  TableMessage,
  useAddressPaging,
  useClampPage,
} from "@/app/components/ui/table";
import useApiQuery from "@/app/hooks/useApiQuery";
import useQueryParams from "@/app/hooks/useQueryParams";
import useSearchDraft from "@/app/hooks/useSearchDraft";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  blockSchedule,
  listAdminSchedules,
  unblockSchedule,
  type Schedule,
  type ScheduleState,
} from "@/app/lib/schedulesApi";
import { useToast } from "@/app/providers/ToastProvider";

const STATES: readonly ScheduleState[] = ["active", "paused", "blocked"];
const MAX_REASON = 200;

export default function AdminSchedulesPage() {
  const { t } = useI18n();

  return (
    <AdminFrame
      activePage="schedules"
      heading={{ title: t.schedules.admin.title, description: t.schedules.admin.description }}
    >
      <SchedulesView />
    </AdminFrame>
  );
}

function SchedulesView() {
  const { t, format } = useI18n();
  const copy = t.schedules.admin;
  const toast = useToast();
  const cadence = useCadenceText();
  const reasonId = useId();
  const [params, update] = useQueryParams();

  // A value the API would reject is ignored rather than sent on to fail validation.
  const state = STATES.find((option) => option === params.get("state"));
  const q = params.get("q")?.trim() ?? "";
  const inspectedScan = params.get("scan");
  const inspectedUser = params.get("user");
  const { page, size, offset, choice, fit, pager, panel, ready } = useAddressPaging(params, update, "admin-schedules");
  const [draft, setDraft] = useSearchDraft(q, (next) => update({ q: next || null, page: null }));

  const [blocking, setBlocking] = useState<Schedule | null>(null);
  const [unblocking, setUnblocking] = useState<Schedule | null>(null);
  const [reason, setReason] = useState("");

  const { data, loading, error, reload } = useApiQuery(
    ready ? `admin-schedules:${state}:${q}:${size}:${offset}` : null,
    (signal) => listAdminSchedules({ state, q: q || undefined, limit: size, offset }, signal),
  );
  useClampPage(data?.total, page, size, update);

  if (error?.kind === "forbidden") return <NoAccess />;

  const schedules = data?.schedules ?? [];
  const filtered = state !== undefined || q !== "";

  function clearFilters() {
    setDraft("");
    update({ state: null, q: null, page: null });
  }

  const owner = (schedule: Schedule) => schedule.user_email ?? copy.ownerGone;

  return (
    <>
      <div {...panel}>
        <div className={TOOLBAR}>
          <div className="relative w-full sm:w-72">
            <i
              className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label={copy.search}
              placeholder={`${copy.search}…`}
              maxLength={2048}
              className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 dark:placeholder:text-zinc-500`}
            />
          </div>
          <Dropdown
            label={copy.stateFilter}
            value={state ?? ""}
            options={[
              { value: "", label: copy.allStates },
              ...STATES.map((option) => ({ value: option, label: t.schedules.table.states[option] })),
            ]}
            onChange={(next) => update({ state: next || null, page: null })}
          />
          <p role="status" className={RECORD_COUNT}>
            {data ? t.table.records(data.total, format.number(data.total)) : null}
          </p>
        </div>

        {error ? (
          <LoadFailure error={error} title={t.admin.loadError} onRetry={reload} />
        ) : !data ? (
          <TableLoading columns={7} rows={size} pager={pager} />
        ) : schedules.length === 0 ? (
          <TableMessage>
            {filtered ? (
              <>
                <p>{copy.noMatches}</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  {copy.clearFilters}
                </button>
              </>
            ) : (
              copy.empty
            )}
          </TableMessage>
        ) : (
          // Scrolls sideways on a phone rather than squeezing the columns, and
          // is focusable so that works from the keyboard too.
          <div role="region" aria-label={copy.title} tabIndex={0} className={SCROLL_REGION}>
            <table className={`${TABLE} min-w-[76rem]`} aria-busy={loading || undefined}>
              <caption className="sr-only">{copy.caption}</caption>
              <thead className={THEAD}>
                <tr>
                  <th scope="col" className={TH}>
                    {t.schedules.table.columns.target}
                  </th>
                  <th scope="col" className={`${TH} w-52`}>
                    {copy.columns.owner}
                  </th>
                  <th scope="col" className={`${TH} w-60`}>
                    {t.schedules.table.columns.cadence}
                  </th>
                  <th scope="col" className={`${TH} w-36`}>
                    {t.schedules.table.columns.next}
                  </th>
                  <th scope="col" className={`${TH} w-48`}>
                    {t.schedules.table.columns.last}
                  </th>
                  <th scope="col" className={`${TH} w-32`}>
                    {t.schedules.table.columns.state}
                  </th>
                  <th scope="col" className={`${TH} w-14 text-right`}>
                    <span className="sr-only">{t.common.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${loading ? "opacity-50" : ""}`}>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className={ROW}>
                    <td className={`${TD} w-full max-w-0`}>
                      <SiteAddress url={schedule.target_url} favicon={schedule.favicon}>
                        <span className={ADDRESS_TEXT} title={schedule.target_url}>
                          {schedule.target_url}
                        </span>
                      </SiteAddress>
                    </td>
                    <td className={TD}>
                      {schedule.user_id ? (
                        <button
                          type="button"
                          onClick={() => update({ user: schedule.user_id ?? null })}
                          aria-label={t.admin.scans.openOwner(owner(schedule))}
                          title={owner(schedule)}
                          className="inline-flex max-w-48 cursor-pointer items-center gap-1 rounded text-cyan-700 hover:underline dark:text-cyan-400"
                        >
                          <i className="ri-user-line shrink-0" aria-hidden="true" />
                          <span className="truncate">{owner(schedule)}</span>
                        </button>
                      ) : null}
                    </td>
                    <td className={`${TD} max-w-60 text-zinc-700 dark:text-zinc-300`}>
                      <span className="block truncate" title={cadence(schedule)}>
                        {cadence(schedule)}
                      </span>
                    </td>
                    <td className={TD}>
                      <NextRun schedule={schedule} />
                    </td>
                    <td className={TD}>
                      <LastRun schedule={schedule} onOpenScan={(scan) => update({ scan })} />
                    </td>
                    <td className={TD}>
                      <ScheduleStateLabel schedule={schedule} />
                    </td>
                    <td className={`${TD} text-right`}>
                      {schedule.blocked ? (
                        <button
                          type="button"
                          onClick={() => setUnblocking(schedule)}
                          aria-haspopup="dialog"
                          aria-label={copy.unblock(schedule.target_url)}
                          title={copy.unblock(schedule.target_url)}
                          className={`${ICON_BUTTON} h-8 w-8`}
                        >
                          <i className="ri-lock-unlock-line" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReason("");
                            setBlocking(schedule);
                          }}
                          aria-haspopup="dialog"
                          aria-label={copy.block(schedule.target_url)}
                          title={copy.block(schedule.target_url)}
                          className={`${ICON_BUTTON} h-8 w-8 hover:text-rose-700 dark:hover:text-rose-400`}
                        >
                          <i className="ri-forbid-line" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 ? (
          <TableFooter
            total={data.total}
            offset={offset}
            size={size}
            choice={choice}
            fit={fit}
            onPageChange={(next) => update({ page: next === 1 ? null : next })}
            onSizeChange={(next) => update({ size: next === "fit" ? null : next, page: null })}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={blocking !== null}
        title={copy.blockTitle}
        description={blocking ? copy.blockDescription(blocking.target_url, owner(blocking)) : ""}
        confirmLabel={copy.blockConfirm}
        onClose={() => setBlocking(null)}
        onConfirm={async () => {
          if (!blocking) return;
          await blockSchedule(blocking.id, reason.trim());
          toast.success(copy.blocked);
          reload();
        }}
      >
        <label htmlFor={reasonId} className="mb-2 block text-xs text-zinc-600 dark:text-zinc-400">
          {copy.blockReason}
        </label>
        <textarea
          id={reasonId}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={MAX_REASON}
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm quiet-focus focus:border-zinc-500 dark:border-zinc-700/70 dark:bg-zinc-950/50 dark:focus:border-zinc-400"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={unblocking !== null}
        tone="primary"
        title={copy.unblockTitle}
        description={unblocking ? copy.unblockDescription(unblocking.target_url) : ""}
        confirmLabel={copy.unblockConfirm}
        onClose={() => setUnblocking(null)}
        onConfirm={async () => {
          if (!unblocking) return;
          await unblockSchedule(unblocking.id);
          toast.success(copy.unblocked);
          reload();
        }}
      />

      <ScanInspector
        scanId={inspectedScan}
        onClose={() => update({ scan: null })}
        onOpenOwner={(userId) => update({ scan: null, user: userId })}
        onDeleted={reload}
      />
      <UserInspector userId={inspectedUser} onClose={() => update({ user: null })} onChange={() => reload()} />
    </>
  );
}
