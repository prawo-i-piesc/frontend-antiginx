"use client";

import { useMemo, useState } from "react";

import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";

interface UserLocation {
  /** ISO 3166-1 alpha-2; the name comes from Intl in the interface language. */
  code: string;
  count: number;
}

/** Sample figures until the backend reports where users are. */
const DEMO_DATA: UserLocation[] = [
  { code: "US", count: 45 },
  { code: "PL", count: 23 },
  { code: "DE", count: 18 },
  { code: "GB", count: 15 },
  { code: "FR", count: 12 },
];

function countryFlag(code: string) {
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function UserLocationMapWidget() {
  const { t, locale, format } = useI18n();
  const copy = t.widgets.topCountries;

  // initialize with demo data synchronously to avoid setState in mount effect
  const [locations] = useState<UserLocation[]>(DEMO_DATA);
  const [loading] = useState(false);

  const intl = useMemo(() => {
    const tag = INTL_LOCALES[locale];
    return {
      name: new Intl.DisplayNames(tag, { type: "region" }),
      shortName: new Intl.DisplayNames(tag, { type: "region", style: "short" }),
      percent: new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 0 }),
    };
  }, [locale]);

  const maxUsers = Math.max(...locations.map((l) => l.count), 1);

  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 backdrop-blur-md border border-zinc-300 dark:border-zinc-800/30 p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{copy.title}</h2>
        {/* There is no page with every country yet. */}
        <button
          type="button"
          disabled
          title={t.common.comingSoon}
          className="inline-flex min-h-6 items-center text-sm text-zinc-600 dark:text-zinc-400 font-medium opacity-50 cursor-not-allowed"
        >
          {t.widgets.viewAll}
          <span className="sr-only"> ({t.common.comingSoon})</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" aria-hidden="true"></div>
          <span className="sr-only">{t.common.loading}</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/30 scrollbar-theme">
          {/* An ordered list carries the rank, so the visible "#1" is not read twice. */}
          <ol className="space-y-0">
            {locations.map((location, idx) => {
              const share = location.count / maxUsers;
              const name = intl.name.of(location.code) ?? location.code;
              const shortName = intl.shortName.of(location.code) ?? name;

              return (
                <li
                  key={location.code}
                  className={`flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors group ${
                    idx !== locations.length - 1 ? "border-b border-zinc-200 dark:border-zinc-800/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 w-32">
                      <div className="text-2xl" aria-hidden="true">{countryFlag(location.code)}</div>
                      <div className="min-w-0">
                        {/* The short form ("USA") fits the column; screen readers get the full name. */}
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {shortName === name ? (
                            name
                          ) : (
                            <>
                              <span aria-hidden="true" title={name}>{shortName}</span>
                              <span className="sr-only">{name}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400" aria-hidden="true">{copy.rank(idx + 1)}</div>
                      </div>
                    </div>

                    {/* The count and share are printed next to it; the bar only pictures them. */}
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden" aria-hidden="true">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                        style={{ width: `${share * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3 w-12">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {format.number(location.count)}
                      <span className="sr-only"> {copy.users(location.count)}</span>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">{intl.percent.format(share)}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
