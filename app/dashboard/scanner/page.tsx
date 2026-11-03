"use client";

import Link from "next/link";
import { Suspense, useEffect, useEffectEvent, useId, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import DashboardShell from "@/app/components/layout/DashboardShell";
import PageHeader, { PAGE_ACTION, PAGE_ACTION_LABEL, PAGE_PADDING } from "@/app/components/layout/PageHeader";
import PagePending from "@/app/components/layout/PagePending";
import ReportDialog from "@/app/components/ReportDialog";
import ScanErrorModal from "@/app/components/ScanErrorModal";
import { RiskLabel } from "@/app/components/scan/labels";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import Dropdown from "@/app/components/ui/Dropdown";
import { SURFACE } from "@/app/components/ui/surface";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
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
} from "@/app/components/ui/table";
import usePolling from "@/app/hooks/usePolling";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { INTL_LOCALES } from "@/app/i18n/config";
import { SCAN_LIST_SIZES } from "@/app/lib/paging";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  ApiRequestError,
  calculateThreatLevel,
  createScan,
  getPremiumScanConfig,
  getScan,
  getUserScans,
  isFinishedStatus,
  type ScanResponse,
  type ScanStatus,
  type ScanTestOption,
  type TestCategory,
} from "@/app/lib/api";
import { isAbandoned } from "@/app/lib/liveScan";
import { riskBand, type RiskBand } from "@/app/lib/risk";
import { scanErrorMessage } from "@/app/lib/scanErrors";
import { buildRows, progressOf, type ScanProgress } from "@/app/lib/scanRows";

type StatusFilter = "all" | "active" | "COMPLETED" | "FAILED";
type RiskFilter = "all" | RiskBand;

type ScanRow = {
  id: string;
  url: string;
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

/** What the person can do about a failed request: check the connection, or just retry. */
type LoadError = "network" | "other";

/** A response tagged with the request it answers, so "loading" is simply "not answered yet". */
type Loaded<T> = { request: number; data: T; error: LoadError | null; at: number };

const STATUS_FILTERS: StatusFilter[] = ["all", "active", "COMPLETED", "FAILED"];
const RISK_FILTERS: RiskFilter[] = ["all", "critical", "high", "medium", "low", "none"];

/** How often the list looks again while one of its scans is running. */
const LIST_REFRESH_MS = 5_000;

const RETRY_BUTTON_CLASS = buttonClass("secondary", "sm");

/** Field labels in the new scan form. */
const FIELD_LABEL = "block text-xs font-medium text-zinc-600 dark:text-zinc-400";

/** Small text actions beside a heading, like "Select all". */
const TEXT_ACTION =
  "cursor-pointer text-xs font-medium text-cyan-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-400";

function durationSeconds(startedAt?: string | null, completedAt?: string | null): number | null {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  return (end - start) / 1000;
}

function mapScanToRow(scan: ScanResponse, at: number): ScanRow {
  const active = !isFinishedStatus(scan.status);
  const results = scan.results ?? [];

  return {
    id: scan.id,
    url: scan.target_url,
    status: scan.status,
    stale: isAbandoned(scan, at),
    progress: active ? progressOf(scan, buildRows(scan)) : null,
    // An engine notice is not a verdict: a scan that only produced those checked nothing.
    risk: results.some((result) => !result.notice) ? calculateThreatLevel(results) : null,
    createdAt: scan.created_at,
    durationSeconds: durationSeconds(scan.started_at, scan.completed_at),
  };
}

function loadErrorOf(error: unknown): LoadError {
  if (error instanceof ApiRequestError) return error.code === "NETWORK_ERROR" ? "network" : "other";
  // fetch() rejects with a TypeError when the network is down.
  return error instanceof TypeError ? "network" : "other";
}

/** Key for a category's open/closed state; the backend may send an empty name. */
function categoryKey(category: TestCategory, index: number): string {
  return category.category || `other-${index}`;
}

/**
 * What the address asks of the list. `?scan=` is an older link to a scan, now
 * at its own address. `?opened=` comes back from a scan's page and says whose
 * row should get the focus back, once the list is in.
 * Reads useSearchParams, so it renders inside a Suspense boundary of its own.
 */
function AddressRequests({ ready, onReturn }: { ready: boolean; onReturn: (scanId: string) => void }) {
  const params = useSearchParams();
  const linked = params.get("scan");
  const opened = params.get("opened");
  const router = useRouter();
  const pathname = usePathname();
  const returned = useEffectEvent(onReturn);

  useEffect(() => {
    if (linked) router.replace(`${pathname}/${encodeURIComponent(linked)}`);
  }, [linked, pathname, router]);

  useEffect(() => {
    if (!ready || !opened) return;
    returned(opened);
    router.replace(pathname, { scroll: false });
  }, [ready, opened, pathname, router]);

  return null;
}

export default function DashboardScannerPage() {
  const { t, locale, format } = useI18n();
  const { authenticated, initialized, auth } = useRequireAuth();
  const router = useRouter();

  const [showNewScan, setShowNewScan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(SCAN_LIST_SIZES[0]);
  const [listRequest, setListRequest] = useState(0);
  const [scanList, setScanList] = useState<Loaded<ScanResponse[]> | null>(null);

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [testsRequest, setTestsRequest] = useState(0);
  const [testConfig, setTestConfig] = useState<Loaded<TestCategory[]> | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [authorizedTester, setAuthorizedTester] = useState(false);

  /** The scan whose report dialog is open. */
  const [reportScan, setReportScan] = useState<{ id: string; url: string } | null>(null);

  const baseId = useId();
  const formId = `${baseId}-form`;
  const formHeadingId = `${baseId}-form-heading`;
  const scopeId = `${baseId}-scope`;
  const urlId = `${baseId}-url`;
  const urlErrorId = `${baseId}-url-error`;
  const noTestsHintId = `${baseId}-no-tests`;
  const searchId = `${baseId}-search`;
  const detailsButtonId = (scanId: string) => `${baseId}-details-${scanId}`;

  const urlInputRef = useRef<HTMLInputElement>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    getUserScans().then(
      (scans) => {
        if (!active) return;
        setScanList({ request: listRequest, data: scans, error: null, at: Date.now() });
      },
      (error: unknown) => {
        if (!active) return;
        console.error("Failed to load scans:", error);
        setScanList({ request: listRequest, data: [], error: loadErrorOf(error), at: Date.now() });
      },
    );

    return () => {
      active = false;
    };
  }, [authenticated, listRequest]);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    getPremiumScanConfig().then(
      (config) => {
        if (!active) return;
        setTestConfig({ request: testsRequest, data: config, error: null, at: Date.now() });
        // Every test starts selected, with the first category open.
        setSelectedTests(config.flatMap((category) => category.tests.map((test) => test.id)));
      },
      (error: unknown) => {
        if (!active) return;
        console.error("Failed to load the available tests:", error);
        setTestConfig({ request: testsRequest, data: [], error: loadErrorOf(error), at: Date.now() });
      },
    );

    return () => {
      active = false;
    };
  }, [authenticated, testsRequest]);

  const isLoadingScans = scanList?.request !== listRequest;
  const scanListError = isLoadingScans ? null : (scanList?.error ?? null);

  const scanRows = useMemo(
    () =>
      (scanList?.data ?? [])
        .map((scan) => mapScanToRow(scan, scanList?.at ?? 0))
        .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)),
    [scanList],
  );

  // A running scan changes on its own, so the list follows it until it ends,
  // reading only those: the whole list holds every result of every scan. A failed
  // read changes nothing, and the next one tries again.
  const runningScans = scanRows.filter((row) => row.progress !== null && !row.stale).map((row) => row.id);
  usePolling(
    () => {
      Promise.allSettled(runningScans.map((id) => getScan(id, { mode: "premium" }))).then((reads) => {
        const fresh = new Map(
          reads.flatMap((read) => (read.status === "fulfilled" ? [[read.value.id, read.value] as const] : [])),
        );
        setScanList((current) =>
          current?.request === listRequest
            ? { ...current, data: current.data.map((scan) => fresh.get(scan.id) ?? scan), at: Date.now() }
            : current,
        );
      });
    },
    runningScans.length > 0 ? LIST_REFRESH_MS : null,
  );

  const testsLoading = testConfig?.request !== testsRequest;
  const testsError = testsLoading ? null : (testConfig?.error ?? null);
  const testCategories = testConfig?.data ?? [];
  // Tests outside the plan cannot be chosen; the backend would refuse them too.
  // selectedTests may still hold them, so that moving to Pro finds them on:
  // anything that counts or sends the selection goes by testsToRun.
  const isLocked = (test: ScanTestOption) => test.pro && auth.user?.plan !== "pro";
  const allTestIds = testCategories.flatMap((category) =>
    category.tests.filter((test) => !isLocked(test)).map((test) => test.id),
  );
  const totalTests = allTestIds.length;
  const testsToRun = selectedTests.filter((id) => allTestIds.includes(id));
  const allSelected = totalTests > 0 && testsToRun.length === totalTests;

  const filteredScans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scanRows.filter(
      (row) =>
        row.url.toLowerCase().includes(query) &&
        (statusFilter === "all" ||
          (statusFilter === "active" ? row.progress !== null : row.status === statusFilter)) &&
        (riskFilter === "all" || (row.risk !== null && riskBand(row.risk) === riskFilter)),
    );
  }, [scanRows, searchQuery, statusFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredScans.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * pageSize;
  const paginatedScans = filteredScans.slice(pageStart, pageStart + pageSize);

  const numberFormats = useMemo(
    () => ({
      seconds: new Intl.NumberFormat(INTL_LOCALES[locale], {
        style: "unit",
        unit: "second",
        unitDisplay: "narrow",
        maximumFractionDigits: 1,
      }),
    }),
    [locale],
  );

  if (!initialized || !authenticated) return <PagePending layout="table" />;

  const categoryName = (name: string) => (name ? (t.scan.categories[name] ?? name) : t.scan.categoryOther);
  const testName = (test: ScanTestOption) =>
    t.scan.testsShort[test.id] ?? test.label.charAt(0).toLocaleUpperCase(INTL_LOCALES[locale]) + test.label.slice(1);

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "—";
    if (seconds < 1) {
      return (
        <>
          <span aria-hidden="true">{`<${numberFormats.seconds.format(1)}`}</span>
          <span className="sr-only">{t.scanner.list.underOneSecond}</span>
        </>
      );
    }
    return numberFormats.seconds.format(seconds);
  };

  function toggleTest(testId: string) {
    setSelectedTests((previous) =>
      previous.includes(testId) ? previous.filter((id) => id !== testId) : [...previous, testId],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isScanning) return;

    const target = url.trim();
    if (!target) {
      setUrlError(true);
      urlInputRef.current?.focus();
      return;
    }
    if (testsToRun.length === 0) return;

    setIsScanning(true);
    setStartError(null);
    try {
      const { scanId } = await createScan(target, testsToRun, { mode: "premium", authorizedTester });
      // Stays "scanning" until the page changes, so a second click cannot start another.
      router.push(`/dashboard/scanner/${encodeURIComponent(scanId)}`);
    } catch (error) {
      console.error("Scan error:", error);
      setStartError(scanErrorMessage(t.scan.errors, error));
      setIsScanning(false);
    }
  }

  /** Back from a scan's page: focus returns to its row, or to the heading if it is not on this page. */
  function returnFocus(scanId: string) {
    (document.getElementById(detailsButtonId(scanId)) ?? listHeadingRef.current)?.focus();
  }

  function openReport(scanId: string, url: string) {
    setReportScan({ id: scanId, url });
  }

  const hasResults = !isLoadingScans && !scanListError && filteredScans.length > 0;
  const noTestsSelected = !testsLoading && !testsError && testsToRun.length === 0;

  let listMessage = "";
  if (isLoadingScans) {
    listMessage = t.scanner.list.loading;
  } else if (!scanListError && scanRows.length === 0) {
    listMessage = t.scanner.list.empty;
  } else if (!scanListError && filteredScans.length === 0) {
    listMessage = t.scanner.list.noMatches;
  }

  return (
    <DashboardShell area="dashboard" activePage="scanner">
      <div className={PAGE_PADDING}>
        <Suspense fallback={null}>
          <AddressRequests ready={!isLoadingScans} onReturn={returnFocus} />
        </Suspense>

        <div className="page-in">
            <PageHeader
              title={t.scanner.title}
              description={t.scanner.subtitle}
              headingRef={listHeadingRef}
              actions={
                <button
                  type="button"
                  onClick={() => setShowNewScan((open) => !open)}
                  aria-expanded={showNewScan}
                  aria-controls={showNewScan ? formId : undefined}
                  // Solid while it is the way in; once the form is open, closing it is secondary.
                  className={`${buttonClass(showNewScan ? "secondary" : "primary")} ${PAGE_ACTION}`}
                >
                  <i className={showNewScan ? "ri-close-line" : "ri-add-line"} aria-hidden="true"></i>
                  <span className={PAGE_ACTION_LABEL}>{t.scanner.newScan}</span>
                </button>
              }
            />

            {showNewScan && (
              <form
                id={formId}
                onSubmit={onSubmit}
                noValidate
                aria-labelledby={formHeadingId}
                className={`${SURFACE} page-in mb-6 overflow-hidden`}
              >
                <div className={TOOLBAR}>
                  <h2 id={formHeadingId} className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.scanner.form.title}
                  </h2>
                  {/* Also where an empty selection is pointed out: in a slot that is
                      already there, so nothing below moves. */}
                  {!testsLoading && !testsError ? (
                    <p
                      id={noTestsHintId}
                      role="status"
                      className={`${DATA} ml-auto text-xs ${
                        noTestsSelected ? "font-medium text-amber-700 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {noTestsSelected
                        ? t.scanner.form.noTestsSelected
                        : allSelected
                          ? t.scanner.form.allSelected(totalTests)
                          : t.scanner.form.totalSelected(testsToRun.length, totalTests)}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-5 px-3 py-4 sm:px-4">
                  <div>
                    <label htmlFor={urlId} className={`${FIELD_LABEL} mb-1.5`}>
                      {t.scanner.form.urlLabel}
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="relative min-w-0 flex-1">
                        <i
                          className="ri-global-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                          aria-hidden="true"
                        ></i>
                        <input
                          ref={urlInputRef}
                          id={urlId}
                          type="text"
                          inputMode="url"
                          spellCheck={false}
                          autoFocus
                          required
                          value={url}
                          onChange={(event) => {
                            setUrl(event.target.value);
                            if (urlError) setUrlError(false);
                          }}
                          placeholder={t.scanner.form.urlPlaceholder}
                          aria-invalid={urlError || undefined}
                          aria-describedby={urlError ? urlErrorId : undefined}
                          className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 aria-invalid:border-rose-600 dark:placeholder:text-zinc-500 dark:aria-invalid:border-rose-400`}
                          // Read-only rather than disabled, so pressing Enter here keeps the focus.
                          readOnly={isScanning}
                        />
                      </div>
                      {/* While scanning it is only aria-disabled: a disabled button would drop the focus. */}
                      <button
                        type="submit"
                        disabled={testsLoading || testsToRun.length === 0}
                        aria-disabled={isScanning || undefined}
                        aria-describedby={noTestsSelected ? noTestsHintId : undefined}
                        className={buttonClass("primary")}
                      >
                        <i
                          className={isScanning ? "ri-loader-4-line animate-spin" : "ri-play-line"}
                          aria-hidden="true"
                        ></i>
                        <span>{isScanning ? t.scanner.form.scanning : t.scanner.form.submit}</span>
                      </button>
                    </div>

                    <div role="alert">
                      {urlError && (
                        <p
                          id={urlErrorId}
                          className="mt-2 flex items-center gap-1.5 text-sm text-rose-700 dark:text-rose-400"
                        >
                          <i className="ri-error-warning-line" aria-hidden="true"></i>
                          {t.scanner.form.urlRequired}
                        </p>
                      )}
                    </div>
                  </div>

                  <fieldset aria-labelledby={scopeId} className="min-w-0">
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <p id={scopeId} className={FIELD_LABEL}>
                        {t.scanner.form.scope}
                      </p>
                      {!testsLoading && !testsError ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTests(allSelected ? [] : allTestIds)}
                          disabled={isScanning}
                          className={TEXT_ACTION}
                        >
                          {allSelected ? t.scanner.form.categoryNone : t.scanner.form.categoryAll}
                        </button>
                      ) : null}
                    </div>

                    {testsLoading ? (
                      <SkeletonRegion className="space-y-3">
                        <Bone className="h-9 w-72 max-w-full rounded-lg" />
                        <Bone className="h-3.5 w-96 max-w-full" />
                      </SkeletonRegion>
                    ) : testsError ? (
                      <div className="rounded-lg border border-zinc-200 px-3 py-4 dark:border-zinc-800">
                        <p role="alert" className="mb-3 text-sm text-rose-700 dark:text-rose-400">
                          {t.scanner.form.testsLoadError}{" "}
                          {testsError === "network" ? t.common.networkError : t.common.genericError}
                        </p>
                        <button
                          type="button"
                          onClick={() => setTestsRequest((request) => request + 1)}
                          className={RETRY_BUTTON_CLASS}
                        >
                          <i className="ri-refresh-line" aria-hidden="true"></i>
                          {t.common.retry}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {testCategories.map((category, index) => {
                          const key = categoryKey(category, index);
                          const name = categoryName(category.category);
                          const headingId = `${baseId}-category-${index}`;
                          const selectable = category.tests.filter((test) => !isLocked(test));
                          const selectedCount = selectable.filter((test) => selectedTests.includes(test.id)).length;

                          return (
                            <div key={key} role="group" aria-labelledby={headingId}>
                              <div className="mb-2 flex items-baseline gap-3">
                                <p id={headingId} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {name}
                                </p>
                                <span className={`${DATA} text-xs text-zinc-600 dark:text-zinc-400`}>
                                  <span aria-hidden="true">
                                    {selectedCount}/{selectable.length}
                                  </span>
                                  <span className="sr-only">
                                    {t.scanner.form.selectedCount(selectedCount, selectable.length)}
                                  </span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {category.tests.map((test) => {
                                  if (isLocked(test)) {
                                    return (
                                      <Link
                                        key={test.id}
                                        href="/pricing"
                                        title={t.scanner.form.proTest}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-zinc-300 px-2.5 text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                                      >
                                        <i className="ri-lock-line text-sm leading-none" aria-hidden="true"></i>
                                        {testName(test)}
                                        <span className="text-xs font-medium">{t.shell.plans.pro}</span>
                                        <span className="sr-only">. {t.scanner.form.proTest}</span>
                                      </Link>
                                    );
                                  }
                                  const on = selectedTests.includes(test.id);
                                  return (
                                    <button
                                      key={test.id}
                                      type="button"
                                      onClick={() => toggleTest(test.id)}
                                      aria-pressed={on}
                                      disabled={isScanning}
                                      title={test.id}
                                      className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                        on
                                          ? "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
                                          : "border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-500 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                                      }`}
                                    >
                                      {/* On or off in a shape too, not only in colour. */}
                                      <i
                                        className={`text-sm leading-none ${on ? "ri-check-line text-cyan-700 dark:text-cyan-400" : "ri-add-line"}`}
                                        aria-hidden="true"
                                      ></i>
                                      {testName(test)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </fieldset>
                </div>

                <div className="border-t border-zinc-200 px-3 py-4 sm:px-4 dark:border-zinc-800">
                  {/* Ticking it sends anti_bot_detection. */}
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={authorizedTester}
                      onChange={(event) => setAuthorizedTester(event.target.checked)}
                      disabled={isScanning}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-cyan-700 disabled:cursor-not-allowed dark:accent-cyan-500"
                    />
                    <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {t.scanner.form.authorization}
                    </span>
                  </label>
                </div>
              </form>
            )}

            {!showNewScan && (
              <div className={PANEL}>
                <div className={TOOLBAR}>
                  <label htmlFor={searchId} className="sr-only">
                    {t.scanner.list.searchLabel}
                  </label>
                  <div className="relative w-full sm:w-72">
                    <i
                      className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
                      aria-hidden="true"
                    ></i>
                    <input
                      id={searchId}
                      type="search"
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder={t.scanner.list.searchPlaceholder}
                      className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 dark:placeholder:text-zinc-500`}
                    />
                  </div>
                  <Dropdown
                    label={t.scanner.list.filterLabel}
                    value={statusFilter}
                    options={STATUS_FILTERS.map((status) => ({
                      value: status,
                      label: status === "all" ? t.scanner.list.allStatuses : t.scanner.list.filters[status],
                    }))}
                    onChange={(next) => {
                      setStatusFilter(next);
                      setCurrentPage(1);
                    }}
                  />
                  <Dropdown
                    label={t.scanner.list.riskFilterLabel}
                    value={riskFilter}
                    options={RISK_FILTERS.map((band) => ({
                      value: band,
                      label: band === "all" ? t.scanner.list.allRisks : t.scan.riskBands[band],
                    }))}
                    onChange={(next) => {
                      setRiskFilter(next);
                      setCurrentPage(1);
                    }}
                  />
                  <p role="status" className={`${DATA} ml-auto text-xs text-zinc-600 dark:text-zinc-400`}>
                    {hasResults ? t.table.records(filteredScans.length, format.number(filteredScans.length)) : ""}
                  </p>
                </div>

                {scanListError ? (
                  <LoadFailure
                    error={
                      scanListError === "network"
                        ? { kind: "network" }
                        : { kind: "failed", message: t.common.genericError }
                    }
                    title={t.scanner.list.loadError}
                    onRetry={() => setListRequest((request) => request + 1)}
                  />
                ) : isLoadingScans ? (
                  <TableLoading columns={6} />
                ) : !hasResults ? (
                  <TableMessage>
                    <p>{listMessage}</p>
                    {scanRows.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setRiskFilter("all");
                          setCurrentPage(1);
                        }}
                        className="mt-2 cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400"
                      >
                        {t.scanner.list.clearFilters}
                      </button>
                    ) : null}
                  </TableMessage>
                ) : (
                  // Six columns do not fit a phone: the table scrolls sideways
                  // instead of squeezing, and is focusable so that works from the keyboard.
                  <div role="region" aria-label={t.scanner.list.caption} tabIndex={0} className={SCROLL_REGION}>
                    <table className={`${TABLE} min-w-[48rem]`}>
                      <caption className="sr-only">{t.scanner.list.caption}</caption>
                      <thead className={THEAD}>
                        <tr>
                          <th scope="col" className={TH}>
                            {t.scan.target}
                          </th>
                          <th scope="col" className={`${TH} w-32`}>
                            {t.scanner.list.columns.status}
                          </th>
                          <th scope="col" className={`${TH} w-36`}>
                            {t.scan.riskScore}
                          </th>
                          <th scope="col" className={`${TH} w-40`}>
                            {t.scanner.list.columns.date}
                          </th>
                          <th scope="col" className={`${TH} w-24`}>
                            {t.scanner.list.columns.duration}
                          </th>
                          <th scope="col" className={`${TH} w-32 text-right`}>
                            <span className="sr-only">{t.common.actions}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedScans.map((row) => (
                          <tr key={row.id} className={ROW}>
                            <td className={`${TD} w-full max-w-0`}>
                              {/* Cut short on screen; the full address stays in the text and the tooltip. */}
                              <span className="block truncate" title={row.url}>
                                {row.url}
                              </span>
                            </td>
                            <td className={TD}>
                              <span className="inline-flex items-baseline gap-1.5">
                                {row.stale ? (
                                  <span className="font-medium text-amber-700 dark:text-amber-400">
                                    {t.scan.live.noSignal}
                                  </span>
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
                                aria-label={t.scanner.list.viewDetails(row.url)}
                                title={t.scanner.list.viewDetails(row.url)}
                                className={`${ICON_BUTTON} h-8 w-8`}
                              >
                                <i className="ri-eye-line" aria-hidden="true"></i>
                              </Link>
                              <button
                                type="button"
                                onClick={() => openReport(row.id, row.url)}
                                aria-haspopup="dialog"
                                aria-label={t.scanner.list.downloadReport(row.url)}
                                title={t.scanner.list.downloadReport(row.url)}
                                // The backend reports on finished scans only, failed ones included.
                                disabled={row.progress !== null}
                                className={`${ICON_BUTTON} h-8 w-8 disabled:cursor-not-allowed disabled:opacity-40`}
                              >
                                <i className="ri-download-line" aria-hidden="true"></i>
                              </button>
                              {/* Deleting scans is not built yet: the button stays, marked as coming soon. */}
                              <button
                                type="button"
                                disabled
                                aria-label={t.scanner.list.deleteComingSoon(row.url)}
                                title={t.scanner.list.deleteComingSoon(row.url)}
                                className={`${ICON_BUTTON} h-8 w-8 cursor-not-allowed opacity-40`}
                              >
                                <i className="ri-delete-bin-line" aria-hidden="true"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {hasResults ? (
                  <TableFooter
                    total={filteredScans.length}
                    offset={pageStart}
                    size={pageSize}
                    sizes={SCAN_LIST_SIZES}
                    onPageChange={setCurrentPage}
                    onSizeChange={(next) => {
                      setPageSize(next);
                      setCurrentPage(1);
                    }}
                  />
                ) : null}
              </div>
            )}
        </div>
      </div>

      {startError ? <ScanErrorModal isOpen onClose={() => setStartError(null)} error={startError} /> : null}

      {reportScan && (
        <ReportDialog
          key={reportScan.id}
          open
          onClose={() => setReportScan(null)}
          scanId={reportScan.id}
          targetUrl={reportScan.url}
          mode="premium"
          variant="page"
        />
      )}
    </DashboardShell>
  );
}
