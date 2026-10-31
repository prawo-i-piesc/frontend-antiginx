"use client";

import { useId, useState } from "react";

import { NoAccess } from "@/app/components/admin/AdminFrame";
import ConfirmDialog from "@/app/components/admin/ConfirmDialog";
import { Empty, Field, Section, SectionTitle, SheetDialog, SheetLayout, SheetSkeleton } from "@/app/components/admin/Sheet";
import {
  CODE,
  DATA,
  IdCell,
  LoadFailure,
  Stamp,
  StatusLabel,
  TABLE,
  TH,
  THEAD,
  Tag,
} from "@/app/components/ui/table";
import { BUTTON_DANGER } from "@/app/components/profile/ui";
import useAdminQuery from "@/app/hooks/useAdminQuery";
import { useI18n } from "@/app/i18n/I18nProvider";
import { deleteScan, getScan, type AdminScanResult } from "@/app/lib/adminApi";
import { useToast } from "@/app/providers/ToastProvider";

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

const SEVERITY_TONES: Record<string, string> = {
  CRITICAL: "text-rose-700 dark:text-rose-400",
  HIGH: "text-orange-700 dark:text-orange-400",
  MEDIUM: "text-amber-700 dark:text-amber-400",
  LOW: "text-yellow-700 dark:text-yellow-300",
  INFO: "text-sky-700 dark:text-sky-400",
};

/** The engine reports "no severity" as NONE, which the rest of the app shows as INFO. */
function severityOf(result: AdminScanResult): string {
  const value = result.severity.trim().toUpperCase();
  return value === "NONE" ? "INFO" : value;
}

/** Failures first, the worst of them on top; passes after, by name. */
function sortResults(results: AdminScanResult[]): AdminScanResult[] {
  const rank = (result: AdminScanResult) => {
    const index = SEVERITY_ORDER.indexOf(severityOf(result));
    return index === -1 ? SEVERITY_ORDER.length : index;
  };
  return [...results].sort(
    (a, b) =>
      Number(a.passed) - Number(b.passed) || rank(a) - rank(b) || a.test_name.localeCompare(b.test_name),
  );
}

/**
 * One scan of either kind, whoever owns it, with every result the engine sent
 * back. GET /api/admin/scans/:id.
 */
export default function ScanInspector({
  scanId,
  onClose,
  onOpenOwner,
  onDeleted,
}: {
  scanId: string | null;
  onClose: () => void;
  /** Swaps this panel for the owner's account. */
  onOpenOwner: (userId: string) => void;
  onDeleted: () => void;
}) {
  const id = useId();

  return (
    <SheetDialog open={scanId !== null} onClose={onClose} labelledBy={`${id}-title`} wide>
      {scanId ? (
        <Inspector
          key={scanId}
          titleId={`${id}-title`}
          scanId={scanId}
          onClose={onClose}
          onOpenOwner={onOpenOwner}
          onDeleted={onDeleted}
        />
      ) : null}
    </SheetDialog>
  );
}

function Inspector({
  titleId,
  scanId,
  onClose,
  onOpenOwner,
  onDeleted,
}: {
  titleId: string;
  scanId: string;
  onClose: () => void;
  onOpenOwner: (userId: string) => void;
  onDeleted: () => void;
}) {
  const { t, format } = useI18n();
  const copy = t.admin.scanInspector;
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  const { data: scan, loading, error, reload } = useAdminQuery(`scan:${scanId}`, (signal) => getScan(scanId, signal));

  const results = scan ? sortResults(scan.results) : [];
  const failed = results.filter((result) => !result.passed).length;
  const seconds =
    scan?.started_at && scan.completed_at
      ? Math.max(0, Math.round((Date.parse(scan.completed_at) - Date.parse(scan.started_at)) / 1000))
      : null;

  async function remove() {
    await deleteScan(scanId);
    toast.success(t.admin.scans.deleted);
    onDeleted();
    onClose();
  }

  return (
    <SheetLayout
      titleId={titleId}
      title={copy.title}
      subtitle={scan?.target_url ?? scanId}
      busy={loading}
      onClose={onClose}
    >
      {loading && !scan ? <SheetSkeleton sections={[9]} /> : null}
      {error?.kind === "forbidden" ? <NoAccess /> : null}
      {error && error.kind !== "forbidden" ? (
        <LoadFailure error={error} title={copy.loadError} onRetry={reload} />
      ) : null}

      {scan ? (
        <>
          <Section title={copy.sections.scan}>
            <Field label={copy.fields.id}>
              <IdCell id={scan.id} />
            </Field>
            <Field label={copy.fields.target}>
              <span className="wrap-anywhere">{scan.target_url}</span>
            </Field>
            <Field label={copy.fields.type}>
              <Tag tone={scan.type === "premium" ? "violet" : "zinc"}>{t.admin.scans.types[scan.type]}</Tag>
            </Field>
            <Field label={copy.fields.status}>
              <StatusLabel status={scan.status} />
            </Field>
            <Field label={copy.fields.owner}>
              {scan.user_id ? (
                <button
                  type="button"
                  onClick={() => onOpenOwner(scan.user_id as string)}
                  className="cursor-pointer text-cyan-700 hover:underline dark:text-cyan-400 wrap-anywhere"
                >
                  {scan.user_email ?? t.admin.scans.ownerGone}
                </button>
              ) : (
                <span className="text-zinc-600 dark:text-zinc-400">{t.admin.scans.anonymous}</span>
              )}
            </Field>
            <Field label={copy.fields.created}>
              <Stamp value={scan.created_at} />
            </Field>
            <Field label={copy.fields.started}>{scan.started_at ? <Stamp value={scan.started_at} /> : <Empty />}</Field>
            <Field label={copy.fields.completed}>
              {scan.completed_at ? <Stamp value={scan.completed_at} /> : <Empty />}
            </Field>
            <Field label={copy.fields.duration}>
              {seconds !== null ? copy.seconds(format.number(seconds)) : <Empty />}
            </Field>
          </Section>

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <SectionTitle>{copy.sections.results}</SectionTitle>
              {results.length > 0 ? (
                <p className={`${DATA} text-xs text-zinc-600 dark:text-zinc-400`}>{copy.summary(results.length, failed)}</p>
              ) : null}
            </div>

            {results.length === 0 ? (
              <p className="mt-2 rounded-lg border border-zinc-200 px-3 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                {copy.noResults}
              </p>
            ) : (
              <div className="relative mt-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className={TABLE}>
                  <caption className="sr-only">{copy.sections.results}</caption>
                  <thead className={THEAD}>
                    <tr>
                      <th scope="col" className={`${TH} w-28 text-left`}>
                        {copy.columns.result}
                      </th>
                      <th scope="col" className={`${TH} text-left`}>
                        {copy.columns.test}
                      </th>
                      <th scope="col" className={`${TH} w-24 text-right`}>
                        {copy.columns.severity}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr
                        key={result.id}
                        className="border-b border-zinc-100 align-top last:border-0 dark:border-zinc-800/60"
                      >
                        <td className="px-3 py-2.5">
                          <Verdict passed={result.passed} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className={`${CODE} text-zinc-900 dark:text-zinc-100 wrap-anywhere`}>
                            {result.test_name}
                          </div>
                          {/* The engine writes its messages in English. */}
                          {result.message ? (
                            <p lang="en" className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400 wrap-anywhere">
                              {result.message}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <Severity value={severityOf(result)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <SectionTitle>{t.admin.inspector.sections.actions}</SectionTitle>
            <button type="button" onClick={() => setConfirming(true)} className={`${BUTTON_DANGER} mt-2 w-full`}>
              <i className="ri-delete-bin-line" aria-hidden="true" />
              {t.admin.scans.deleteConfirm}
            </button>
          </section>

          <ConfirmDialog
            open={confirming}
            title={t.admin.scans.deleteTitle}
            description={t.admin.scans.deleteDescription(scan.target_url)}
            confirmLabel={t.admin.scans.deleteConfirm}
            onConfirm={remove}
            onClose={() => setConfirming(false)}
          />
        </>
      ) : null}
    </SheetLayout>
  );
}

function Verdict({ passed }: { passed: boolean }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${
        passed ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
      }`}
    >
      <i className={passed ? "ri-check-line" : "ri-close-line"} aria-hidden="true" />
      {passed ? t.scan.result.passed : t.scan.result.failed}
    </span>
  );
}

function Severity({ value }: { value: string }) {
  const { t } = useI18n();
  const label = (t.scan.severity as Record<string, string | undefined>)[value] ?? value;
  return (
    <span className={`text-xs font-medium ${SEVERITY_TONES[value] ?? "text-zinc-600 dark:text-zinc-400"}`}>{label}</span>
  );
}
