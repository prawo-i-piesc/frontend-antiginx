"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import useProfile from "@/app/hooks/useProfile";
import DashboardTopBar from "@/app/components/layout/DashboardTopBar";
import DashboardSidebar from "@/app/components/layout/DashboardSidebar";
import {
  ApiRequestError,
  calculateThreatLevel,
  getUserScans,
  UserScanResponse,
} from "@/app/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ScanRow = {
  id: string;
  url: string;
  status: "safe" | "warning" | "danger";
  threat: number;
  date: string;
};

function formatDate(dateIso: string): string {
  if (!dateIso) return "-";
  return dateIso.slice(0, 10);
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
  };
}

const COLORS = {
  danger: "#ef4444",  // bg-red-500
};

export default function DashboardChartsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanRows, setScanRows] = useState<ScanRow[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(false);
  const [scanListError, setScanListError] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>("");

  const { theme, toggleTheme } = useTheme();
  const { token, initialized, auth: authFromHook } = useRequireAuth();
  const auth = authFromHook;
  const { profileName } = useProfile(token);

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
        const mapped = completedScans.map(mapScanToRow);

        setScanRows(mapped);

        if (mapped.length > 0) {
          const uniqueUrls = Array.from(new Set(mapped.map((s) => s.url)));
          setSelectedUrl(uniqueUrls[0]);
        }
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiRequestError || error instanceof Error) {
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
  }, [token]);

  // Lista unikalnych domen do dropdownu
  const uniqueUrls = useMemo(() => {
    return Array.from(new Set(scanRows.map((row) => row.url)));
  }, [scanRows]);

  // Historia poziomu zagrożenia w czasie dla wybranej strony
  const urlHistoryData = useMemo(() => {
    if (!selectedUrl) return [];
    return scanRows
      .filter((row) => row.url === selectedUrl)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((row) => ({
        date: row.date,
        threat: row.threat,
      }));
  }, [scanRows, selectedUrl]);

  if (!initialized) return null;
  if (!token) return null;

  const axisColor = theme === "dark" ? "#52525b" : "#a1a1aa"; 
  const gridColor = theme === "dark" ? "#27272a" : "#e4e4e7"; 
  const tooltipBg = theme === "dark" ? "#18181b" : "#ffffff";

  return (
    <div className="h-screen xl:flex bg-zinc-200 dark:bg-zinc-950 transition-colors select-none">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        profileName={profileName}
        onLogout={() => auth.logout()}
        activePage="charts"
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

        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 scrollbar-theme">
          <div className="p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Charts</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Analyze website security metrics and scan history</p>
              </div>
            </div>

            {isLoadingScans && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading charts...</div>
            )}

            {!isLoadingScans && scanListError && (
              <div className="text-sm text-rose-500">{scanListError}</div>
            )}

            {!isLoadingScans && !scanListError && scanRows.length === 0 && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">No data available to display charts.</div>
            )}

            {!isLoadingScans && !scanListError && scanRows.length > 0 && (
              <div className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 shadow-sm">
                
                {/* Dropdown identyczny stylizacją jak pole z URL z Twojego scannera */}
                <div className="mb-5 max-w-md">
                  <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">
                    Domain History Filter
                  </label>
                  <div className="relative">
                    <i className="ri-global-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                    <select
                      value={selectedUrl}
                      onChange={(e) => setSelectedUrl(e.target.value)}
                      className="w-full h-12 pl-12 pr-10 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer appearance-none"
                    >
                      {uniqueUrls.map((url) => (
                        <option key={url} value={url} className="bg-white dark:bg-zinc-950">
                          {url}
                        </option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"></i>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Threat Level Over Time</h3>
                
                <div className="h-72">
                  {urlHistoryData.length < 1 ? (
                    <div className="h-full flex items-center justify-center text-sm text-zinc-500">
                      No scans found for the selected domain.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={urlHistoryData} margin={{ left: -20, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="date" stroke={axisColor} fontSize={11} tickMargin={8} />
                        <YAxis stroke={axisColor} fontSize={11} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: tooltipBg, borderColor: gridColor, borderRadius: '12px' }}
                          formatter={(value: any) => [`${value}%`, "Threat Level"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="threat" 
                          stroke={COLORS.danger} 
                          strokeWidth={2}
                          dot={{ r: 4, fill: COLORS.danger }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}