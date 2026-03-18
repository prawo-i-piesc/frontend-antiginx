"use client";

import { useState, useEffect } from "react";

interface UserLocation {
  country: string;
  count: number;
  code: string;
}

const DEMO_DATA: UserLocation[] = [
  { country: "USA", count: 45, code: "US" },
  { country: "Poland", count: 23, code: "PL" },
  { country: "Germany", count: 18, code: "DE" },
  { country: "UK", count: 15, code: "GB" },
  { country: "France", count: 12, code: "FR" },
];

export default function UserLocationMapWidget() {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just use demo data
    setLocations(DEMO_DATA);
    setLoading(false);
  }, []);

  const maxUsers = Math.max(...locations.map((l) => l.count), 1);

  const getCountryFlag = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 backdrop-blur-md border border-zinc-300 dark:border-zinc-800/30 p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Top Countries</h4>
        <button className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-medium">
          View All
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/30">
          <div className="space-y-0">
            {locations.map((location, idx) => {
              const percentage = (location.count / maxUsers) * 100;
              const rank = idx + 1;

              return (
                <div
                  key={location.code}
                  className={`flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors group ${
                    idx !== locations.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 w-32">
                      <div className="text-2xl">{getCountryFlag(location.code)}</div>
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{location.country}</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">#{rank}</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Count */}
                  <div className="text-right shrink-0 ml-3 w-12">
                    <div className="font-bold text-blue-600 dark:text-blue-400">{location.count}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{Math.round(percentage)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
