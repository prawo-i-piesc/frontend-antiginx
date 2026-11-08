"use client";

import { useEffect, useId, useRef, useState } from "react";

import { buttonClass, iconButtonClass } from "@/app/components/ui/buttonStyles";
import Dialog from "@/app/components/ui/Dialog";
import SiteAddress, { ADDRESS_TEXT } from "@/app/components/ui/SiteAddress";
import type { Locale } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { ScanAccessMode } from "@/app/lib/api";
import {
  fetchScanReport,
  REPORT_FORMATS,
  reportErrorOf,
  saveReport,
  type ReportError,
  type ReportFormat,
  type ScanReport,
} from "@/app/lib/report";
import { useToast } from "@/app/providers/ToastProvider";
import { closeEnclosingDialog } from "./ScanErrorModal";

const FORMAT_ICONS: Record<ReportFormat, string> = {
  pdf: "ri-file-pdf-2-line",
  html: "ri-html5-line",
  md: "ri-markdown-line",
  sarif: "ri-code-s-slash-line",
};

/**
 * The dialog's frame. On the dashboard it follows the theme; over the landing
 * page's scan modal it is that modal's dark surface, so the "dark" class turns
 * every dark: style on.
 */
const FRAME = {
  page: "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-100",
  modal: "dark border-zinc-800 bg-zinc-950 text-zinc-100",
} as const;

const RULE = "border-zinc-200 dark:border-zinc-800";
const MUTED = "text-zinc-600 dark:text-zinc-400";

/**
 * The HTML report, tagged with the request and language it answers, so
 * "loading" is simply "not answered yet for what is on screen now".
 */
type Preview = {
  request: number;
  locale: Locale;
  report: ScanReport | null;
  html: string;
  error: ReportError | null;
};

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  scanId: string;
  targetUrl: string;
  /** Hash of the site's icon, shown beside the address. */
  favicon?: string | null;
  mode: ScanAccessMode;
  variant?: "modal" | "page";
}

/**
 * Picks a report format, previews the report and downloads it.
 *
 * The preview is the backend's HTML report, shown in a sandboxed frame: it
 * holds text from the scanned site, so it gets no scripts, no same-origin
 * access and nothing to navigate.
 */
export default function ReportDialog({
  open,
  onClose,
  scanId,
  targetUrl,
  favicon,
  mode,
  variant = "page",
}: ReportDialogProps) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const copy = t.scan.report;

  const baseId = useId();
  const titleId = `${baseId}-title`;

  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [generating, setGenerating] = useState<ReportFormat | null>(null);
  const [previewRequest, setPreviewRequest] = useState(0);
  const [preview, setPreview] = useState<Preview | null>(null);
  const downloadAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    fetchScanReport(scanId, { mode, format: "html", lang: locale, signal: controller.signal })
      .then(async (report) => {
        const html = await report.blob.text();
        if (!controller.signal.aborted) setPreview({ request: previewRequest, locale, report, html, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load the report preview:", error);
        setPreview({ request: previewRequest, locale, report: null, html: "", error: reportErrorOf(error) });
      });

    return () => controller.abort();
  }, [open, scanId, mode, locale, previewRequest]);

  // Closing the dialog drops a download still being generated rather than
  // saving a file the person has walked away from.
  useEffect(() => () => downloadAbort.current?.abort(), []);

  const previewLoading = preview?.request !== previewRequest || preview.locale !== locale;
  const previewError = previewLoading ? null : (preview?.error ?? null);

  async function download() {
    if (generating) return;

    const controller = new AbortController();
    downloadAbort.current = controller;
    setGenerating(format);
    try {
      // The preview already is the HTML report; no need to generate it twice.
      const report =
        format === "html" && !previewLoading && preview?.report
          ? preview.report
          : await fetchScanReport(scanId, { mode, format, lang: locale, signal: controller.signal });
      if (controller.signal.aborted) return;
      saveReport(report);
      toast.success(copy.downloaded, { description: report.filename });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Failed to download the report:", error);
      toast.error(copy.downloadFailed, { description: copy.errors[reportErrorOf(error)] });
    } finally {
      if (!controller.signal.aborted) setGenerating(null);
    }
  }

  const formatName = copy.formats[format].name;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[min(60rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border p-0 shadow-2xl open:flex backdrop:bg-zinc-950/70 ${FRAME[variant]}`}
    >
      <div className={`flex items-start justify-between gap-4 border-b px-5 py-4 ${RULE}`}>
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold">
            {copy.title}
          </h2>
          <p className={`mt-1 text-sm ${MUTED}`}>
            <SiteAddress url={targetUrl} favicon={favicon}>
              <span className={ADDRESS_TEXT} title={targetUrl}>
                <span className="sr-only">{copy.target}: </span>
                {targetUrl.replace(/^https?:\/\//, "")}
              </span>
            </SiteAddress>
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => closeEnclosingDialog(event, onClose)}
          aria-label={t.common.close}
          title={t.common.close}
          className={iconButtonClass("ghost", "sm")}
        >
          <i className="ri-close-line" aria-hidden="true" />
        </button>
      </div>

      {/* Formats beside the preview; stacked above it on a phone. */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:flex-row md:overflow-hidden">
        <fieldset className="shrink-0 md:w-60">
          <legend className={`mb-2 text-xs ${MUTED}`}>{copy.formatLabel}</legend>
          <div className={`divide-y overflow-hidden rounded-lg border ${RULE} divide-zinc-200 dark:divide-zinc-800`}>
            {REPORT_FORMATS.map((option) => {
              const checked = format === option;
              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-600 has-[:focus-visible]:ring-inset dark:hover:bg-zinc-800/40 dark:has-[:focus-visible]:ring-cyan-400"
                >
                  <input
                    type="radio"
                    name={`${baseId}-format`}
                    value={option}
                    checked={checked}
                    onChange={() => setFormat(option)}
                    className="sr-only"
                  />
                  <i className={`${FORMAT_ICONS[option]} text-base ${MUTED}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{copy.formats[option].name}</span>
                    <span className={`block text-xs ${MUTED}`}>{copy.formats[option].description}</span>
                  </span>
                  {/* The choice is told by the tick, so nothing else changes size. */}
                  <i
                    className={`ri-check-line text-base text-cyan-700 dark:text-cyan-400 ${checked ? "" : "invisible"}`}
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        <section aria-labelledby={`${baseId}-preview`} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 id={`${baseId}-preview`} className={`text-xs ${MUTED}`}>
              {copy.preview}
            </h3>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">{copy.previewNote}</p>
          </div>
          {/* The report is a light document whatever the theme, so its frame is white. */}
          <div
            className={`relative min-h-[50vh] flex-1 overflow-hidden rounded-lg border bg-white md:min-h-[58vh] ${RULE}`}
            aria-busy={previewLoading}
          >
            {!previewLoading && !previewError && preview && (
              <iframe
                title={copy.previewFrame(targetUrl)}
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={preview.html}
                className="absolute inset-0 h-full w-full bg-white"
              />
            )}
            <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {previewLoading && (
                <span className="flex items-center gap-2 text-sm text-zinc-600">
                  <i className="ri-loader-4-line animate-spin text-base" aria-hidden="true" />
                  {copy.previewLoading}
                </span>
              )}
            </div>
            {previewError && (
              <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="max-w-sm text-sm text-zinc-700">
                  {copy.previewError} {copy.errors[previewError]}
                </p>
                {previewError !== "notFound" && (
                  <button
                    type="button"
                    onClick={() => setPreviewRequest((request) => request + 1)}
                    className={buttonClass("secondary", "sm")}
                  >
                    <i className="ri-refresh-line" aria-hidden="true" />
                    {t.common.retry}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className={`flex items-center justify-end gap-2 border-t px-5 py-3 ${RULE}`}>
        <button type="button" onClick={(event) => closeEnclosingDialog(event, onClose)} className={buttonClass("secondary")}>
          {t.common.close}
        </button>
        <button
          type="button"
          onClick={download}
          aria-disabled={generating !== null}
          className={`${buttonClass("primary")} aria-disabled:cursor-wait`}
        >
          <i className={generating ? "ri-loader-4-line animate-spin" : "ri-download-line"} aria-hidden="true" />
          {generating ? copy.generating : copy.downloadAs(formatName)}
        </button>
      </div>
    </Dialog>
  );
}
