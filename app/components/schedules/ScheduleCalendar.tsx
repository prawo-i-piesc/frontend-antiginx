"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { riskTone } from "@/app/components/scan/labels";
import { PANEL, TOOLBAR, ICON_BUTTON, DATA } from "@/app/components/ui/table";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import useApiQuery from "@/app/hooks/useApiQuery";
import { INTL_LOCALES } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { ScanStatus } from "@/app/lib/api";
import { getScheduleCalendar, type ScheduleCalendar as CalendarData } from "@/app/lib/schedulesApi";

/** Six weeks: every month fits, and the grid is the same height whatever the month. */
const WEEKS = 6;
/** Monday first. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
/** Entries a day shows before the rest is counted. */
const SHOWN = 3;

type Entry =
  | { kind: "run"; key: string; at: Date; url: string; scanId: string; status: ScanStatus; risk: number | null }
  | { kind: "planned"; key: string; at: Date; url: string };

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function clock(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function host(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** The icon and colour of an entry: a scan by its outcome and risk, a term still to come muted. */
function look(entry: Entry): { icon: string; tone: string } {
  if (entry.kind === "planned") return { icon: "ri-time-line", tone: "text-zinc-500 dark:text-zinc-500" };
  switch (entry.status) {
    case "COMPLETED":
      return { icon: "ri-check-line", tone: entry.risk === null ? "text-emerald-700 dark:text-emerald-400" : riskTone(entry.risk) };
    case "FAILED":
      return { icon: "ri-close-line", tone: "text-rose-700 dark:text-rose-400" };
    default:
      return { icon: "ri-loader-4-line", tone: "text-amber-700 dark:text-amber-400" };
  }
}

function EntryLine({ entry, label }: { entry: Entry; label: string }) {
  const { icon, tone } = look(entry);
  const inner = (
    <>
      <i className={`${icon} shrink-0 ${tone}`} aria-hidden="true" />
      <span className={`${DATA} shrink-0 text-zinc-600 dark:text-zinc-400`}>{clock(entry.at)}</span>
      <span className="truncate">{host(entry.url)}</span>
    </>
  );
  const line = "flex min-w-0 items-center gap-1 text-[11px] leading-4";
  return entry.kind === "run" ? (
    <Link
      href={`/dashboard/scanner/${encodeURIComponent(entry.scanId)}`}
      aria-label={label}
      title={label}
      className={`${line} rounded-sm text-zinc-800 hover:underline dark:text-zinc-200`}
    >
      {inner}
    </Link>
  ) : (
    <span title={label} className={`${line} text-zinc-600 dark:text-zinc-400`}>
      {inner}
      <span className="sr-only">{label}</span>
    </span>
  );
}


/**
 * The month of the account's scheduled scans: the scans schedules have run,
 * by outcome, and the terms still to come. A scan leads to its results.
 *
 * Always six weeks from the Monday before the first, so the grid keeps its
 * height from month to month and while a month loads: the days are drawn at
 * once and their entries fill in. On a phone a day shows its entries as
 * icons, and the one picked is listed under the grid.
 *
 * `version` changes when a schedule does, to load the month again. `sample`
 * draws the given entries instead of loading any: the preview an account
 * without Pro sees.
 */
export default function ScheduleCalendar({ version, sample }: { version: number; sample?: CalendarData }) {
  const { t, locale } = useI18n();
  const copy = t.schedules.calendar;
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [picked, setPicked] = useState<Date>(() => new Date());
  const titleRef = useRef<HTMLHeadingElement>(null);

  const first = useMemo(() => {
    // Back to the Monday on or before the first of the month.
    const offset = (month.getDay() + 6) % 7;
    return addDays(month, -offset);
  }, [month]);
  const days = useMemo(() => Array.from({ length: WEEKS * 7 }, (_, index) => addDays(first, index)), [first]);
  const end = days[days.length - 1];
  const until = addDays(end, 1);

  const loaded = useApiQuery(sample ? null : `schedule-calendar:${first.toISOString()}:${version}`, (signal) =>
    getScheduleCalendar(first, until, signal),
  );
  const data = sample ?? loaded.data;
  const { error, reload } = loaded;

  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>();
    if (!data) return map;
    const entries: Entry[] = [
      ...data.runs.map((run): Entry => ({
        kind: "run",
        key: `run-${run.scan_id}`,
        at: new Date(run.at),
        url: run.target_url,
        scanId: run.scan_id,
        status: run.status,
        risk: run.risk,
      })),
      ...data.planned.map((term): Entry => ({
        kind: "planned",
        key: `planned-${term.schedule_id}-${term.at}`,
        at: new Date(term.at),
        url: term.target_url,
      })),
    ];
    entries.sort((a, b) => a.at.getTime() - b.at.getTime());
    for (const entry of entries) {
      const key = dayKey(entry.at);
      map.set(key, [...(map.get(key) ?? []), entry]);
    }
    return map;
  }, [data]);

  const today = dayKey(new Date());
  const thisMonth = startOfMonth(new Date()).getTime() === month.getTime();
  const intl = INTL_LOCALES[locale];
  const title = new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(month);
  const monthTitle = title.charAt(0).toLocaleUpperCase(intl) + title.slice(1);
  const longDate = new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long" });

  function move(months: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + months, 1);
    setMonth(next);
    setPicked(next);
  }

  function entryLabel(entry: Entry): string {
    if (entry.kind === "planned") return copy.planned(entry.url, clock(entry.at));
    const status = (t.scan.status as Record<string, string | undefined>)[entry.status] ?? entry.status;
    return copy.run(entry.url, clock(entry.at), status);
  }

  const pickedEntries = byDay.get(dayKey(picked)) ?? [];
  const legend = [
    { icon: "ri-check-line", tone: "text-emerald-700 dark:text-emerald-400", label: copy.legend.done },
    { icon: "ri-close-line", tone: "text-rose-700 dark:text-rose-400", label: copy.legend.failed },
    { icon: "ri-time-line", tone: "text-zinc-500", label: copy.legend.planned },
  ];

  return (
    <section aria-label={copy.label} className={`${PANEL} mb-6`}>
      <div className={TOOLBAR}>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => move(-1)} aria-label={copy.previous} title={copy.previous} className={`${ICON_BUTTON} h-8 w-8`}>
            <i className="ri-arrow-left-s-line text-lg" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label={copy.next} title={copy.next} className={`${ICON_BUTTON} h-8 w-8`}>
            <i className="ri-arrow-right-s-line text-lg" aria-hidden="true" />
          </button>
        </div>
        <h2
          ref={titleRef}
          tabIndex={-1}
          aria-live="polite"
          className="min-w-36 text-base font-semibold text-zinc-900 focus:outline-none dark:text-zinc-100"
        >
          {monthTitle}
        </h2>
        {/* Only away from this month, where it has somewhere to go back to. It
            follows the title, so showing it moves nothing. */}
        {thisMonth ? null : (
          <button
            type="button"
            onClick={() => {
              setMonth(startOfMonth(new Date()));
              setPicked(new Date());
              // The button goes with the click; the month it brought back keeps the focus.
              titleRef.current?.focus();
            }}
            className={buttonClass("secondary", "sm")}
          >
            {copy.today}
          </button>
        )}
        {/* Where a failed load says so, in a slot that is always there. On a
            phone it holds only that, so it takes no line of its own until then. */}
        <div
          role="status"
          className={`ml-auto flex min-h-4 items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 ${error ? "" : "max-sm:sr-only"}`}
        >
          {error ? (
            <>
              <span className="text-rose-700 dark:text-rose-400">{copy.loadError}</span>
              <button type="button" onClick={reload} className="cursor-pointer font-medium text-cyan-700 hover:underline dark:text-cyan-400">
                {t.common.retry}
              </button>
            </>
          ) : (
            <ul className="hidden items-center gap-3 sm:flex" aria-hidden="true">
              {legend.map((item) => (
                <li key={item.label} className="inline-flex items-center gap-1">
                  <i className={`${item.icon} ${item.tone}`} />
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">{`${copy.label}, ${monthTitle}`}</caption>
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            {WEEK_ORDER.map((day) => (
              <th
                key={day}
                scope="col"
                abbr={t.schedules.weekdaysLong[day]}
                className="h-8 px-2 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                {t.schedules.weekdaysShort[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: WEEKS }, (_, week) => (
            <tr key={week} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
              {days.slice(week * 7, week * 7 + 7).map((day) => {
                const key = dayKey(day);
                const entries = byDay.get(key) ?? [];
                const inMonth = day.getMonth() === month.getMonth();
                const isToday = key === today;
                const isPicked = key === dayKey(picked);
                const number = (
                  <span
                    className={`${DATA} inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-xs ${
                      isToday
                        ? "border border-cyan-600 font-semibold text-cyan-800 dark:border-cyan-500 dark:text-cyan-300"
                        : inMonth
                          ? "text-zinc-800 dark:text-zinc-200"
                          : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                );
                return (
                  <td
                    key={key}
                    className="h-14 border-r border-zinc-100 p-0 align-top last:border-r-0 sm:h-24 dark:border-zinc-800/60"
                  >
                    {/* A phone: the day is a button that lists its entries under the grid. */}
                    <button
                      type="button"
                      onClick={() => setPicked(day)}
                      aria-pressed={isPicked}
                      aria-label={`${longDate.format(day)}${entries.length ? `, ${copy.dayEntries(entries.length)}` : ""}`}
                      className={`flex h-full w-full cursor-pointer flex-col items-center gap-0.5 p-1 sm:hidden ${
                        isPicked ? "ring-1 ring-zinc-400 ring-inset dark:ring-zinc-500" : ""
                      }`}
                    >
                      {number}
                      <span className="flex flex-wrap justify-center gap-px" aria-hidden="true">
                        {entries.slice(0, SHOWN).map((entry) => {
                          const { icon, tone } = look(entry);
                          return <i key={entry.key} className={`${icon} text-[11px] leading-none ${tone}`} />;
                        })}
                      </span>
                    </button>
                    <div className="hidden h-full flex-col gap-0.5 overflow-hidden p-1.5 sm:flex">
                      <div className="mb-0.5">
                        {number}
                        {isToday ? <span className="sr-only">, {copy.today}</span> : null}
                      </div>
                      {entries.length ? (
                        <ul className="min-w-0 space-y-0.5">
                          {entries.slice(0, SHOWN).map((entry) => (
                            <li key={entry.key} className="min-w-0">
                              <EntryLine entry={entry} label={entryLabel(entry)} />
                            </li>
                          ))}
                          {entries.length > SHOWN ? (
                            <li className="text-[11px] leading-4 text-zinc-600 dark:text-zinc-400">
                              {/* Every entry is still in the list, for screen readers. */}
                              <span aria-hidden="true">{copy.more(entries.length - SHOWN)}</span>
                              <ul className="sr-only">
                                {entries.slice(SHOWN).map((entry) => (
                                  <li key={entry.key}>{entryLabel(entry)}</li>
                                ))}
                              </ul>
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* The picked day on a phone, where the grid has room for icons only. */}
      <div className="border-t border-zinc-200 px-3 py-3 sm:hidden dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 first-letter:uppercase dark:text-zinc-100">
          {longDate.format(picked)}
        </h3>
        {pickedEntries.length ? (
          <ul className="space-y-1.5">
            {pickedEntries.map((entry) => (
              <li key={entry.key} className="[&>*]:text-xs [&>*]:leading-5">
                <EntryLine entry={entry} label={entryLabel(entry)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{data ? copy.dayEmpty : ""}</p>
        )}
      </div>
    </section>
  );
}
