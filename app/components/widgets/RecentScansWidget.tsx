import React from "react";

// Uproszczony typ danych z API - interesuje nas tylko URL i ID do klucza
export interface ApiScanData {
  id: string;
  target_url: string;
}

interface RecentScansWidgetProps {
  scans?: ApiScanData[];
  isLoading?: boolean;
}

export default function RecentScansWidget({ scans = [], isLoading = false }: RecentScansWidgetProps) {
  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 backdrop-blur-md border border-zinc-300 dark:border-zinc-800/30 p-6 h-full flex flex-col">
      {/* Nagłówek widgetu */}
      <div className="mb-6 flex items-center justify-between shrink-0">
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Scans</h4>
        <button className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-medium">
          View All
        </button>
      </div>

      {/* Lista skanów */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-theme">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500 dark:text-zinc-400">
            Loading recent scans...
          </div>
        ) : scans.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-zinc-500 dark:text-zinc-400">
            No recent scans found.
          </div>
        ) : (
          scans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/40"
            >
              {/* Prosta ikonka globusa z boku dla ładnego wyglądu */}
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <i className="ri-global-line text-cyan-500 dark:text-cyan-400 text-sm"></i>
              </div>
              
              {/* Nazwa domeny / URL */}
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {scan.target_url}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}