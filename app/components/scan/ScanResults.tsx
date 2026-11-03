"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import { RiskLabel, SeverityLabel, SEVERITY_TONES, Verdict } from "@/app/components/scan/labels";
import Dropdown from "@/app/components/ui/Dropdown";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import {
  CODE,
  CONTROL,
  DATA,
  PANEL,
  Stamp,
  StatusLabel,
  TABLE,
  TD,
  TH,
  THEAD,
  TOOLBAR,
  TableLoading,
  TableMessage,
} from "@/app/components/ui/table";
import type { LiveScan } from "@/app/hooks/useLiveScan";
import { useI18n } from "@/app/i18n/I18nProvider";
import { calculateThreatLevel, isFinishedStatus, type ScanResponse, type SeverityLevel } from "@/app/lib/api";
import {
  buildRows,
  findingCounts,
  flattenMetadata,
  hasVerdict,
  progressOf,
  type RowState,
  type ScanRow,
} from "@/app/lib/scanRows";

type ResultFilter = "all" | RowState;

const RESULT_FILTERS: ResultFilter[] = ["all", "failed", "passed", "notice", "pending", "missing"];
const SEVERITY_FILTERS: ("all" | SeverityLevel)[] = ["all", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

const CELL_LABEL = "text-xs text-zinc-600 dark:text-zinc-400";

function elapsedSeconds(scan: ScanResponse, now: number): number | null {
  const start = Date.parse(scan.started_at ?? scan.created_at);
  if (Number.isNaN(start)) return null;

  const end = scan.completed_at ? Date.parse(scan.completed_at) : now;
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.round((end - start) / 1000));
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/** The time on screen, ticking only while there is something to count. */
function Elapsed({ scan, ticking }: { scan: ScanResponse; ticking: boolean }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ticking]);

  // A failed scan has no end time, and how long it has been failed says nothing.
  const seconds = !ticking && !scan.completed_at ? null : elapsedSeconds(scan, now);
  return <span className={DATA}>{seconds === null ? "—" : formatElapsed(seconds)}</span>;
}

function SummaryCell({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? "col-span-2" : ""}`}>
      <dt className={CELL_LABEL}>{label}</dt>
      <dd className="mt-0.5 flex h-5 items-center gap-x-2.5 text-sm text-zinc-900 dark:text-zinc-100">{children}</dd>
    </div>
  );
}

function Summary({ live, scan, rows }: { live: LiveScan; scan: ScanResponse; rows: ScanRow[] }) {
  const { t, format } = useI18n();
  const copy = t.scan.live;
  const finished = isFinishedStatus(scan.status);
  const progress = progressOf(scan, rows);
  const findings = findingCounts(rows);
  const score = calculateThreatLevel(scan.results ?? []);
  // A scan that reached no verdict has not found the site clean: it checked nothing.
  const judged = hasVerdict(rows);
  const ratio = progress.total ? Math.min(progress.done / progress.total, 1) : 0;

  return (
    <div className="relative">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-3 py-3 sm:grid-cols-4 sm:px-4 xl:grid-cols-7">
        <SummaryCell label={copy.summary.status}>
          {live.stalled && scan.status === "RUNNING" ? (
            <span className="font-medium text-amber-700 dark:text-amber-400">{copy.noSignal}</span>
          ) : (
            <StatusLabel status={scan.status} />
          )}
        </SummaryCell>
        <SummaryCell label={copy.summary.tests}>
          <span className={DATA}>
            {progress.total === null
              ? format.number(progress.done)
              : `${format.number(progress.done)} / ${format.number(progress.total)}`}
          </span>
        </SummaryCell>
        <SummaryCell label={copy.summary.risk}>
          {judged ? <RiskLabel score={score} /> : <span className={DATA}>—</span>}
        </SummaryCell>
        <SummaryCell label={copy.summary.findings} wide>
          {findings.length > 0 ? (
            findings.map(({ severity, count }) => (
              <span key={severity} className={`whitespace-nowrap text-xs font-medium ${SEVERITY_TONES[severity]}`}>
                {t.scan.severity[severity]} <span className={DATA}>{format.number(count)}</span>
              </span>
            ))
          ) : (
            <span className={DATA}>{judged ? "0" : "—"}</span>
          )}
        </SummaryCell>
        <SummaryCell label={copy.summary.time}>
          <Elapsed scan={scan} ticking={!finished && !live.gaveUp} />
        </SummaryCell>
        {/* One slot for both, so the row does not shift when the scan ends. */}
        {finished ? (
          <SummaryCell label={copy.summary.finished}>
            {scan.completed_at ? <Stamp value={scan.completed_at} /> : <span className={DATA}>—</span>}
          </SummaryCell>
        ) : (
          <SummaryCell label={copy.summary.connection}>
            <span
              className={live.transport === "live" ? "font-medium text-emerald-700 dark:text-emerald-400" : undefined}
            >
              {copy.transport[live.transport]}
            </span>
          </SummaryCell>
        )}
      </dl>
      {/* Drawn over the border under the row, so it takes no room of its own. */}
      {!finished && progress.total ? (
        <div className="absolute inset-x-0 -bottom-px h-0.5" aria-hidden="true">
          <div
            className="h-full bg-cyan-600 transition-[width] duration-300 ease-out motion-reduce:transition-none dark:bg-cyan-400"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Details({ row, name }: { row: ScanRow; name: string }) {
  const { t } = useI18n();
  const copy = t.scan.live.details;
  const data = useMemo(() => flattenMetadata(row.result?.metadata), [row.result?.metadata]);
  const category = row.category ? (t.scan.categories[row.category] ?? row.category) : null;

  return (
    <div className="grid gap-x-6 gap-y-3 px-3 pt-1 pb-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3">
        {row.result?.message ? (
          <div>
            <p className={CELL_LABEL}>{copy.message}</p>
            {/* The engine writes its messages in English. */}
            <p lang="en" className="mt-0.5 text-sm leading-relaxed wrap-anywhere text-zinc-800 dark:text-zinc-200">
              {row.result.message.trim()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {row.state === "pending" ? copy.pending : copy.noMessage(name)}
          </p>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {category ? (
            <div>
              <p className={CELL_LABEL}>{copy.category}</p>
              <p className="mt-0.5 text-sm text-zinc-800 dark:text-zinc-200">{category}</p>
            </div>
          ) : null}
          {row.testId ? (
            <div>
              <p className={CELL_LABEL}>{copy.id}</p>
              <p className={`${CODE} mt-1 text-zinc-800 dark:text-zinc-200`}>{row.testId}</p>
            </div>
          ) : null}
        </div>
      </div>

      {data.length > 0 ? (
        <div className="min-w-0">
          <p className={CELL_LABEL}>{copy.data}</p>
          <dl className="mt-1 max-h-64 overflow-y-auto scrollbar-theme">
            {data.map(({ path, value }) => (
              <div key={path} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-3 py-0.5 text-xs">
                <dt className={`${CODE} truncate text-zinc-600 dark:text-zinc-400`} title={path}>
                  {path}
                </dt>
                <dd lang="en" className={`${DATA} wrap-anywhere text-zinc-800 dark:text-zinc-200`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function ResultRow({
  row,
  name,
  open,
  onToggle,
  finished,
  detailsId,
}: {
  row: ScanRow;
  name: string;
  open: boolean;
  onToggle: () => void;
  finished: boolean;
  detailsId: string;
}) {
  const message = row.result?.message?.trim();

  // Lights up only when its result arrives while someone is watching, not whenever
  // the row is drawn again, as after clearing a filter.
  const [previousState, setPreviousState] = useState(row.state);
  const [arrived, setArrived] = useState(false);
  if (row.state !== previousState) {
    setPreviousState(row.state);
    if (previousState === "pending") setArrived(true);
  }

  // Kept once opened, so that closing can slide too. Most rows are never opened,
  // and a row of recorded data can run to sixty lines.
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);

  // Only for the reorder when the scan ends: measured when `finished` changes, so
  // results arriving and filters do not cost a measurement of every row.
  const motionProps = {
    layout: "position" as const,
    layoutDependency: finished,
    transition: { duration: 0.25, ease: "easeOut" as const },
  };

  return (
    <>
      <motion.tr
        {...motionProps}
        onClick={onToggle}
        className={`cursor-pointer border-t border-zinc-100 transition-colors first:border-t-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/30 ${
          arrived && !finished ? "result-in" : ""
        }`}
      >
        <td className={`${TD} w-8 max-sm:pr-0 sm:w-32`}>
          <Verdict state={row.state} compact />
        </td>
        {/* On a phone the name has the row to itself, on two lines, or it says nothing. */}
        <td className={`${TD} w-full max-w-0 max-sm:whitespace-normal sm:w-auto sm:max-w-none`}>
          {/* The row is clickable for the mouse; the button is what keyboards and screen readers get. */}
          <button
            type="button"
            data-row={row.key}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            aria-expanded={open}
            aria-controls={detailsId}
            className={`max-w-full cursor-pointer rounded text-left leading-tight font-medium max-sm:line-clamp-2 sm:block sm:truncate ${
              row.state === "pending" ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {name}
          </button>
        </td>
        <td className={`${TD} hidden w-full max-w-0 text-zinc-600 md:table-cell dark:text-zinc-400`}>
          {message ? (
            <span lang="en" className="block truncate" title={message}>
              {message}
            </span>
          ) : null}
        </td>
        <td className={`${TD} w-28 text-right`}>
          {row.severity ? <SeverityLabel value={row.severity} /> : <span className="text-zinc-400 dark:text-zinc-600">—</span>}
        </td>
        <td aria-hidden="true" className="h-11 w-9 pr-3 text-right text-zinc-500 dark:text-zinc-400">
          <i
            className={`ri-arrow-down-s-line inline-block transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </td>
      </motion.tr>
      {/* Always in the table, at no height, so opening and closing can slide; hidden
          from assistive tech while closed, where it would read as an empty row. */}
      <motion.tr {...motionProps} inert={!open} aria-hidden={!open}>
        <td colSpan={5} className="p-0">
          <div
            id={detailsId}
            className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="min-h-0 overflow-hidden">{opened ? <Details row={row} name={name} /> : null}</div>
          </div>
        </td>
      </motion.tr>
    </>
  );
}

/** The panel's shape while the first read is on its way, so nothing moves when it lands. */
function ScanResultsSkeleton({ bare }: { bare: boolean }) {
  return (
    <SkeletonRegion className={bare ? undefined : PANEL}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-zinc-200 px-3 py-3 sm:grid-cols-4 sm:px-4 xl:grid-cols-7 dark:border-zinc-800">
        {[0, 1, 2, 3, 4, 5].map((cell) => (
          <div key={cell} className={cell === 3 ? "col-span-2" : undefined}>
            <div className="flex h-4 items-center">
              <Bone className="h-2.5 w-14" />
            </div>
            <div className="mt-0.5 flex h-5 items-center">
              <Bone className="h-3.5 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className={TOOLBAR}>
        <Bone className="h-9 w-full rounded-lg sm:w-64" />
        <Bone className="h-9 w-36 rounded-lg" />
        <Bone className="h-9 w-28 rounded-lg" />
        <Bone className="h-9 w-40 rounded-lg" />
      </div>
      <TableLoading rows={8} columns={4} />
    </SkeletonRegion>
  );
}

/**
 * A scan as a table: every test the scan asked for has a row from the start,
 * and the row changes state as its result arrives.
 *
 * `bare` drops the card, for a dialog that is already one.
 */
export default function ScanResults({ live, bare = false }: { live: LiveScan; bare?: boolean }) {
  const { t, locale, format } = useI18n();
  const copy = t.scan.live;
  const scan = live.scan;
  const finished = scan !== null && isFinishedStatus(scan.status);
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResultFilter>("all");
  const [severity, setSeverity] = useState<"all" | SeverityLevel>("all");
  const [category, setCategory] = useState("all");
  const [openRows, setOpenRows] = useState<ReadonlySet<string>>(new Set());

  const rows = useMemo(() => (scan ? buildRows(scan) : []), [scan]);

  const nameOf = (row: ScanRow) =>
    (row.testId && t.scan.tests[row.testId]) || row.engineName || row.testId || t.scan.categoryOther;

  const categories = useMemo(
    () => [...new Set(rows.map((row) => row.category).filter((value): value is string => value !== null))],
    [rows],
  );

  const needle = query.trim().toLowerCase();
  const visible = rows.filter(
    (row) =>
      (result === "all" || row.state === result) &&
      (severity === "all" || row.severity === severity) &&
      (category === "all" || row.category === category) &&
      (!needle ||
        [nameOf(row), row.testId, row.engineName, row.result?.message].some((text) =>
          text?.toLowerCase().includes(needle),
        )),
  );
  const filtering = needle !== "" || result !== "all" || severity !== "all" || category !== "all";

  // The reorder when a scan ends moves rows in the DOM, and a moved element loses
  // the keyboard focus. What has it is read here, while the rows are still in place.
  const [wasFinished, setWasFinished] = useState(finished);
  const [rowToRefocus, setRowToRefocus] = useState<string | null>(null);
  if (finished !== wasFinished) {
    setWasFinished(finished);
    setRowToRefocus(document.activeElement?.getAttribute("data-row") ?? null);
  }
  useLayoutEffect(() => {
    if (!rowToRefocus) return;
    rootRef.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(rowToRefocus)}"]`)?.focus({ preventScroll: true });
  }, [rowToRefocus]);

  if (!scan) return <ScanResultsSkeleton bare={bare} />;

  const failedCount = rows.filter((row) => row.state === "failed").length;
  const verdictCount = rows.filter((row) => row.state === "passed" || row.state === "failed").length;

  function toggle(key: string) {
    setOpenRows((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearFilters() {
    setQuery("");
    setResult("all");
    setSeverity("all");
    setCategory("all");
  }

  let announcement = t.scanner.announce.started(scan.target_url);
  if (scan.status === "COMPLETED") {
    announcement = `${t.scanner.announce.finished} ${t.scan.testsCompleted(verdictCount)}. ${copy.failedCount(failedCount)}`;
  } else if (scan.status === "FAILED") {
    announcement = t.scanner.announce.failed;
  } else if (live.gaveUp) {
    announcement = copy.gaveUp;
  } else if (live.stalled) {
    announcement = copy.stalled;
  }

  return (
    <div ref={rootRef} className={bare ? undefined : PANEL}>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <Summary live={live} scan={scan} rows={rows} />
      </div>

      <div className={TOOLBAR}>
        <label htmlFor={`${baseId}-search`} className="sr-only">
          {copy.filters.searchLabel}
        </label>
        <div className="relative w-full sm:w-64">
          <i
            className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
            aria-hidden="true"
          />
          <input
            id={`${baseId}-search`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.filters.searchPlaceholder}
            className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 dark:placeholder:text-zinc-500`}
          />
        </div>
        <Dropdown
          label={copy.filters.resultLabel}
          value={result}
          options={RESULT_FILTERS.map((value) => ({
            value,
            label: value === "all" ? copy.filters.allResults : t.scan.verdict[value],
          }))}
          onChange={setResult}
        />
        <Dropdown
          label={copy.filters.severityLabel}
          value={severity}
          options={SEVERITY_FILTERS.map((value) => ({
            value,
            label: value === "all" ? copy.filters.allSeverities : t.scan.severity[value],
          }))}
          onChange={setSeverity}
        />
        {categories.length > 1 ? (
          <Dropdown
            label={copy.filters.categoryLabel}
            value={category}
            options={[
              { value: "all", label: copy.filters.allCategories },
              ...categories.map((value) => ({ value, label: t.scan.categories[value] ?? value })),
            ]}
            onChange={setCategory}
          />
        ) : null}

        {/* Takes only the room left on the line and cuts its text short rather than
            wrapping, so a scan going quiet moves nothing below. The whole sentence is
            in the tooltip and in the announcement above. */}
        <div className="flex min-w-0 flex-1 basis-0 items-center justify-end gap-3 text-xs">
          {live.gaveUp || (live.stalled && !finished) ? (
            <p
              title={live.gaveUp ? copy.gaveUp : copy.stalled}
              className="min-w-0 truncate text-amber-700 dark:text-amber-400"
            >
              {live.gaveUp ? copy.gaveUpShort : copy.stalledShort}
            </p>
          ) : null}
          {live.gaveUp ? (
            <button
              type="button"
              onClick={live.retry}
              className="shrink-0 cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400"
            >
              {copy.checkAgain}
            </button>
          ) : null}
          {filtering ? (
            <p className={`${DATA} shrink-0 text-zinc-600 dark:text-zinc-400`}>
              {copy.filters.shown(format.number(visible.length), format.number(rows.length))}
            </p>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <TableMessage>
          {scan.status === "FAILED" ? t.scanner.detail.failed : finished ? t.scanner.detail.noResults : copy.waitingFirst}
        </TableMessage>
      ) : visible.length === 0 ? (
        <TableMessage>
          <p>{copy.filters.noMatches}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400"
          >
            {t.scanner.list.clearFilters}
          </button>
        </TableMessage>
      ) : (
        // No sideways scrolling to allow for: columns drop out as the room runs out.
        <table className={TABLE}>
          <caption className="sr-only">{t.scanner.detail.resultsHeading}</caption>
          <thead className={THEAD}>
            <tr>
              <th scope="col" className={`${TH} w-8 sm:w-32`}>
                <span className="max-sm:sr-only">{copy.columns.result}</span>
              </th>
              <th scope="col" className={`${TH} sm:w-96`}>
                {copy.columns.test}
              </th>
              <th scope="col" className={`${TH} hidden md:table-cell`}>
                {copy.columns.message}
              </th>
              <th scope="col" className={`${TH} w-28 text-right`}>
                {copy.columns.severity}
              </th>
              <td aria-hidden="true" className="w-9" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <ResultRow
                key={row.key}
                row={row}
                name={nameOf(row)}
                open={openRows.has(row.key)}
                onToggle={() => toggle(row.key)}
                finished={finished}
                detailsId={`${baseId}-${row.key}`}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* Only worth saying when the interface is not in English itself. */}
      {locale !== "en" && rows.some((row) => row.result?.message) ? (
        <p className="border-t border-zinc-200 px-3 py-2 text-xs text-zinc-600 sm:px-4 dark:border-zinc-800 dark:text-zinc-400">
          {t.scan.engineLanguageNote}
        </p>
      ) : null}
    </div>
  );
}
