"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useId, useMemo, useState, type RefObject } from "react";

import { chartsHref } from "@/app/components/charts/domain";
import ReportDialog from "@/app/components/ReportDialog";
import { RiskLabel } from "@/app/components/scan/labels";
import Dropdown from "@/app/components/ui/Dropdown";
import SiteAddress, { ADDRESS_LINK } from "@/app/components/ui/SiteAddress";
import {
  CONTROL,
  DATA,
  ICON_BUTTON,
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
  useAddressPaging,
  useClampPage,
} from "@/app/components/ui/table";
import useApiQuery from "@/app/hooks/useApiQuery";
import usePolling from "@/app/hooks/usePolling";
import useQueryParams from "@/app/hooks/useQueryParams";
import useSearchDraft from "@/app/hooks/useSearchDraft";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  getUserScans,
  isFinishedStatus,
  SCAN_LIST_STATUSES,
  type ScanListItem,
  type ScanListPage,
  type ScanStatus,
} from "@/app/lib/api";
import { isAbandoned } from "@/app/lib/liveScan";
import type { ScanProgress } from "@/app/lib/scanRows";

/** How often the page is read again while one of its scans is running. */
const REFRESH_MS = 5_000;

type ScanRow = {
  id: string;
  url: string;
  favicon: string | null;
  status: ScanStatus;
  /** Still marked as running long after anything could have happened. */
  stale: boolean;
  /** While it runs. */
  progress: ScanProgress | null;
  /** Null until there is at least one result to judge by. */
  risk: number | null;
  createdAt: string;
  durationSeconds: number | null;
};

/** A page of scans, stamped with when it came, so a long-silent scan can be told apart. */
type Loaded = { page: ScanListPage; at: number };

function durationSeconds(startedAt: string | null, completedAt: string | null): number | null {
  if (!startedAt || !completedAt) return null;
  const start = Date.parse(startedAt);
  const end = Date.parse(completedAt);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return (end - start) / 1000;
}

function rowOf(scan: ScanListItem, at: number): ScanRow {
  const total = Array.isArray(scan.tests) ? scan.tests.length : null;
  return {
    id: scan.id,
    url: scan.target_url,
    favicon: scan.favicon ?? null,
    status: scan.status,
    stale: isAbandoned(scan, at),
    progress: isFinishedStatus(scan.status)
      ? null
      : { done: total === null ? scan.answered : Math.min(scan.answered, total), total },
    risk: scan.risk,
    createdAt: scan.created_at,
    durationSeconds: durationSeconds(scan.started_at, scan.completed_at),
  };
}

/**
 * The account's scans, a page at a time from the backend. The page, its size,
 * the search and the status filter live in the address, so a view can be
 * linked and survives a reload or the back button.
 *
 * While a scan on the page is running the page is read again every few
 * seconds, without dimming it: only a new search, filter or page dims the
 * rows on screen until the answer comes.
 *
 * `?scan=` is an older link to a scan, now at its own address. `?opened=`
 * comes back from a scan's page and says whose row gets the focus back; when
 * it is not on this page the focus goes to `headingRef`.
 *
 * Reads the address, so it renders inside a Suspense boundary.
 */
export default function ScanList({ headingRef }: { headingRef: RefObject<HTMLHeadingElement | null> }) {
  const { t, locale, format } = useI18n();
  const copy = t.scanner.list;
  const router = useRouter();
  const pathname = usePathname();
  const [params, update] = useQueryParams();

  const q = params.get("q")?.trim() ?? "";
  // A value the API would reject is ignored rather than sent on to fail validation.
  const status = SCAN_LIST_STATUSES.find((option) => option === params.get("status"));
  const { page, size, offset, choice, fit, panelRef } = useAddressPaging(params, update, "scanner");
  const [draft, setDraft] = useSearchDraft(q, (next) => update({ q: next || null, page: null }));

  const key = `scans:${q}:${status ?? ""}:${size}:${offset}`;
  const { data, loading, error, reload } = useApiQuery<Loaded>(key, async (signal) => ({
    page: await getUserScans({ q: q || undefined, status, limit: size, offset }, signal),
    at: Date.now(),
  }));

  // Which view the rows on screen answer. A refresh of the same view leaves
  // them as they are; anything else dims them until its answer comes.
  const [shownKey, setShownKey] = useState<string | null>(null);
  if (data && !loading && shownKey !== key) setShownKey(key);
  const changing = loading && shownKey !== key;

  const rows = useMemo(() => (data ? data.page.scans.map((scan) => rowOf(scan, data.at)) : []), [data]);
  const total = data?.page.total ?? 0;
  const running = rows.some((row) => row.progress !== null && !row.stale);
  usePolling(reload, running ? REFRESH_MS : null);
  useClampPage(data?.page.total, page, size, update);

  const baseId = useId();
  const detailsButtonId = (scanId: string) => `${baseId}-details-${scanId}`;
  const [reportScan, setReportScan] = useState<{ id: string; url: string; favicon: string | null } | null>(null);

  const legacyScan = params.get("scan");
  const opened = params.get("opened");
  useEffect(() => {
    if (legacyScan) router.replace(`${pathname}/${encodeURIComponent(legacyScan)}`);
  }, [legacyScan, pathname, router]);

  const returnFocus = useEffectEvent((scanId: string) => {
    (document.getElementById(detailsButtonId(scanId)) ?? headingRef.current)?.focus();
    update({ opened: null });
  });
  const ready = data !== undefined && !changing;
  useEffect(() => {
    if (ready && opened) returnFocus(opened);
  }, [ready, opened]);

  const seconds = useMemo(
    () =>
      new Intl.NumberFormat(INTL_LOCALES[locale], {
        style: "unit",
        unit: "second",
        unitDisplay: "narrow",
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  function formatDuration(value: number | null) {
    if (value === null) return "—";
    if (value < 1) {
      return (
        <>
          <span aria-hidden="true">{`<${seconds.format(1)}`}</span>
          <span className="sr-only">{copy.underOneSecond}</span>
        </>
      );
    }
    return seconds.format(value);
  }

  const filtered = q !== "" || status !== undefined;

  function clearFilters() {
    setDraft("");
    update({ q: null, status: null, page: null });
  }

  // A refresh that fails keeps the rows on screen; the next one tries again.
  const failed = error !== null && shownKey !== key ? error : null;

  return (
    <div ref={panelRef} className={PANEL}>
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
            aria-label={copy.searchLabel}
            placeholder={copy.searchPlaceholder}
            maxLength={2048}
            className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 dark:placeholder:text-zinc-500`}
          />
        </div>
        <Dropdown
          label={copy.filterLabel}
          value={status ?? "all"}
          options={[
            { value: "all", label: copy.allStatuses },
            ...SCAN_LIST_STATUSES.map((option) => ({ value: option, label: copy.filters[option] })),
          ]}
          onChange={(next) => update({ status: next === "all" ? null : next, page: null })}
        />
        <p role="status" className={`${DATA} ml-auto text-xs text-zinc-600 dark:text-zinc-400`}>
          {data && total > 0 ? t.table.records(total, format.number(total)) : ""}
        </p>
      </div>

      {failed ? (
        <LoadFailure error={failed} title={copy.loadError} onRetry={reload} />
      ) : !data ? (
        <TableLoading columns={6} />
      ) : rows.length === 0 ? (
        <TableMessage>
          <p>{filtered ? copy.noMatches : copy.empty}</p>
          {filtered ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400"
            >
              {copy.clearFilters}
            </button>
          ) : null}
        </TableMessage>
      ) : (
        // Six columns do not fit a phone: the table scrolls sideways instead of
        // squeezing, and is focusable so that works from the keyboard.
        <div role="region" aria-label={copy.caption} tabIndex={0} className={SCROLL_REGION}>
          <table className={`${TABLE} min-w-[48rem]`}>
            <caption className="sr-only">{copy.caption}</caption>
            <thead className={THEAD}>
              <tr>
                <th scope="col" className={TH}>
                  {t.scan.target}
                </th>
                <th scope="col" className={`${TH} w-32`}>
                  {copy.columns.status}
                </th>
                <th scope="col" className={`${TH} w-36`}>
                  {t.scan.riskScore}
                </th>
                <th scope="col" className={`${TH} w-40`}>
                  {copy.columns.date}
                </th>
                <th scope="col" className={`${TH} w-24`}>
                  {copy.columns.duration}
                </th>
                <th scope="col" className={`${TH} w-32 text-right`}>
                  <span className="sr-only">{t.common.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody className={`transition-opacity ${changing ? "opacity-50" : ""}`}>
              {rows.map((row) => (
                <tr key={row.id} className={ROW}>
                  <td className={`${TD} w-full max-w-0`}>
                    <SiteAddress url={row.url} favicon={row.favicon}>
                      {/* Cut short on screen; the full address stays in the text and the tooltip. */}
                      <Link href={chartsHref(row.url, row.createdAt)} title={t.scan.siteCharts(row.url)} className={ADDRESS_LINK}>
                        {row.url}
                      </Link>
                    </SiteAddress>
                  </td>
                  <td className={TD}>
                    <span className="inline-flex items-baseline gap-1.5">
                      {row.stale ? (
                        <span className="font-medium text-amber-700 dark:text-amber-400">{t.scan.live.noSignal}</span>
                      ) : (
                        <StatusLabel status={row.status} />
                      )}
                      {row.progress?.total && !row.stale ? (
                        <span className={`${DATA} text-xs text-zinc-600 dark:text-zinc-400`}>
                          {format.number(row.progress.done)}/{format.number(row.progress.total)}
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className={TD}>
                    {row.risk === null ? <span className={DATA}>—</span> : <RiskLabel score={row.risk} />}
                  </td>
                  <td className={TD}>
                    <Stamp value={row.createdAt} />
                  </td>
                  <td className={`${TD} ${DATA} text-zinc-600 dark:text-zinc-400`}>
                    {formatDuration(row.durationSeconds)}
                  </td>
                  <td className={`${TD} text-right`}>
                    <Link
                      id={detailsButtonId(row.id)}
                      href={`/dashboard/scanner/${encodeURIComponent(row.id)}`}
                      aria-label={copy.viewDetails(row.url)}
                      title={copy.viewDetails(row.url)}
                      className={`${ICON_BUTTON} h-8 w-8`}
                    >
                      <i className="ri-eye-line" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setReportScan({ id: row.id, url: row.url, favicon: row.favicon })}
                      aria-haspopup="dialog"
                      aria-label={copy.downloadReport(row.url)}
                      title={copy.downloadReport(row.url)}
                      // The backend reports on finished scans only, failed ones included.
                      disabled={row.progress !== null}
                      className={`${ICON_BUTTON} h-8 w-8 disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <i className="ri-download-line" aria-hidden="true" />
                    </button>
                    {/* Deleting scans is not built yet: the button stays, marked as coming soon. */}
                    <button
                      type="button"
                      disabled
                      aria-label={copy.deleteComingSoon(row.url)}
                      title={copy.deleteComingSoon(row.url)}
                      className={`${ICON_BUTTON} h-8 w-8 cursor-not-allowed opacity-40`}
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

      {data && total > 0 && !failed ? (
        <TableFooter
          total={total}
          offset={offset}
          size={size}
          choice={choice}
          fit={fit}
          onPageChange={(next) => update({ page: next === 1 ? null : next })}
          onSizeChange={(next) => update({ size: next === "fit" ? null : next, page: null })}
        />
      ) : null}

      {reportScan && (
        <ReportDialog
          key={reportScan.id}
          open
          onClose={() => setReportScan(null)}
          scanId={reportScan.id}
          targetUrl={reportScan.url}
          favicon={reportScan.favicon}
          mode="premium"
          variant="page"
        />
      )}
    </div>
  );
}
