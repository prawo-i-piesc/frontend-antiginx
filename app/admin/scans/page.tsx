"use client";

import { useState } from "react";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import ConfirmDialog from "@/app/components/admin/ConfirmDialog";
import ScanInspector from "@/app/components/admin/ScanInspector";
import UserInspector from "@/app/components/admin/UserInspector";
import Dropdown from "@/app/components/ui/Dropdown";
import {
  CONTROL,
  ICON_BUTTON,
  DATA,
  IdCell,
  LoadFailure,
  PANEL,
  ROW,
  SCROLL_REGION,
  Stamp,
  StatusLabel,
  TABLE,
  TD,
  TH,
  THEAD,
  TOOLBAR,
  TableFooter,
  TableLoading,
  TableMessage,
  Tag,
  pagingFrom,
  shortId,
  useClampPage,
} from "@/app/components/ui/table";
import useAdminQuery from "@/app/hooks/useAdminQuery";
import useQueryParams from "@/app/hooks/useQueryParams";
import useSearchDraft from "@/app/hooks/useSearchDraft";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  SCAN_STATUSES,
  SCAN_TYPES,
  deleteScan,
  listScans,
  type AdminScan,
  type ScanType,
} from "@/app/lib/adminApi";
import { PAGE_SIZES } from "@/app/lib/paging";
import { useToast } from "@/app/providers/ToastProvider";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminScansPage() {
  const { t } = useI18n();

  return (
    <AdminFrame activePage="scans" heading={{ title: t.admin.scans.title, description: t.admin.scans.description }}>
      <ScansView />
    </AdminFrame>
  );
}

function ScansView() {
  const { t, format } = useI18n();
  const copy = t.admin.scans;
  const toast = useToast();
  const [params, update] = useQueryParams();

  // Values the API would reject are ignored rather than sent on to fail validation.
  const type = SCAN_TYPES.find((option) => option === params.get("type"));
  const status = SCAN_STATUSES.find((option) => option === params.get("status"));
  const ownerParam = params.get("owner");
  const owner = ownerParam && UUID.test(ownerParam) ? ownerParam : undefined;
  const q = params.get("q")?.trim() ?? "";
  const inspectedScan = params.get("scan");
  const inspectedUser = params.get("user");
  const { page, size, offset } = pagingFrom(params);

  const [draft, setDraft] = useSearchDraft(q, (next) => update({ q: next || null, page: null }));
  const [doomed, setDoomed] = useState<AdminScan | null>(null);

  const { data, loading, error, reload } = useAdminQuery(
    `scans:${type}:${status}:${owner}:${q}:${size}:${offset}`,
    (signal) => listScans({ type, status, user_id: owner, q: q || undefined, limit: size, offset }, signal),
  );

  useClampPage(data?.total, page, size, update);

  if (error?.kind === "forbidden") return <NoAccess />;

  const scans = data?.scans ?? [];
  const filtered = type !== undefined || status !== undefined || owner !== undefined || q !== "";
  // Every row of an owner's list is theirs, so any of them names the owner.
  const ownerLabel = owner ? (scans.find((scan) => scan.user_email)?.user_email ?? shortId(owner)) : null;

  function clearFilters() {
    setDraft("");
    update({ type: null, status: null, owner: null, q: null, page: null });
  }

  function setType(next: ScanType | undefined) {
    update({ type: next ?? null, page: null });
  }

  async function remove(scan: AdminScan) {
    await deleteScan(scan.id);
    toast.success(copy.deleted);
    reload();
  }

  return (
    <>
      <div className={PANEL}>
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

          <div
            role="group"
            aria-label={copy.typeFilter}
            className="inline-flex rounded-lg border border-zinc-300 bg-zinc-50 p-0.5 dark:border-zinc-700/70 dark:bg-zinc-950/50"
          >
            {[undefined, ...SCAN_TYPES].map((option) => (
              <button
                key={option ?? "all"}
                type="button"
                onClick={() => setType(option)}
                aria-pressed={type === option}
                className={`h-8 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors ${
                  type === option
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {option ? copy.types[option] : copy.allTypes}
              </button>
            ))}
          </div>

          <Dropdown
            label={copy.statusFilter}
            value={status ?? ""}
            options={[
              { value: "", label: copy.allStatuses },
              ...SCAN_STATUSES.map((option) => ({ value: option, label: t.scan.status[option] })),
            ]}
            onChange={(next) => update({ status: next || null, page: null })}
          />

          {ownerLabel ? (
            <span className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 pl-2.5 pr-1 text-sm text-violet-800 dark:text-violet-300">
              <i className="ri-user-line" aria-hidden="true" />
              <span className="truncate">{copy.ownerFilter(ownerLabel)}</span>
              <button
                type="button"
                onClick={() => update({ owner: null, page: null })}
                aria-label={copy.clearOwner}
                title={copy.clearOwner}
                className={`${ICON_BUTTON} h-7 w-7`}
              >
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </span>
          ) : null}

          <p role="status" className={`${DATA} ml-auto text-xs text-zinc-600 dark:text-zinc-400`}>
            {data ? t.table.records(data.total, format.number(data.total)) : null}
          </p>
        </div>

        {error ? (
          <LoadFailure error={error} title={t.admin.loadError} onRetry={reload} />
        ) : !data ? (
          <TableLoading columns={7} />
        ) : scans.length === 0 ? (
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
          <div
            role="region"
            aria-label={copy.title}
            tabIndex={0}
            className={SCROLL_REGION}
          >
            <table className={`${TABLE} min-w-[60rem]`} aria-busy={loading || undefined}>
              <caption className="sr-only">{copy.caption}</caption>
              <thead className={THEAD}>
                <tr>
                  <th scope="col" className={`${TH} w-32`}>
                    {copy.columns.id}
                  </th>
                  <th scope="col" className={TH}>
                    {copy.columns.target}
                  </th>
                  <th scope="col" className={`${TH} w-28`}>
                    {copy.columns.type}
                  </th>
                  <th scope="col" className={`${TH} w-32`}>
                    {copy.columns.status}
                  </th>
                  <th scope="col" className={`${TH} w-52`}>
                    {copy.columns.owner}
                  </th>
                  <th scope="col" className={`${TH} w-40`}>
                    {copy.columns.created}
                  </th>
                  <th scope="col" className={`${TH} w-24 text-right`}>
                    <span className="sr-only">{copy.columns.actions}</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity ${loading ? "opacity-50" : ""}`}>
                {scans.map((scan) => (
                  <tr key={scan.id} className={ROW}>
                    <td className={TD}>
                      <IdCell id={scan.id} />
                    </td>
                    <td className={`${TD} w-full max-w-0`}>
                      <span className="block truncate" title={scan.target_url}>
                        {scan.target_url}
                      </span>
                    </td>
                    <td className={TD}>
                      <Tag tone={scan.type === "premium" ? "violet" : "zinc"}>{copy.types[scan.type]}</Tag>
                    </td>
                    <td className={TD}>
                      <StatusLabel status={scan.status} />
                    </td>
                    <td className={TD}>
                      {scan.user_id ? (
                        <button
                          type="button"
                          onClick={() => update({ user: scan.user_id ?? null })}
                          aria-label={copy.openOwner(scan.user_email ?? scan.user_id)}
                          title={scan.user_email ?? scan.user_id}
                          className={`inline-flex max-w-48 cursor-pointer items-center gap-1 rounded text-cyan-700 hover:underline dark:text-cyan-400`}
                        >
                          <i className="ri-user-line shrink-0" aria-hidden="true" />
                          <span className="truncate">{scan.user_email ?? copy.ownerGone}</span>
                        </button>
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">{copy.anonymous}</span>
                      )}
                    </td>
                    <td className={TD}>
                      <Stamp value={scan.created_at} />
                    </td>
                    <td className={`${TD} text-right`}>
                      <button
                        type="button"
                        onClick={() => update({ scan: scan.id })}
                        aria-label={`${copy.inspect} ${copy.inspectContext(scan.target_url)}`}
                        title={copy.inspect}
                        className={`${ICON_BUTTON} h-8 w-8`}
                      >
                        <i className="ri-side-bar-line" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDoomed(scan)}
                        aria-label={copy.delete(scan.target_url)}
                        title={copy.delete(scan.target_url)}
                        className={`${ICON_BUTTON} h-8 w-8 hover:text-rose-700 dark:hover:text-rose-400`}
                      >
                        <i className="ri-delete-bin-line" aria-hidden="true" />
                      </button>
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
            onPageChange={(next) => update({ page: next === 1 ? null : next })}
            onSizeChange={(next) => update({ size: next === PAGE_SIZES[0] ? null : next, page: null })}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={doomed !== null}
        title={copy.deleteTitle}
        description={doomed ? copy.deleteDescription(doomed.target_url) : ""}
        confirmLabel={copy.deleteConfirm}
        onConfirm={() => (doomed ? remove(doomed) : Promise.resolve())}
        onClose={() => setDoomed(null)}
      />

      <ScanInspector
        scanId={inspectedScan}
        onClose={() => update({ scan: null })}
        onOpenOwner={(userId) => update({ scan: null, user: userId })}
        onDeleted={reload}
      />

      {/* Deleting the owner deletes their premium scans too, so the list reloads. */}
      <UserInspector userId={inspectedUser} onClose={() => update({ user: null })} onChange={() => reload()} />
    </>
  );
}
