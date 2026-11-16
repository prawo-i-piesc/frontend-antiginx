"use client";

import { useId, useRef, useState } from "react";

import TestPicker from "@/app/components/scan/TestPicker";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import Dropdown from "@/app/components/ui/Dropdown";
import Segmented from "@/app/components/ui/Segmented";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { SURFACE } from "@/app/components/ui/surface";
import { CONTROL, DATA, LoadFailure, TOOLBAR } from "@/app/components/ui/table";
import useApiQuery from "@/app/hooks/useApiQuery";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getPremiumScanConfig } from "@/app/lib/api";
import { ApiError, fieldMessages } from "@/app/lib/authErrors";
import {
  browserTimeZone,
  createSchedule,
  MAX_MONTH_DAY,
  SCHEDULE_FREQUENCIES,
  updateSchedule,
  type Schedule,
  type ScheduleDefinition,
  type ScheduleFrequency,
} from "@/app/lib/schedulesApi";
import { normalizeTargetUrl } from "@/app/lib/scanTarget";

const FIELD_LABEL = "block text-xs font-medium text-zinc-600 dark:text-zinc-400";
const TEXT_ACTION =
  "cursor-pointer text-xs font-medium text-cyan-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-400";

/** Monday first, as the calendar draws the week. */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const MONTH_DAYS = Array.from({ length: MAX_MONTH_DAY }, (_, index) => String(index + 1));

/** The next full hour, a time that is plainly a choice rather than a default. */
function defaultTime(): string {
  return `${String((new Date().getHours() + 1) % 24).padStart(2, "0")}:00`;
}

/**
 * Adds or edits a schedule: the address, how often and when, and the tests.
 * Laid out like the new-scan form, and like it says what is wrong in the
 * count at the top, which is already there, so nothing below moves.
 *
 * The time is kept in the browser's time zone; an edit moves the schedule to
 * it as well.
 */
export default function ScheduleForm({
  schedule,
  onSaved,
  onCancel,
}: {
  /** The schedule to edit; a new one without it. */
  schedule?: Schedule;
  onSaved: (schedule: Schedule, created: boolean) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const copy = t.schedules.form;
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const statusId = `${baseId}-status`;
  const urlId = `${baseId}-url`;
  const timeId = `${baseId}-time`;
  const scopeId = `${baseId}-scope`;
  const weekdayLabelId = `${baseId}-weekday`;
  const monthDayId = `${baseId}-month-day`;

  const [url, setUrl] = useState(schedule?.target_url ?? "");
  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule?.frequency ?? "weekly");
  const [time, setTime] = useState(schedule?.time ?? defaultTime);
  const [weekday, setWeekday] = useState<number>(schedule?.weekday ?? new Date().getDay());
  const [monthDay, setMonthDay] = useState<string>(String(schedule?.month_day ?? Math.min(new Date().getDate(), MAX_MONTH_DAY)));
  const [selected, setSelected] = useState<string[] | null>(schedule?.tests ?? null);
  const [problem, setProblem] = useState<{ field: "url" | "time" | null; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const urlRef = useRef<HTMLInputElement>(null);
  const zone = browserTimeZone();

  const catalog = useApiQuery("schedule-tests", (signal) => {
    void signal;
    return getPremiumScanConfig();
  });
  const categories = catalog.data ?? [];
  const allTests = categories.flatMap((category) => category.tests.map((test) => test.id));
  // A new schedule starts with every test, as a new scan does.
  const chosen = (selected ?? allTests).filter((id) => allTests.includes(id));
  const allSelected = allTests.length > 0 && chosen.length === allTests.length;
  const noTests = catalog.data !== undefined && chosen.length === 0;

  function toggle(id: string) {
    setSelected((current) => {
      const base = current ?? allTests;
      return base.includes(id) ? base.filter((test) => test !== id) : [...base, id];
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const target = url.trim();
    if (!target) {
      setProblem({ field: "url", message: copy.urlRequired });
      urlRef.current?.focus();
      return;
    }
    if (chosen.length === 0) return;

    const definition: ScheduleDefinition = {
      target_url: normalizeTargetUrl(target),
      tests: chosen,
      frequency,
      time,
      weekday: frequency === "weekly" ? weekday : null,
      month_day: frequency === "monthly" ? Number(monthDay) : null,
      timezone: zone,
    };

    setSaving(true);
    setProblem(null);
    try {
      const saved = schedule ? await updateSchedule(schedule.id, definition) : await createSchedule(definition);
      onSaved(saved, !schedule);
    } catch (error) {
      setSaving(false);
      if (error instanceof ApiError) {
        const fields = fieldMessages(error.fields);
        if (fields.target_url) {
          setProblem({ field: "url", message: fields.target_url });
          urlRef.current?.focus();
        } else if (fields.time) {
          setProblem({ field: "time", message: fields.time });
        } else {
          setProblem({ field: null, message: Object.values(fields)[0] ?? error.message });
        }
      } else {
        setProblem({ field: null, message: error instanceof TypeError ? t.common.networkError : t.common.genericError });
      }
    }
  }

  const status = problem?.message ?? (noTests ? t.scanner.form.noTestsSelected : null);

  return (
    <form onSubmit={(event) => void submit(event)} noValidate aria-labelledby={headingId} className={`${SURFACE} page-in mb-6 overflow-hidden`}>
      <div className={TOOLBAR}>
        <h2 id={headingId} className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {schedule ? copy.titleEdit : copy.titleNew}
        </h2>
        {/* What is wrong goes here, in a slot that is already there, so nothing below moves. */}
        <p
          id={statusId}
          role="status"
          className={`${DATA} ml-auto min-h-4 text-xs ${
            problem
              ? "font-medium text-rose-700 dark:text-rose-400"
              : noTests
                ? "font-medium text-amber-700 dark:text-amber-400"
                : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {status ??
            (catalog.data
              ? allSelected
                ? t.scanner.form.allSelected(allTests.length)
                : t.scanner.form.totalSelected(chosen.length, allTests.length)
              : "")}
        </p>
      </div>

      <div className="space-y-5 px-3 py-4 sm:px-4">
        <div>
          <label htmlFor={urlId} className={`${FIELD_LABEL} mb-1.5`}>
            {copy.urlLabel}
          </label>
          <div className="relative">
            <i
              className="ri-global-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              aria-hidden="true"
            ></i>
            <input
              ref={urlRef}
              id={urlId}
              type="text"
              inputMode="url"
              spellCheck={false}
              autoFocus
              required
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                if (problem?.field === "url") setProblem(null);
              }}
              placeholder={copy.urlPlaceholder}
              aria-invalid={problem?.field === "url" || undefined}
              aria-describedby={problem?.field === "url" ? statusId : undefined}
              readOnly={saving}
              className={`${CONTROL} w-full pl-9 pr-3 placeholder:text-zinc-500 aria-invalid:border-rose-600 dark:placeholder:text-zinc-500 dark:aria-invalid:border-rose-400`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div>
            <p className={`${FIELD_LABEL} mb-1.5`} id={`${baseId}-frequency`}>
              {copy.frequency}
            </p>
            <Segmented
              label={copy.frequency}
              value={frequency}
              options={SCHEDULE_FREQUENCIES.map((value) => ({ value, label: copy.frequencies[value] }))}
              onChange={setFrequency}
            />
          </div>

          {frequency === "weekly" ? (
            <div className="max-w-full">
              <p id={weekdayLabelId} className={`${FIELD_LABEL} mb-1.5`}>
                {copy.weekday}
              </p>
              <Segmented
                label={copy.weekday}
                value={weekday}
                options={WEEK_ORDER.map((day) => ({ value: day, label: t.schedules.weekdaysShort[day] }))}
                onChange={setWeekday}
                className="max-w-full overflow-x-auto"
              />
            </div>
          ) : null}

          {frequency === "monthly" ? (
            <div>
              <label htmlFor={monthDayId} className={`${FIELD_LABEL} mb-1.5`}>
                {copy.monthDay}
              </label>
              <Dropdown
                id={monthDayId}
                value={monthDay}
                options={MONTH_DAYS.map((day) => ({ value: day, label: `${day}.` }))}
                onChange={setMonthDay}
                className="w-24"
              />
            </div>
          ) : null}

          <div>
            <label htmlFor={timeId} className={`${FIELD_LABEL} mb-1.5`}>
              {copy.time}
            </label>
            <input
              id={timeId}
              type="time"
              required
              value={time}
              step={60}
              onChange={(event) => {
                if (event.target.value) setTime(event.target.value);
                if (problem?.field === "time") setProblem(null);
              }}
              aria-invalid={problem?.field === "time" || undefined}
              aria-describedby={`${baseId}-zone`}
              readOnly={saving}
              className={`${CONTROL} ${DATA} w-28 px-3`}
            />
          </div>
        </div>

        <p id={`${baseId}-zone`} className="-mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          {copy.zone(zone)}
          {frequency === "monthly" ? ` ${copy.monthDayHint}` : null}
        </p>

        <fieldset aria-labelledby={scopeId} className="min-w-0">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p id={scopeId} className={FIELD_LABEL}>
              {copy.scope}
            </p>
            {catalog.data ? (
              <button type="button" onClick={() => setSelected(allSelected ? [] : allTests)} disabled={saving} className={TEXT_ACTION}>
                {allSelected ? t.scanner.form.categoryNone : t.scanner.form.categoryAll}
              </button>
            ) : null}
          </div>

          {catalog.error ? (
            <LoadFailure error={catalog.error} title={t.scanner.form.testsLoadError} onRetry={catalog.reload} />
          ) : !catalog.data ? (
            <SkeletonRegion className="space-y-3">
              <Bone className="h-9 w-72 max-w-full rounded-lg" />
              <Bone className="h-3.5 w-96 max-w-full" />
            </SkeletonRegion>
          ) : (
            <TestPicker idPrefix={baseId} categories={categories} selected={chosen} onToggle={toggle} disabled={saving} />
          )}
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-zinc-200 px-3 py-3 sm:flex-row sm:justify-end sm:px-4 dark:border-zinc-800">
        <button type="button" onClick={onCancel} className={buttonClass("secondary")}>
          {copy.cancel}
        </button>
        <button
          type="submit"
          disabled={!catalog.data || noTests}
          aria-disabled={saving || undefined}
          aria-describedby={status ? statusId : undefined}
          className={buttonClass("primary")}
        >
          <i className={saving ? "ri-loader-4-line animate-spin" : "ri-calendar-check-line"} aria-hidden="true"></i>
          <span>{saving ? copy.saving : copy.save}</span>
        </button>
      </div>
    </form>
  );
}
