"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";

import DashboardShell from "@/app/components/layout/DashboardShell";
import { PAGE_ACTION, PAGE_ACTION_LABEL, PAGE_PADDING } from "@/app/components/layout/PageHeader";
import PagePending from "@/app/components/layout/PagePending";
import ReportDialog from "@/app/components/ReportDialog";
import ScanResults from "@/app/components/scan/ScanResults";
import { buttonClass, iconButtonClass } from "@/app/components/ui/buttonStyles";
import { chartsHref } from "@/app/components/charts/domain";
import SiteAddress, { ADDRESS_LINK } from "@/app/components/ui/SiteAddress";
import { LoadFailure, PANEL, TableMessage } from "@/app/components/ui/table";
import useLiveScan from "@/app/hooks/useLiveScan";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useI18n } from "@/app/i18n/I18nProvider";
import { ApiRequestError, isFinishedStatus } from "@/app/lib/api";
import { scanErrorMessage } from "@/app/lib/scanErrors";

/** Unreachable or broken for now, as opposed to a scan that is gone or not this person's. */
function isWorthRetrying(error: ApiRequestError): boolean {
  return error.status === undefined || error.status >= 500;
}

/** One scan: its results, live for as long as it runs. Linkable and safe to reload. */
export default function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const { authenticated, initialized } = useRequireAuth();
  const live = useLiveScan(authenticated ? id : null, "premium");
  const [reportOpen, setReportOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The page replaced whatever was focused; the heading is where reading starts.
  useEffect(() => {
    if (authenticated) headingRef.current?.focus();
  }, [authenticated]);

  if (!initialized || !authenticated) return <PagePending layout="table" />;

  const scan = live.scan;
  const target = scan?.target_url.replace(/^https?:\/\//, "");

  return (
    <DashboardShell area="dashboard" activePage="scanner">
      <div className={`${PAGE_PADDING} page-in`}>
        <header className="mb-6 flex items-center gap-3 sm:gap-4">
          <Link
            // Tells the list which row to return focus to.
            href={`/dashboard/scanner?opened=${encodeURIComponent(id)}`}
            aria-label={t.scanner.detail.back}
            title={t.scanner.detail.back}
            className={iconButtonClass("secondary")}
          >
            <i className="ri-arrow-left-line" aria-hidden="true" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-bold text-zinc-900 focus:outline-none dark:text-zinc-100"
            >
              {t.scan.resultsTitle}
            </h1>
            {/* min-h keeps the title in place until the address arrives. */}
            <p className="mt-1 min-h-5 text-sm text-zinc-600 dark:text-zinc-400">
              {scan && target ? (
                <SiteAddress url={scan.target_url} favicon={scan.favicon}>
                  <Link
                    href={chartsHref(scan.target_url, scan.created_at)}
                    title={t.scan.siteCharts(scan.target_url)}
                    className={ADDRESS_LINK}
                  >
                    <span className="sr-only">{t.scan.target}: </span>
                    {target}
                  </Link>
                </SiteAddress>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-haspopup="dialog"
            // The backend reports on finished scans only, failed ones included.
            disabled={!scan || !isFinishedStatus(scan.status)}
            className={`${buttonClass("secondary")} ${PAGE_ACTION}`}
          >
            <i className="ri-download-line" aria-hidden="true" />
            <span className={PAGE_ACTION_LABEL}>{t.scan.exportReport}</span>
          </button>
        </header>

        {live.error ? (
          <div className={PANEL}>
            {isWorthRetrying(live.error) ? (
              <LoadFailure
                title={t.scanner.detail.loadError}
                error={
                  live.error.status === undefined
                    ? { kind: "network" }
                    : { kind: "failed", message: t.common.genericError }
                }
                onRetry={live.retry}
              />
            ) : (
              <TableMessage>
                <p role="alert">{scanErrorMessage(t.scan.errors, live.error)}</p>
                <Link
                  href="/dashboard/scanner"
                  className="mt-2 inline-block font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                >
                  {t.scanner.detail.back}
                </Link>
              </TableMessage>
            )}
          </div>
        ) : (
          <ScanResults live={live} />
        )}
      </div>

      {reportOpen && scan ? (
        <ReportDialog
          open
          onClose={() => setReportOpen(false)}
          scanId={scan.id}
          targetUrl={scan.target_url}
          favicon={scan.favicon}
          mode="premium"
          variant="page"
        />
      ) : null}
    </DashboardShell>
  );
}
