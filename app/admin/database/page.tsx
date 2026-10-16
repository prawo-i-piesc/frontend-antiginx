"use client";

import { notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import DashboardShell from "@/app/components/layout/DashboardShell";
import Pagination from "@/app/components/ui/Pagination";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authorizedFetch } from "@/app/lib/session";

type TableType = "users" | "scans" | "premium_scans";

type Row = Record<string, unknown>;

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

/** What the person can do about a failed request: check the connection, ask for access, or retry. */
type LoadError = "network" | "forbidden" | "other";

/** Tagged with the request it answers, so "loading" is simply "not answered yet". */
type TableData = { request: string; rows: Row[]; error: LoadError | null };

const TABLES: TableType[] = ["users", "scans", "premium_scans"];
const ITEMS_PER_PAGE = 15;

const STATUS_CHIPS = {
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  pending: "bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

const CHIP_CLASS =
  "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase border";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function isRow(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadErrorOf(error: unknown): LoadError {
  if (error instanceof HttpError) return error.status === 401 || error.status === 403 ? "forbidden" : "other";
  // fetch() rejects with a TypeError when the network is down.
  return error instanceof TypeError ? "network" : "other";
}

function statusTone(value: string): keyof typeof STATUS_CHIPS {
  const status = value.toLowerCase();
  if (status === "active" || status === "safe" || status === "completed") return "done";
  if (status === "warning" || status === "pending" || status === "running") return "pending";
  return "failed";
}

function compareValues(a: unknown, b: unknown, collator: Intl.Collator): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  if (Array.isArray(a) && Array.isArray(b)) return a.length - b.length;
  // Numeric collation also orders ISO dates correctly.
  return collator.compare(String(a), String(b));
}

export default function AdminDatabasePage() {
  const { t, locale, format } = useI18n();
  const { authenticated, initialized, auth } = useRequireAuth();

  const [activeTable, setActiveTable] = useState<TableType>("users");
  const [reloadKey, setReloadKey] = useState(0);
  const [tableData, setTableData] = useState<TableData | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const request = `${activeTable}:${reloadKey}`;

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    const thisRequest = `${activeTable}:${reloadKey}`;

    authorizedFetch(`/api/admin/database?table=${encodeURIComponent(activeTable)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new HttpError(response.status, `Failed to fetch: ${response.status} ${response.statusText}`);
        }
        return response.json() as Promise<unknown>;
      })
      .then(
        (data) => {
          if (!active) return;
          setTableData({ request: thisRequest, rows: Array.isArray(data) ? data.filter(isRow) : [], error: null });
        },
        (error: unknown) => {
          if (!active) return;
          console.error("Failed to load the database table:", error);
          setTableData({ request: thisRequest, rows: [], error: loadErrorOf(error) });
        },
      );

    return () => {
      active = false;
    };
  }, [activeTable, authenticated, reloadKey]);

  const isLoading = tableData?.request !== request;
  const error = isLoading ? null : (tableData?.error ?? null);
  const dbData = useMemo(() => (isLoading ? [] : (tableData?.rows ?? [])), [isLoading, tableData]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return dbData;

    const query = searchQuery.toLowerCase();
    return dbData.filter((row) =>
      Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "object") return JSON.stringify(value).toLowerCase().includes(query);
        return String(value).toLowerCase().includes(query);
      }),
    );
  }, [dbData, searchQuery]);

  const collator = useMemo(() => new Intl.Collator(INTL_LOCALES[locale], { numeric: true }), [locale]);

  const sortedData = useMemo(() => {
    if (sortConfig === null) return filteredData;

    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === bValue) return 0;
      // Empty values go last whichever way the column is sorted.
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const order = compareValues(aValue, bValue, collator);
      return direction === "asc" ? order : -order;
    });
  }, [filteredData, sortConfig, collator]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * ITEMS_PER_PAGE;
  const paginatedData = sortedData.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  if (!initialized) return null;
  if (!authenticated) return null;
  if (!auth.user) return null;
  if (auth.user.role !== "admin") notFound();

  const tableCopy = t.adminDatabase.tables[activeTable];
  // Headers come from the whole table, so they stay when a search finds nothing.
  const columns = dbData.length > 0 ? Object.keys(dbData[0]) : [];
  const columnLabel = (key: string) => t.adminDatabase.columns[key] ?? key.replace(/_/g, " ");

  const statusLabel = (value: string) =>
    (t.scan.status as Record<string, string | undefined>)[value.toUpperCase()] ?? value;

  function switchTable(table: TableType) {
    if (table === activeTable) return;
    setActiveTable(table);
    setSortConfig(null);
    setCurrentPage(1);
  }

  function handleSort(key: string) {
    // The same column again flips ascending to descending.
    const direction = sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    setCurrentPage(1);
  }

  let sortAnnouncement = "";
  if (sortConfig) {
    const column = columnLabel(sortConfig.key);
    sortAnnouncement =
      sortConfig.direction === "asc"
        ? t.adminDatabase.sortedAscending(column)
        : t.adminDatabase.sortedDescending(column);
  }

  const renderCellValue = (key: string, value: unknown) => {
    if (value === null || value === undefined) {
      return (
        <>
          <span className="text-zinc-600 dark:text-zinc-400" aria-hidden="true">
            —
          </span>
          <span className="sr-only">{t.adminDatabase.noValue}</span>
        </>
      );
    }

    if (key === "status") {
      const status = String(value);
      return <span className={`${CHIP_CLASS} ${STATUS_CHIPS[statusTone(status)]}`}>{statusLabel(status)}</span>;
    }

    if (key === "role") {
      const role = String(value);
      return (
        <span
          className={`${CHIP_CLASS} ${
            role === "admin"
              ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
              : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
          }`}
        >
          {t.adminDatabase.roles[role] ?? role}
        </span>
      );
    }

    if (key.endsWith("_at") && typeof value === "string") {
      return <time dateTime={value}>{format.dateTime(value)}</time>;
    }

    if (typeof value === "boolean") {
      return value ? t.adminDatabase.yes : t.adminDatabase.no;
    }

    if (Array.isArray(value)) {
      return (
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{t.adminDatabase.itemCount(value.length)}</span>
      );
    }

    if (typeof value === "object") {
      return <span className="text-xs text-zinc-600 dark:text-zinc-400">{t.adminDatabase.object}</span>;
    }

    return String(value);
  };

  return (
    <DashboardShell area="admin" activePage="database" mainClassName="flex flex-col p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.adminDatabase.title}</h1>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.adminDatabase.subtitle}</p>
        </div>

        <div
          role="group"
          aria-label={t.adminDatabase.tableSwitcher}
          className="flex flex-wrap bg-white/85 dark:bg-zinc-900/20 border border-zinc-300 dark:border-zinc-800/60 rounded-xl p-1 shadow-sm"
        >
          {TABLES.map((table) => (
            <button
              key={table}
              type="button"
              onClick={() => switchTable(table)}
              aria-pressed={activeTable === table}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTable === table
                  ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-transparent"
              }`}
            >
              {t.adminDatabase.tables[table].name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-white/90 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-800/40 rounded-2xl shadow-sm overflow-hidden min-h-0">
        <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-800/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <i
              className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 pointer-events-none"
              aria-hidden="true"
            ></i>
            <input
              type="search"
              aria-label={tableCopy.search}
              placeholder={`${tableCopy.search}…`}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/60 rounded-xl text-sm text-zinc-900 dark:text-zinc-200 transition-all placeholder:text-zinc-600 dark:placeholder:text-zinc-400"
            />
          </div>
          <p role="status" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {!isLoading && !error && (
              <>
                {t.adminDatabase.found}{" "}
                <span className="text-zinc-900 dark:text-zinc-100">{format.number(sortedData.length)}</span>
              </>
            )}
          </p>
        </div>

        <p role="status" className="sr-only">
          {sortAnnouncement}
        </p>

        {/* Focusable so the table can be scrolled from the keyboard. */}
        <div
          role={columns.length > 0 ? "region" : undefined}
          aria-label={columns.length > 0 ? t.adminDatabase.tableLabel(tableCopy.name) : undefined}
          tabIndex={columns.length > 0 ? 0 : undefined}
          className="flex-1 overflow-auto scrollbar-theme focus-visible:-outline-offset-2"
        >
          {columns.length > 0 && (
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">{t.adminDatabase.caption(tableCopy.name)}</caption>
              <thead className="sticky top-0 z-10">
                <tr>
                  {columns.map((column) => {
                    const sorted = sortConfig?.key === column ? sortConfig.direction : null;
                    return (
                      <th
                        key={column}
                        scope="col"
                        aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                        className="p-0 text-left border-b border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900"
                      >
                        <button
                          type="button"
                          onClick={() => handleSort(column)}
                          className="group flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-medium uppercase tracking-widest whitespace-nowrap text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer focus-visible:-outline-offset-2"
                        >
                          {columnLabel(column)}
                          <span
                            className={`flex flex-col text-[10px] leading-none transition-opacity ${
                              sorted ? "opacity-100" : "opacity-40 group-hover:opacity-100 group-focus-visible:opacity-100"
                            }`}
                            aria-hidden="true"
                          >
                            <i
                              className={`ri-arrow-up-s-line -mb-1 ${sorted === "asc" ? "text-cyan-700 dark:text-cyan-400" : ""}`}
                            ></i>
                            <i
                              className={`ri-arrow-down-s-line ${sorted === "desc" ? "text-cyan-700 dark:text-cyan-400" : ""}`}
                            ></i>
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr
                    key={typeof row.id === "string" || typeof row.id === "number" ? row.id : index}
                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors border-b border-zinc-200/60 dark:border-zinc-800/40 last:border-0"
                  >
                    {columns.map((column) => (
                      <td key={column} className="px-4 py-3 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                        {renderCellValue(column, row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div role="status">
            {isLoading && (
              <div className="px-4 py-12 flex flex-col items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <i className="ri-loader-4-line animate-spin text-2xl text-cyan-700 dark:text-cyan-400" aria-hidden="true"></i>
                <p>{t.common.loading}</p>
              </div>
            )}
            {!isLoading && !error && paginatedData.length === 0 && (
              <p className="px-4 py-12 text-center text-sm text-zinc-600 dark:text-zinc-400">
                {searchQuery ? t.adminDatabase.noMatches : t.adminDatabase.empty}
              </p>
            )}
          </div>
          <div role="alert">
            {error && (
              <p className="px-4 pt-12 text-center text-sm text-red-700 dark:text-red-400">
                {t.adminDatabase.loadError}{" "}
                {error === "forbidden"
                  ? t.adminDatabase.forbidden
                  : error === "network"
                    ? t.common.networkError
                    : t.common.genericError}
              </p>
            )}
          </div>
          {error && (
            <div className="px-4 pt-3 pb-12 flex justify-center">
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white/85 dark:bg-zinc-900/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <i className="ri-refresh-line" aria-hidden="true"></i>
                {t.common.retry}
              </button>
            </div>
          )}
        </div>

        {!isLoading && !error && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-zinc-200/60 dark:border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/30 dark:bg-zinc-950/20">
            <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.common.pagination.range(
                pageStart + 1,
                Math.min(pageStart + ITEMS_PER_PAGE, sortedData.length),
                sortedData.length,
              )}
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
