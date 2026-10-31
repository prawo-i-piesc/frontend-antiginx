"use client";

import { useEffect, useId, useRef, useState } from "react";

import Dialog from "@/app/components/ui/Dialog";
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
 * The two looks of the scan screens: "modal" is the dark landing page modal,
 * "page" the dashboard, which follows the light and dark theme.
 */
const STYLES = {
  modal: {
    dialog:
      "m-auto p-0 w-[calc(100%-2rem)] max-w-4xl max-h-[calc(100dvh-2rem)] overflow-hidden flex-col open:flex bg-black/60 backdrop-blur-xl rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.15)] border border-cyan-500/30 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm",
    divider: "border-cyan-500/20",
    footerDivider: "border-zinc-800/50",
    title: "text-base font-bold text-white",
    muted: "text-zinc-400",
    target: "text-cyan-400/80",
    closeButton: "hover:bg-zinc-800/50 text-zinc-400 hover:text-white",
    option:
      "border-zinc-700/60 hover:bg-zinc-800/40 has-[:checked]:border-cyan-500/50 has-[:checked]:bg-cyan-600/20",
    optionIcon: "text-cyan-400",
    optionName: "text-white",
    frame: "border-zinc-700/60",
    error: "text-red-400",
    primary: "bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30",
    quiet: "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 border border-zinc-700/50",
  },
  page: {
    dialog:
      "m-auto p-0 w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-hidden flex-col open:flex rounded-2xl border border-zinc-300 bg-white text-zinc-900 shadow-2xl backdrop:bg-zinc-950/70 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-100",
    divider: "border-zinc-200 dark:border-zinc-700/50",
    footerDivider: "border-zinc-200 dark:border-zinc-700/50",
    title: "text-lg font-semibold",
    muted: "text-zinc-600 dark:text-zinc-400",
    target: "text-cyan-700 dark:text-cyan-400",
    closeButton: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
    option:
      "border-zinc-300 dark:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 has-[:checked]:border-cyan-500/60 has-[:checked]:bg-cyan-500/10",
    optionIcon: "text-cyan-700 dark:text-cyan-400",
    optionName: "text-zinc-900 dark:text-zinc-100",
    frame: "border-zinc-300 dark:border-zinc-700/60",
    error: "text-rose-700 dark:text-rose-400",
    primary:
      "border border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60",
    quiet:
      "border border-zinc-300 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
  },
} as const;

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
export default function ReportDialog({ open, onClose, scanId, targetUrl, mode, variant = "page" }: ReportDialogProps) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const copy = t.scan.report;
  const style = STYLES[variant];

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
    <Dialog open={open} onClose={onClose} labelledBy={titleId} closeOnBackdrop className={style.dialog}>
      {/* Header */}
      <div className={`px-5 py-3 border-b ${style.divider} flex items-start justify-between gap-4`}>
        <div className="min-w-0">
          <h2 id={titleId} className={style.title}>
            {copy.title}
          </h2>
          <p className="flex items-center gap-2 text-xs mt-0.5 min-w-0">
            <i className={`ri-global-line ${style.muted}`} aria-hidden="true"></i>
            <span className="sr-only">{copy.target}: </span>
            <span className={`${style.target} font-mono truncate`} title={targetUrl}>
              {targetUrl.replace(/^https?:\/\//, "")}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => closeEnclosingDialog(event, onClose)}
          aria-label={t.common.close}
          className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${style.closeButton}`}
        >
          <i className="ri-close-line text-lg" aria-hidden="true"></i>
        </button>
      </div>

      {/* Content: formats on the left, the preview takes the rest */}
      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5">
        <fieldset className="md:w-64 shrink-0">
          <legend className={`text-xs font-medium uppercase tracking-wide mb-2 ${style.muted}`}>
            {copy.formatLabel}
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {REPORT_FORMATS.map((option) => (
              <label
                key={option}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-500 ${style.option}`}
              >
                <input
                  type="radio"
                  name={`${baseId}-format`}
                  value={option}
                  checked={format === option}
                  onChange={() => setFormat(option)}
                  className="sr-only"
                />
                <i className={`${FORMAT_ICONS[option]} text-lg leading-5 ${style.optionIcon}`} aria-hidden="true"></i>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${style.optionName}`}>{copy.formats[option].name}</span>
                  <span className={`block text-xs mt-0.5 ${style.muted}`}>{copy.formats[option].description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section aria-labelledby={`${baseId}-preview`} className="flex-1 min-w-0 flex flex-col min-h-0">
          <h3 id={`${baseId}-preview`} className={`text-xs font-medium uppercase tracking-wide mb-2 ${style.muted}`}>
            {copy.preview}
          </h3>
          <div
            className={`relative flex-1 min-h-[50vh] md:min-h-[55vh] rounded-lg border overflow-hidden bg-white ${style.frame}`}
            aria-busy={previewLoading}
          >
            {!previewLoading && !previewError && preview && (
              <iframe
                title={copy.previewFrame(targetUrl)}
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={preview.html}
                className="absolute inset-0 w-full h-full bg-white"
              />
            )}
            <div role="status" className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {previewLoading && (
                <span className="flex flex-col items-center gap-3 text-sm text-zinc-600">
                  <span
                    className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500/30 border-t-cyan-500"
                    aria-hidden="true"
                  ></span>
                  {copy.previewLoading}
                </span>
              )}
            </div>
            {previewError && (
              <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <i className="ri-error-warning-line text-2xl text-rose-600" aria-hidden="true"></i>
                <p className="text-sm text-zinc-700">
                  {copy.previewError} {copy.errors[previewError]}
                </p>
                {previewError !== "notFound" && (
                  <button
                    type="button"
                    onClick={() => setPreviewRequest((request) => request + 1)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-zinc-300 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-refresh-line" aria-hidden="true"></i>
                    {t.common.retry}
                  </button>
                )}
              </div>
            )}
          </div>
          <p className={`mt-2 text-xs ${style.muted}`}>{copy.previewNote}</p>
        </section>
      </div>

      {/* Footer */}
      <div className={`px-5 py-3 border-t ${style.footerDivider} flex items-center justify-end gap-2.5`}>
        <button
          type="button"
          onClick={(event) => closeEnclosingDialog(event, onClose)}
          className={`px-4 py-2 rounded-lg transition-all font-medium text-sm cursor-pointer ${style.quiet}`}
        >
          {t.common.close}
        </button>
        <button
          type="button"
          onClick={download}
          aria-disabled={generating !== null}
          className={`px-4 py-2 rounded-lg transition-all font-medium text-sm cursor-pointer flex items-center gap-2 aria-disabled:opacity-60 aria-disabled:cursor-wait ${style.primary}`}
        >
          <i
            className={`${generating ? "ri-loader-4-line animate-spin" : "ri-download-line"} text-sm`}
            aria-hidden="true"
          ></i>
          {generating ? copy.generating : copy.downloadAs(formatName)}
        </button>
      </div>
    </Dialog>
  );
}
