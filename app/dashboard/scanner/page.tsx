"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import useProfile from "@/app/hooks/useProfile";
import DashboardTopBar from "@/app/components/layout/DashboardTopBar";
import DashboardSidebar from "@/app/components/layout/DashboardSidebar";
import ScanResultModal from "@/app/components/ScanResultModal";
import ScanErrorModal from "@/app/components/ScanErrorModal";
import { useScanModal } from "@/app/hooks/useScanModal";
import {
  ApiRequestError,
  calculateThreatLevel,
  getPremiumScanConfig,
  getUserScans,
  ScanTestOption,
  UserScanResponse,
} from "@/app/lib/api";
import { downloadScanReport } from "@/app/lib/report";

type ScanRow = {
  id: string;
  url: string;
  status: "safe" | "warning" | "danger";
  threat: number;
  date: string;
  duration: string;
};

function formatDate(dateIso: string): string {
  if (!dateIso) return "-";
  return dateIso.slice(0, 10);
}

function formatDuration(startedAt?: string | null, completedAt?: string | null): string {
  if (!startedAt || !completedAt) return "-";

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "-";

  const seconds = (end - start) / 1000;
  if (seconds < 1) return "<1s";
  return `${seconds.toFixed(1)}s`;
}

function mapScanToRow(scan: UserScanResponse): ScanRow {
  const threat = calculateThreatLevel(scan.results || []);

  let status: ScanRow["status"] = "safe";
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
    date: formatDate(scan.created_at),
    duration: formatDuration(scan.started_at, scan.completed_at),
  };
}

export default function DashboardScannerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewScan, setShowNewScan] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "warning" | "danger">("all");
  const [url, setUrl] = useState("");
  const [testOptions, setTestOptions] = useState<ScanTestOption[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [authorizedTester, setAuthorizedTester] = useState(false);
  const [authorizationCopy, setAuthorizationCopy] = useState(
    "I confirm that I am authorized to test this domain with antiginx antibot scanner, and that I have obtained all necessary permissions to perform security testing on the target website.",
  );
  const [testsLoading, setTestsLoading] = useState(false);
  const [userScans, setUserScans] = useState<UserScanResponse[]>([]);
  const [scanRows, setScanRows] = useState<ScanRow[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(false);
  const [scanListError, setScanListError] = useState<string | null>(null);
  const [testsError, setTestsError] = useState<string | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { token, initialized, auth: authFromHook } = useRequireAuth();
  const auth = authFromHook;
  const { profileName } = useProfile(token);

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
  } = useScanModal({ mode: "premium", token });

  useEffect(() => {
    if (!token) return;

    let active = true;
    const loadScans = async () => {
      setIsLoadingScans(true);
      setScanListError(null);

      try {
        const scans = await getUserScans(token);
        if (!active) return;

        const completedScans = scans.filter((scan) => scan.status === "COMPLETED");

        const mapped = completedScans
          .map(mapScanToRow)
          .sort((a, b) => (a.date < b.date ? 1 : -1));

        setUserScans(completedScans);
        setScanRows(mapped);
      } catch (error) {
        if (!active) return;

        if (error instanceof ApiRequestError) {
          setScanListError(error.message);
        } else if (error instanceof Error) {
          setScanListError(error.message);
        } else {
          setScanListError("Failed to load scans");
        }
      } finally {
        if (active) setIsLoadingScans(false);
      }
    };

    loadScans();
    return () => {
      active = false;
    };
  }, [token, scanResult?.id]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    const loadTestConfig = async () => {
      setTestsLoading(true);
      setTestsError(null);

      try {
        const config = await getPremiumScanConfig(token);
        if (!active) return;

        const options = Array.isArray(config.tests) ? config.tests : [];
        setTestOptions(options);
        setSelectedTests(options.map((test) => test.id));
      } catch (error) {
        if (!active) return;

        if (error instanceof ApiRequestError) {
          setTestsError(error.message);
        } else if (error instanceof Error) {
          setTestsError(error.message);
        } else {
          setTestsError("Failed to load available tests");
        }
      } finally {
        if (active) setTestsLoading(false);
      }
    };

    loadTestConfig();

    return () => {
      active = false;
    };
  }, [token]);

  const filteredScans = useMemo(() => {
    return scanRows.filter((row) => {
      const matchesText = row.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : row.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [scanRows, searchQuery, statusFilter]);

  if (!initialized) return null;
  if (!token) return null;

  function toggleTest(testId: string) {
    setSelectedTests((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((t) => t !== testId);
      }
      return [...prev, testId];
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTests.length === 0) return;

    await handleScan(url.trim(), selectedTests, {
      authorizedTester,
    });
  }

  function threatBarColor(level: number) {
    if (level >= 80) return "bg-red-500";
    if (level >= 40) return "bg-orange-500";
    return "bg-green-500";
  }

  function threatTextColor(level: number) {
    if (level >= 80) return "text-red-400";
    if (level >= 40) return "text-orange-400";
    return "text-green-400";
  }

  function statusMeta(status: "safe" | "warning" | "danger") {
    if (status === "safe") {
      return {
        label: "Safe",
        chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        dot: "bg-emerald-500",
      };
    }
    if (status === "warning") {
      return {
        label: "Warning",
        chip: "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25",
        dot: "bg-amber-500",
      };
    }
    return {
      label: "Danger",
      chip: "bg-rose-500/12 text-rose-600 dark:text-rose-400 border-rose-500/25",
      dot: "bg-rose-500",
    };
  }

  function openScanResult(scanId: string) {
    const selectedScan = userScans.find((scan) => scan.id === scanId);

    if (!selectedScan) {
      setScanError("Scan details are not available yet.");
      setIsModalOpen(true);
      return;
    }

    setScanError(null);
    setScanResult(selectedScan);
    setIsModalOpen(true);
  }

  function downloadScan(scanId: string) {
    const selectedScan = userScans.find((scan) => scan.id === scanId);

    if (!selectedScan) {
      setScanError("Scan details are not available yet.");
      setIsModalOpen(true);
      return;
    }

    downloadScanReport(selectedScan);
  }

  return (
    <div className="h-screen xl:flex bg-zinc-200 dark:bg-zinc-950 transition-colors select-none">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        profileName={profileName}
        onLogout={() => auth.logout()}
        activePage="scanner"
      />

      <div className="flex-1 flex flex-col min-h-screen xl:ml-0">
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          showSearch
          showNotifications
          showMessages
        />

        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950">
          <div className="p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Scanner</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Browse all completed website scans</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewScan((v) => !v)}
                className={`px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer font-medium flex items-center gap-2 ${
                  showNewScan
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-500 dark:text-cyan-400"
                    : "border-zinc-300 bg-white/85 dark:bg-zinc-900/20 dark:border-zinc-500/30 text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                <i className={`text-lg ${showNewScan ? "ri-close-line" : "ri-add-line"}`}></i>
                New scan
              </button>
            </div>

            {showNewScan && (
              <form onSubmit={onSubmit} className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 mb-6 animate-in fade-in duration-300 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Run new scan</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Set target URL and choose security tests.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700/60 bg-zinc-100/70 dark:bg-zinc-800/40 text-xs font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                    <i className="ri-shield-check-line text-cyan-500 dark:text-cyan-400" />
                    {selectedTests.length} tests selected
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-3 mb-5">
                  <div className="flex-1">
                    <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">Target URL</label>
                    <div className="relative">
                      <i className="ri-global-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full h-12 pl-12 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        disabled={isScanning}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={
                        isScanning ||
                        testsLoading ||
                        selectedTests.length === 0
                      }
                      className="h-12 px-5 rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60 transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {isScanning ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-play-circle-line" />}
                      <span>{isScanning ? "Scanning..." : "Start scan"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">Test scope</label>
                  {testsError ? (
                    <p className="mb-3 text-sm text-rose-500">{testsError}</p>
                  ) : null}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
                    {testOptions.map((test) => (
                      <label
                        key={test.id}
                        className={`rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-all ${
                          selectedTests.includes(test.id)
                            ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.15)]"
                            : "border-zinc-300 dark:border-zinc-700/60 bg-zinc-100/70 dark:bg-zinc-800/35 text-zinc-700 dark:text-zinc-300 hover:border-cyan-500/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/55"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test.id)}
                            onChange={() => toggleTest(test.id)}
                            className="h-4 w-4 rounded border-zinc-400 dark:border-zinc-600 text-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                            disabled={isScanning || testsLoading}
                          />
                          <span className="font-medium">{test.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-5 px-4 py-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={authorizedTester}
                      onChange={(e) => setAuthorizedTester(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-400 dark:border-zinc-600 text-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                      disabled={isScanning}
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {authorizationCopy}
                    </span>
                  </label>
                </div>
              </form>
            )}

            {!showNewScan && (
              <>
                <div className="mb-2 pb-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative border-b border-zinc-300 dark:border-zinc-700 focus-within:border-cyan-500/60 transition-colors">
                        <i className="ri-search-line absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 text-lg"></i>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by URL..."
                          className="w-full h-11 pl-8 pr-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-5">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className={`relative pb-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          statusFilter === "all"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        All
                        {statusFilter === "all" ? <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-cyan-500 rounded-full"></span> : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("safe")}
                        className={`relative pb-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          statusFilter === "safe"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        Safe
                        {statusFilter === "safe" ? <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-cyan-500 rounded-full"></span> : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("warning")}
                        className={`relative pb-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          statusFilter === "warning"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        Warnings
                        {statusFilter === "warning" ? <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-cyan-500 rounded-full"></span> : null}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("danger")}
                        className={`relative pb-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          statusFilter === "danger"
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        }`}
                      >
                        Dangerous
                        {statusFilter === "danger" ? <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-cyan-500 rounded-full"></span> : null}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[2.6fr_1.1fr_1.2fr_0.9fr_0.8fr_1fr] gap-4 px-6 py-3 border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-50/70 dark:bg-zinc-900/40 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                    <span>Target</span>
                    <span>Status</span>
                    <span>Risk score</span>
                    <span>Date</span>
                    <span>Time</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                    {isLoadingScans && (
                      <div className="px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">Loading scans...</div>
                    )}

                    {!isLoadingScans && scanListError && (
                      <div className="px-6 py-8 text-sm text-rose-500">{scanListError}</div>
                    )}

                    {!isLoadingScans && !scanListError && filteredScans.length === 0 && (
                      <div className="px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">No scans found for this account.</div>
                    )}

                    {!isLoadingScans && !scanListError && filteredScans.map((row) => {
                      const meta = statusMeta(row.status);
                      return (
                        <div
                          key={row.id}
                          className="grid grid-cols-[2.6fr_1.1fr_1.2fr_0.9fr_0.8fr_1fr] gap-4 px-6 py-4 items-center hover:bg-zinc-100/70 dark:hover:bg-zinc-800/25 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <i className="ri-global-line text-cyan-500 dark:text-cyan-400"></i>
                            </div>
                            <div className="min-w-0">
                              <p className="text-zinc-900 dark:text-zinc-100 font-medium truncate">{row.url}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500">Scan ID #{row.id}</p>
                            </div>
                          </div>

                          <div>
                            <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.chip}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}></span>
                              {meta.label}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-full max-w-25 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700/70 overflow-hidden">
                                <div className={`h-full ${threatBarColor(row.threat)}`} style={{ width: `${row.threat}%` }}></div>
                              </div>
                              <span className={`text-sm font-semibold ${threatTextColor(row.threat)}`}>{row.threat}%</span>
                            </div>
                          </div>

                          <div className="text-sm text-zinc-500 dark:text-zinc-400">{row.date}</div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">{row.duration}</div>

                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                              title="View details"
                              onClick={() => openScanResult(row.id)}
                            >
                              <i className="ri-eye-line text-cyan-500 dark:text-cyan-400"></i>
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                              title="Download report"
                              onClick={() => downloadScan(row.id)}
                            >
                              <i className="ri-download-line text-zinc-500 dark:text-zinc-400"></i>
                            </button>
                            <button className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/40 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors cursor-pointer" title="Delete">
                              <i className="ri-delete-bin-line text-rose-500"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && scanError && (
        <ScanErrorModal isOpen={isModalOpen} onClose={closeModal} error={scanError} />
      )}
      {isModalOpen && scanResult && !scanError && (
        <ScanResultModal isOpen={isModalOpen} onClose={closeModal} scanResult={scanResult} />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
