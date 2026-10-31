"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import DashboardShell from "@/app/components/layout/DashboardShell";
import ReportDialog from "@/app/components/ReportDialog";
import ScanErrorModal from "@/app/components/ScanErrorModal";
// Renamed so it does not clash with the API type of the same name.
import ScanResultItemComponent from "@/app/components/ScanResultItem";
import Pagination from "@/app/components/ui/Pagination";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useScanModal } from "@/app/hooks/useScanModal";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  ApiRequestError,
  calculateThreatLevel,
  getCompletedScanResults,
  getPremiumScanConfig,
  getUserScans,
  type ScanTestOption,
  type TestCategory,
  type UserScanResponse,
} from "@/app/lib/api";

type RowStatus = "safe" | "warning" | "danger";
type StatusFilter = "all" | RowStatus;

type ScanRow = {
  id: string;
  url: string;
  status: RowStatus;
  threat: number;
  createdAt: string;
  durationSeconds: number | null;
};

/** What the person can do about a failed request: check the connection, or just retry. */
type LoadError = "network" | "other";

/** A response tagged with the request it answers, so "loading" is simply "not answered yet". */
type Loaded<T> = { request: number; data: T; error: LoadError | null };

const PAGE_SIZE = 8;
const STATUS_FILTERS: StatusFilter[] = ["all", "safe", "warning", "danger"];
const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };

const STATUS_STYLES: Record<RowStatus, { chip: string; dot: string }> = {
  safe: {
    chip: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  warning: {
    chip: "bg-amber-500/12 text-amber-800 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
  },
  danger: {
    chip: "bg-rose-500/12 text-rose-700 dark:text-rose-400 border-rose-500/25",
    dot: "bg-rose-500",
  },
};

const RETRY_BUTTON_CLASS =
  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/85 dark:bg-zinc-900/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer";

const ROW_ACTION_CLASS =
  "w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/40 transition-colors";

function durationSeconds(startedAt?: string | null, completedAt?: string | null): number | null {
  if (!startedAt || !completedAt) return null;

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;

  return (end - start) / 1000;
}

function mapScanToRow(scan: UserScanResponse): ScanRow {
  const threat = calculateThreatLevel(scan.results || []);

  let status: RowStatus = "safe";
  if (scan.status === "FAILED") {
    status = "danger";
  } else if (scan.status === "RUNNING" || scan.status === "PENDING") {
    status = "warning";
  } else if (threat >= 80) {
    status = "danger";
  } else if (threat >= 40) {
    status = "warning";
  }

  return {
    id: scan.id,
    url: scan.target_url,
    status,
    threat,
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

function threatBarColor(level: number) {
  if (level >= 80) return "bg-red-500";
  if (level >= 40) return "bg-orange-500";
  return "bg-green-500";
}

function threatTextColor(level: number) {
  if (level >= 80) return "text-red-700 dark:text-red-400";
  if (level >= 40) return "text-orange-700 dark:text-orange-400";
  return "text-green-700 dark:text-green-400";
}

export default function DashboardScannerPage() {
  const { t, locale, format } = useI18n();
  const { authenticated, initialized } = useRequireAuth();

  const {
    scanResult,
    isScanning,
    scanError,
    isModalOpen,
    handleScan,
    closeModal,
    setScanResult,
    setScanError,
    setIsModalOpen,
  } = useScanModal({ mode: "premium" });

  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [showNewScan, setShowNewScan] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [listRequest, setListRequest] = useState(0);
  const [scanList, setScanList] = useState<Loaded<UserScanResponse[]> | null>(null);

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [testsRequest, setTestsRequest] = useState(0);
  const [testConfig, setTestConfig] = useState<Loaded<TestCategory[]> | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [authorizedTester, setAuthorizedTester] = useState(false);

  /** Address of the scan started from this page, for the screen reader announcements. */
  const [scanStartedFor, setScanStartedFor] = useState<string | null>(null);
  /** A running scan the person left for the list; finishing must not pull them back. */
  const [leftScanId, setLeftScanId] = useState<string | null>(null);
  /** The scan whose report dialog is open. */
  const [reportScan, setReportScan] = useState<{ id: string; url: string } | null>(null);

  const baseId = useId();
  const formId = `${baseId}-form`;
  const formHeadingId = `${baseId}-form-heading`;
  const urlId = `${baseId}-url`;
  const urlErrorId = `${baseId}-url-error`;
  const noTestsHintId = `${baseId}-no-tests`;
  const searchId = `${baseId}-search`;
  const detailsButtonId = (scanId: string) => `${baseId}-details-${scanId}`;

  const urlInputRef = useRef<HTMLInputElement>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  /** The row whose details are open, to return focus to its button. */
  const lastOpenedScanId = useRef<string | null>(null);
  const previousView = useRef(activeView);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    getUserScans().then(
      (scans) => {
        if (!active) return;
        setScanList({
          request: listRequest,
          data: scans.filter((scan) => scan.status === "COMPLETED"),
          error: null,
        });
      },
      (error: unknown) => {
        if (!active) return;
        console.error("Failed to load scans:", error);
        setScanList({ request: listRequest, data: [], error: loadErrorOf(error) });
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
        setTestConfig({ request: testsRequest, data: config, error: null });
        // Every test starts selected, with the first category open.
        setSelectedTests(config.flatMap((category) => category.tests.map((test) => test.id)));
        setExpandedCategories(config.length > 0 ? [categoryKey(config[0], 0)] : []);
      },
      (error: unknown) => {
        if (!active) return;
        console.error("Failed to load the available tests:", error);
        setTestConfig({ request: testsRequest, data: [], error: loadErrorOf(error) });
      },
    );

    return () => {
      active = false;
    };
  }, [authenticated, testsRequest]);

  // List and results swap in place: focus follows to the new view's heading,
  // and back to the row that was opened.
  useEffect(() => {
    if (previousView.current === activeView) return;
    previousView.current = activeView;

    if (activeView === "detail") {
      detailHeadingRef.current?.focus();
      return;
    }

    const openedId = lastOpenedScanId.current;
    const detailsButton = openedId ? document.getElementById(`${baseId}-details-${openedId}`) : null;
    (detailsButton ?? listHeadingRef.current)?.focus();
  }, [activeView, baseId]);

  const isLoadingScans = scanList?.request !== listRequest;
  const scanListError = isLoadingScans ? null : (scanList?.error ?? null);
  const userScans = useMemo(() => scanList?.data ?? [], [scanList]);

  const scanRows = useMemo(
    () =>
      userScans
        .map(mapScanToRow)
        .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)),
    [userScans],
  );

  const testsLoading = testConfig?.request !== testsRequest;
  const testsError = testsLoading ? null : (testConfig?.error ?? null);
  const testCategories = testConfig?.data ?? [];

  const filteredScans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return scanRows.filter(
      (row) => row.url.toLowerCase().includes(query) && (statusFilter === "all" || row.status === statusFilter),
    );
  }, [scanRows, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredScans.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const paginatedScans = filteredScans.slice(pageStart, pageStart + PAGE_SIZE);

  const numberFormats = useMemo(
    () => ({
      percent: new Intl.NumberFormat(INTL_LOCALES[locale], { style: "percent", maximumFractionDigits: 0 }),
      seconds: new Intl.NumberFormat(INTL_LOCALES[locale], {
        style: "unit",
        unit: "second",
        unitDisplay: "narrow",
        maximumFractionDigits: 1,
      }),
    }),
    [locale],
  );

  // The hook "opens its modal" once a scan is running or done; on this page
  // the results view takes its place.
  if (isModalOpen && scanResult && !scanError) {
    setIsModalOpen(false);
    if (scanResult.id !== leftScanId) {
      setShowNewScan(false);
      setActiveView("detail");
    }
  }

  const sortedResults = scanResult
    ? getCompletedScanResults(scanResult.results || [])
        .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 5) - (SEVERITY_ORDER[b.severity] ?? 5))
        .map((result, index) => ({ ...result, animIndex: index }))
    : [];
  const scanInProgress = !scanResult || scanResult.status === "PENDING" || scanResult.status === "RUNNING";

  let scanAnnouncement = "";
  if (scanStartedFor && !scanError) {
    if (scanResult?.status === "COMPLETED") {
      scanAnnouncement = `${t.scanner.announce.finished} ${t.scan.testsCompleted(sortedResults.length)}.`;
    } else if (scanResult?.status === "FAILED") {
      scanAnnouncement = t.scanner.announce.failed;
    } else {
      scanAnnouncement = t.scanner.announce.started(scanStartedFor);
    }
  }

  if (!initialized) return null;
  if (!authenticated) return null;

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

  const formatThreat = (level: number) => numberFormats.percent.format(level / 100);

  function toggleTest(testId: string) {
    setSelectedTests((previous) =>
      previous.includes(testId) ? previous.filter((id) => id !== testId) : [...previous, testId],
    );
  }

  function toggleCategorySelection(tests: ScanTestOption[]) {
    const testIds = tests.map((test) => test.id);
    setSelectedTests((previous) => {
      const allSelected = testIds.every((testId) => previous.includes(testId));
      return allSelected
        ? previous.filter((testId) => !testIds.includes(testId))
        : Array.from(new Set([...previous, ...testIds]));
    });
  }

  function toggleCategoryExpand(key: string) {
    setExpandedCategories((previous) =>
      previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key],
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
    if (selectedTests.length === 0) return;

    lastOpenedScanId.current = null;
    setScanStartedFor(target);
    await handleScan(target, selectedTests, authorizedTester);
    // The finished scan belongs in the list.
    setListRequest((request) => request + 1);
  }

  function openScanResult(scanId: string) {
    const selectedScan = userScans.find((scan) => scan.id === scanId);

    if (!selectedScan) {
      setScanError(t.scan.errors.detailsUnavailable);
      setIsModalOpen(true);
      return;
    }

    lastOpenedScanId.current = scanId;
    setScanStartedFor(null);
    setScanError(null);
    setScanResult(selectedScan);
    setActiveView("detail");
  }

  function openReport(scanId: string, url: string) {
    setReportScan({ id: scanId, url });
  }

  function backToList() {
    setLeftScanId(scanResult?.id ?? null);
    setActiveView("list");
  }

  const hasResults = !isLoadingScans && !scanListError && filteredScans.length > 0;
  const noTestsSelected = !testsLoading && !testsError && selectedTests.length === 0;

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
      <div className="p-3 sm:p-6">
        <p role="status" className="sr-only">
          {scanAnnouncement}
        </p>

        {activeView === "list" ? (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1
                  ref={listHeadingRef}
                  tabIndex={-1}
                  className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  {t.scanner.title}
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{t.scanner.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewScan((open) => !open)}
                aria-expanded={showNewScan}
                aria-controls={showNewScan ? formId : undefined}
                className={`px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer font-medium flex items-center gap-2 ${
                  showNewScan
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-400"
                    : "border-zinc-300 bg-white/85 dark:bg-zinc-900/20 dark:border-zinc-500/30 text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <i className={`text-lg ${showNewScan ? "ri-close-line" : "ri-add-line"}`} aria-hidden="true"></i>
                {t.scanner.newScan}
              </button>
            </div>

            {showNewScan && (
              <form
                id={formId}
                onSubmit={onSubmit}
                noValidate
                aria-labelledby={formHeadingId}
                className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 mb-6 animate-in fade-in duration-300 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
                  <h2 id={formHeadingId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.scanner.form.title}
                  </h2>
                </div>

                <div className="mb-5">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1">
                      <label
                        htmlFor={urlId}
                        className="block text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2"
                      >
                        {t.scanner.form.urlLabel}
                      </label>
                      <div className="relative">
                        <i
                          className="ri-global-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
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
                          className={`w-full h-12 pl-12 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 dark:placeholder-zinc-400 transition-all ${
                            urlError
                              ? "border-rose-600 dark:border-rose-400"
                              : "border-zinc-300 dark:border-zinc-700/60 focus:border-cyan-500/50"
                          }`}
                          // Read-only rather than disabled, so pressing Enter here keeps the focus.
                          readOnly={isScanning}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      {/* While scanning it is only aria-disabled: a disabled button would drop the focus. */}
                      <button
                        type="submit"
                        disabled={testsLoading || selectedTests.length === 0}
                        aria-disabled={isScanning || undefined}
                        aria-describedby={noTestsSelected ? noTestsHintId : undefined}
                        className="h-12 px-5 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60 transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed inline-flex items-center gap-2"
                      >
                        <i
                          className={isScanning ? "ri-loader-4-line animate-spin" : "ri-play-circle-line"}
                          aria-hidden="true"
                        ></i>
                        <span>{isScanning ? t.scanner.form.scanning : t.scanner.form.submit}</span>
                      </button>
                    </div>
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
                  <div role="status">
                    {noTestsSelected && (
                      <p id={noTestsHintId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {t.scanner.form.noTestsSelected}
                      </p>
                    )}
                  </div>
                </div>

                <fieldset className="min-w-0">
                  <legend className="block text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider mb-3">
                    {t.scanner.form.scope}
                  </legend>

                  <div role="status">
                    {testsLoading && (
                      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">{t.scanner.form.testsLoading}</p>
                    )}
                  </div>
                  <div role="alert">
                    {testsError && (
                      <p className="mb-3 text-sm text-rose-700 dark:text-rose-400">
                        {t.scanner.form.testsLoadError}{" "}
                        {testsError === "network" ? t.common.networkError : t.common.genericError}
                      </p>
                    )}
                  </div>
                  {testsError && (
                    <button
                      type="button"
                      onClick={() => setTestsRequest((request) => request + 1)}
                      className={`${RETRY_BUTTON_CLASS} mb-3`}
                    >
                      <i className="ri-refresh-line" aria-hidden="true"></i>
                      {t.common.retry}
                    </button>
                  )}

                  <div className="flex flex-col gap-3">
                    {testCategories.map((category, index) => {
                      const key = categoryKey(category, index);
                      const name = categoryName(category.category);
                      const panelId = `${baseId}-tests-${index}`;
                      const countId = `${baseId}-count-${index}`;
                      const isExpanded = expandedCategories.includes(key);
                      const selectedCount = category.tests.filter((test) => selectedTests.includes(test.id)).length;
                      const isAllSelected = selectedCount === category.tests.length && category.tests.length > 0;
                      const isIndeterminate = selectedCount > 0 && selectedCount < category.tests.length;

                      return (
                        <div
                          key={key}
                          className="border border-zinc-200 dark:border-zinc-700/60 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-800/20 shadow-sm"
                        >
                          <div
                            className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-100/70 dark:bg-zinc-800/40 border-b border-transparent data-[expanded=true]:border-zinc-200 dark:data-[expanded=true]:border-zinc-700/60 transition-colors"
                            data-expanded={isExpanded}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(input) => {
                                  if (input) input.indeterminate = isIndeterminate;
                                }}
                                onChange={() => toggleCategorySelection(category.tests)}
                                aria-label={t.scanner.form.selectCategory(name)}
                                aria-describedby={countId}
                                className="h-4 w-4 shrink-0 rounded border-zinc-400 dark:border-zinc-600 text-cyan-500 cursor-pointer"
                                disabled={isScanning || testsLoading}
                              />
                              <button
                                type="button"
                                onClick={() => toggleCategoryExpand(key)}
                                aria-expanded={isExpanded}
                                aria-controls={panelId}
                                className="min-h-6 text-left font-semibold text-zinc-800 dark:text-zinc-200 text-sm hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                {name}
                                <i
                                  className={`ri-arrow-down-s-line transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                  aria-hidden="true"
                                ></i>
                              </button>
                            </div>

                            <span
                              id={countId}
                              className="shrink-0 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/50 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/50"
                            >
                              {t.scanner.form.selectedCount(selectedCount, category.tests.length)}
                            </span>
                          </div>

                          <div
                            id={panelId}
                            role="group"
                            aria-label={name}
                            hidden={!isExpanded}
                            className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
                          >
                            {category.tests.map((test) => {
                              const selected = selectedTests.includes(test.id);
                              return (
                                <label
                                  key={test.id}
                                  className={`relative rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-all flex items-center gap-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus-ring) has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
                                    selected
                                      ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.15)]"
                                      : "border-zinc-300 dark:border-zinc-700/60 bg-white/70 dark:bg-zinc-800/35 text-zinc-700 dark:text-zinc-300 hover:border-cyan-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/55"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleTest(test.id)}
                                    className="sr-only"
                                    disabled={isScanning || testsLoading}
                                  />
                                  {/* The state in a shape, not only in colour. */}
                                  <i
                                    className={`shrink-0 text-base ${selected ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"}`}
                                    aria-hidden="true"
                                  ></i>
                                  <span className="font-medium min-w-0 wrap-anywhere" title={test.id}>
                                    {testName(test)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-5 px-4 py-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authorizedTester}
                      onChange={(event) => setAuthorizedTester(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-400 dark:border-zinc-600 text-cyan-500"
                      disabled={isScanning}
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{t.scanner.form.authorization}</span>
                  </label>
                </div>
              </form>
            )}

            {!showNewScan && (
              <>
                <div className="mb-2 pb-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <label htmlFor={searchId} className="sr-only">
                        {t.scanner.list.searchLabel}
                      </label>
                      <div className="relative border-b border-zinc-300 dark:border-zinc-700 focus-within:border-cyan-700 dark:focus-within:border-cyan-400 transition-colors">
                        <i
                          className="ri-search-line absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 text-lg"
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
                          className="w-full h-11 pl-8 pr-1 bg-transparent rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 dark:placeholder-zinc-400"
                        />
                      </div>
                    </div>
                    <div
                      role="group"
                      aria-label={t.scanner.list.filterLabel}
                      className="flex flex-wrap items-center gap-5"
                    >
                      {STATUS_FILTERS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setStatusFilter(status);
                            setCurrentPage(1);
                          }}
                          aria-pressed={statusFilter === status}
                          className={`relative pb-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                            statusFilter === status
                              ? "text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          {t.scanner.list.filters[status]}
                          {statusFilter === status && (
                            <span
                              className="absolute left-0 right-0 -bottom-px h-0.5 bg-cyan-700 dark:bg-cyan-400 rounded-full"
                              aria-hidden="true"
                            ></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between px-1 sm:px-2 ${
                    hasResults ? "mb-3" : ""
                  }`}
                >
                  <p role="status" className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    {hasResults
                      ? t.common.pagination.range(
                          pageStart + 1,
                          Math.min(pageStart + PAGE_SIZE, filteredScans.length),
                          filteredScans.length,
                        )
                      : ""}
                  </p>

                  {hasResults && totalPages > 1 && (
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      className="self-start lg:self-auto"
                    />
                  )}
                </div>

                <div className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 overflow-hidden shadow-sm">
                  {/* Six columns do not fit a phone: the table scrolls sideways instead of squeezing. */}
                  <div className="overflow-x-auto scrollbar-theme">
                    <table className="w-full min-w-180 table-fixed text-left">
                      <caption className="sr-only">{t.scanner.list.caption}</caption>
                      <thead className="border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-50/70 dark:bg-zinc-900/40 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400">
                        <tr>
                          <th scope="col" className="w-[34%] pl-6 pr-2 py-3 font-semibold text-left">
                            {t.scan.target}
                          </th>
                          <th scope="col" className="w-[15%] px-2 py-3 font-semibold text-left">
                            {t.scanner.list.columns.status}
                          </th>
                          <th scope="col" className="w-[16%] px-2 py-3 font-semibold text-left">
                            {t.scan.riskScore}
                          </th>
                          <th scope="col" className="w-[12%] px-2 py-3 font-semibold text-left">
                            {t.scanner.list.columns.date}
                          </th>
                          <th scope="col" className="w-[10%] px-2 py-3 font-semibold text-left">
                            {t.scanner.list.columns.duration}
                          </th>
                          <th scope="col" className="w-[13%] pl-2 pr-6 py-3 font-semibold text-right">
                            {t.common.actions}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                        {hasResults &&
                          paginatedScans.map((row) => {
                            const style = STATUS_STYLES[row.status];
                            return (
                              <tr
                                key={row.id}
                                className="hover:bg-zinc-100/70 dark:hover:bg-zinc-800/25 transition-colors"
                              >
                                <td className="pl-6 pr-2 py-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0"
                                      aria-hidden="true"
                                    >
                                      <i className="ri-global-line text-cyan-700 dark:text-cyan-400"></i>
                                    </div>
                                    <div className="min-w-0">
                                      {/* Cut short on screen as before; the full address stays in the
                                          text for screen readers and in the tooltip. */}
                                      <p className="text-zinc-900 dark:text-zinc-100 font-medium truncate" title={row.url}>
                                        {row.url}
                                      </p>
                                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                        {t.scanner.list.scanId(row.id)}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-2 py-4">
                                  <span
                                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${style.chip}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true"></span>
                                    {t.scanner.list.status[row.status]}
                                  </span>
                                </td>

                                <td className="px-2 py-4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-full max-w-25 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700/70 overflow-hidden"
                                      aria-hidden="true"
                                    >
                                      <div
                                        className={`h-full ${threatBarColor(row.threat)}`}
                                        style={{ width: `${row.threat}%` }}
                                      ></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${threatTextColor(row.threat)}`}>
                                      {formatThreat(row.threat)}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-2 py-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                  <time dateTime={row.createdAt}>{format.date(row.createdAt)}</time>
                                </td>
                                <td className="px-2 py-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                  {formatDuration(row.durationSeconds)}
                                </td>

                                <td className="pl-2 pr-6 py-4">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      id={detailsButtonId(row.id)}
                                      type="button"
                                      onClick={() => openScanResult(row.id)}
                                      aria-label={t.scanner.list.viewDetails(row.url)}
                                      title={t.scanner.list.viewDetails(row.url)}
                                      className={`${ROW_ACTION_CLASS} hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer`}
                                    >
                                      <i className="ri-eye-line text-cyan-700 dark:text-cyan-400" aria-hidden="true"></i>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openReport(row.id, row.url)}
                                      aria-haspopup="dialog"
                                      aria-label={t.scanner.list.downloadReport(row.url)}
                                      title={t.scanner.list.downloadReport(row.url)}
                                      className={`${ROW_ACTION_CLASS} hover:bg-zinc-100 dark:hover:bg-zinc-800/60 cursor-pointer`}
                                    >
                                      <i className="ri-download-line text-zinc-600 dark:text-zinc-400" aria-hidden="true"></i>
                                    </button>
                                    {/* Deleting scans is not built yet: the button stays, marked as coming soon. */}
                                    <button
                                      type="button"
                                      disabled
                                      aria-label={t.scanner.list.deleteComingSoon(row.url)}
                                      title={t.scanner.list.deleteComingSoon(row.url)}
                                      className={`${ROW_ACTION_CLASS} opacity-50 cursor-not-allowed`}
                                    >
                                      <i className="ri-delete-bin-line text-rose-700 dark:text-rose-400" aria-hidden="true"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <div role="status">
                    {listMessage && (
                      <p className="px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">{listMessage}</p>
                    )}
                  </div>
                  <div role="alert">
                    {scanListError && (
                      <p className="px-6 pt-8 text-sm text-rose-700 dark:text-rose-400">
                        {t.scanner.list.loadError}{" "}
                        {scanListError === "network" ? t.common.networkError : t.common.genericError}
                      </p>
                    )}
                  </div>
                  {scanListError && (
                    <div className="px-6 pt-3 pb-8">
                      <button
                        type="button"
                        onClick={() => setListRequest((request) => request + 1)}
                        className={RETRY_BUTTON_CLASS}
                      >
                        <i className="ri-refresh-line" aria-hidden="true"></i>
                        {t.common.retry}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:pr-14">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  type="button"
                  onClick={backToList}
                  aria-label={t.scanner.detail.back}
                  title={t.scanner.detail.back}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/85 dark:bg-zinc-900/20 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
                >
                  <i className="ri-arrow-left-line text-lg" aria-hidden="true"></i>
                </button>
                <div className="min-w-0">
                  <h1
                    ref={detailHeadingRef}
                    tabIndex={-1}
                    className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    {t.scan.resultsTitle}
                  </h1>
                  <p className="text-sm text-cyan-700 dark:text-cyan-400 font-mono font-medium wrap-anywhere">
                    <span className="sr-only">{t.scan.target}: </span>
                    {scanResult?.target_url.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </div>

              <div className="sm:ml-auto flex items-center gap-3">
                {sortedResults.length > 0 && (
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mr-2 hidden md:block">
                    {t.scan.testsCompleted(sortedResults.length)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => scanResult && openReport(scanResult.id, scanResult.target_url)}
                  aria-haspopup="dialog"
                  // The backend reports on finished scans only, failed ones included.
                  disabled={!scanResult || scanInProgress}
                  className="px-3 py-2 bg-white/85 dark:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-medium text-sm border border-zinc-300 dark:border-zinc-700 shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-download-line text-sm" aria-hidden="true"></i>
                  {t.scan.exportReport}
                </button>
              </div>
            </div>

            <div className="p-4 py-0 min-h-[400px]">
              {sortedResults.length > 0 ? (
                <div className="sm:px-10">
                  {/* Each result names its test in an h3. */}
                  <h2 className="sr-only">
                    {t.scanner.detail.resultsHeading}
                  </h2>
                  {/* Only worth saying when the interface is not in English itself. */}
                  {locale !== "en" ? (
                    <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">{t.scan.engineLanguageNote}</p>
                  ) : null}
                  <ul className="space-y-3">
                    {sortedResults.map((result) => (
                      <li key={result.id}>
                        <ScanResultItemComponent result={result} index={result.animIndex} variant="page" />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : scanInProgress ? (
                <div role="status" className="flex flex-col items-center justify-center h-full py-20">
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-4" aria-hidden="true">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500"></div>
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    {t.scan.inProgressTitle}
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">{t.scan.inProgressBody}</p>
                </div>
              ) : (
                <p className="py-20 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  {scanResult?.status === "FAILED" ? t.scanner.detail.failed : t.scanner.detail.noResults}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && scanError && <ScanErrorModal isOpen={isModalOpen} onClose={closeModal} error={scanError} />}

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
