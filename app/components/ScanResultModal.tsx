"use client";

import { useId, useState } from 'react';

import Dialog from '@/app/components/ui/Dialog';
import SiteAddress, { ADDRESS_TEXT } from '@/app/components/ui/SiteAddress';
import type { LiveScan } from '@/app/hooks/useLiveScan';
import { useI18n } from '@/app/i18n/I18nProvider';
import { isFinishedStatus } from '@/app/lib/api';
import ReportDialog from './ReportDialog';
import { closeEnclosingDialog } from './ScanErrorModal';
import ScanResults from './scan/ScanResults';

interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  live: LiveScan;
}

/** The scan started from the landing page, followed live. The page is always dark, hence the class. */
export default function ScanResultModal({ isOpen, onClose, live }: ScanResultModalProps) {
  const { t } = useI18n();
  const titleId = useId();
  const [reportOpen, setReportOpen] = useState(false);

  const scan = live.scan;
  const finished = scan !== null && isFinishedStatus(scan.status);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop
      className="dark quiet-focus m-auto w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-0 text-zinc-100 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-white">{t.scan.resultsTitle}</h2>
          {/* min-h keeps the header's height until the address arrives. */}
          <p className="min-h-4 text-xs text-zinc-400">
            {scan ? (
              <SiteAddress url={scan.target_url} favicon={scan.favicon}>
                <span className={ADDRESS_TEXT} title={scan.target_url}>
                  <span className="sr-only">{t.scan.target}: </span>
                  {scan.target_url.replace(/^https?:\/\//, '')}
                </span>
              </SiteAddress>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => closeEnclosingDialog(event, onClose)}
          aria-label={t.common.close}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <i className="ri-close-line text-lg" aria-hidden="true"></i>
        </button>
      </div>

      {/* Focusable so it can be scrolled from the keyboard */}
      <div
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
        className="scrollbar-theme max-h-[calc(90vh-7.5rem)] overflow-y-auto focus-visible:-outline-offset-2"
      >
        <ScanResults live={live} bare />
      </div>

      <div className="flex items-center justify-end gap-2.5 border-t border-zinc-800 px-4 py-3">
        {finished ? (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            aria-haspopup="dialog"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            <i className="ri-download-line" aria-hidden="true"></i>
            {t.scan.export}
          </button>
        ) : null}
        <button
          type="button"
          onClick={(event) => closeEnclosingDialog(event, onClose)}
          className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
        >
          {t.common.close}
        </button>
      </div>

      {/* Opened on top of this modal, so closing it returns focus to the export button. */}
      {reportOpen && scan ? (
        <ReportDialog
          open
          onClose={() => setReportOpen(false)}
          scanId={scan.id}
          targetUrl={scan.target_url}
          mode="free"
          variant="modal"
        />
      ) : null}
    </Dialog>
  );
}
