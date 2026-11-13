"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardShell from "@/app/components/layout/DashboardShell";
import PageHeader, { PAGE_ACTION, PAGE_ACTION_LABEL, PAGE_PADDING } from "@/app/components/layout/PageHeader";
import PagePending from "@/app/components/layout/PagePending";
import ScanErrorModal from "@/app/components/ScanErrorModal";
import ScanList from "@/app/components/scan/ScanList";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import { SURFACE } from "@/app/components/ui/surface";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { CONTROL, DATA, TOOLBAR } from "@/app/components/ui/table";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  ApiRequestError,
  createScan,
  getPremiumScanConfig,
  type ScanTestOption,
  type TestCategory,
} from "@/app/lib/api";
import { scanErrorMessage } from "@/app/lib/scanErrors";

/** What the person can do about a failed request: check the connection, or just retry. */
type LoadError = "network" | "other";

/** A response tagged with the request it answers, so "loading" is simply "not answered yet". */
type Loaded<T> = { request: number; data: T; error: LoadError | null; at: number };

const RETRY_BUTTON_CLASS = buttonClass("secondary", "sm");

/** Field labels in the new scan form. */
const FIELD_LABEL = "block text-xs font-medium text-zinc-600 dark:text-zinc-400";

/** Small text actions beside a heading, like "Select all". */
const TEXT_ACTION =
  "cursor-pointer text-xs font-medium text-cyan-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-400";

function loadErrorOf(error: unknown): LoadError {
  if (error instanceof ApiRequestError) return error.code === "NETWORK_ERROR" ? "network" : "other";
  // fetch() rejects with a TypeError when the network is down.
  return error instanceof TypeError ? "network" : "other";
}

/** Key for a category's open/closed state; the backend may send an empty name. */
function categoryKey(category: TestCategory, index: number): string {
  return category.category || `other-${index}`;
}

export default function DashboardScannerPage() {
  const { t, locale } = useI18n();
  const { authenticated, initialized, auth } = useRequireAuth();
  const router = useRouter();

  const [showNewScan, setShowNewScan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [testsRequest, setTestsRequest] = useState(0);
  const [testConfig, setTestConfig] = useState<Loaded<TestCategory[]> | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [authorizedTester, setAuthorizedTester] = useState(false);

  const baseId = useId();
  const formId = `${baseId}-form`;
  const formHeadingId = `${baseId}-form-heading`;
  const scopeId = `${baseId}-scope`;
  const urlId = `${baseId}-url`;
  const urlErrorId = `${baseId}-url-error`;
  const noTestsHintId = `${baseId}-no-tests`;

  const urlInputRef = useRef<HTMLInputElement>(null);
  const listHeadingRef = useRef<HTMLHeadingElement>(null);

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

  if (!initialized || !authenticated) return <PagePending layout="table" />;

  const categoryName = (name: string) => (name ? (t.scan.categories[name] ?? name) : t.scan.categoryOther);
  const testName = (test: ScanTestOption) =>
    t.scan.testsShort[test.id] ?? test.label.charAt(0).toLocaleUpperCase(INTL_LOCALES[locale]) + test.label.slice(1);

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

  const noTestsSelected = !testsLoading && !testsError && testsToRun.length === 0;

  return (
    <DashboardShell area="dashboard" activePage="scanner">
      <div className={PAGE_PADDING}>
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
              <Suspense fallback={null}>
                <ScanList headingRef={listHeadingRef} />
              </Suspense>
            )}
        </div>
      </div>

      {startError ? <ScanErrorModal isOpen onClose={() => setStartError(null)} error={startError} /> : null}

    </DashboardShell>
  );
}
