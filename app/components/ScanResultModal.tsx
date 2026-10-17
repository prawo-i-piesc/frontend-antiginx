"use client";

import { useId } from 'react';

import Dialog from '@/app/components/ui/Dialog';
import { useI18n } from '@/app/i18n/I18nProvider';
import { getCompletedScanResults, type ScanResponse, type ScanStatus } from '@/app/lib/api';
import { downloadScanReport } from '@/app/lib/report';
import { closeEnclosingDialog } from './ScanErrorModal';
import ScanResultItem from './ScanResultItem';

interface ScanResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: ScanResponse;
}

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };

const STATUS_STYLES: Record<ScanStatus, { badge: string; icon?: string }> = {
  COMPLETED: { badge: 'bg-green-500/15 text-green-400', icon: 'ri-checkbox-circle-fill' },
  RUNNING: { badge: 'bg-yellow-500/15 text-yellow-400', icon: 'ri-loader-4-line animate-spin' },
  FAILED: { badge: 'bg-red-500/15 text-red-400', icon: 'ri-error-warning-fill' },
  PENDING: { badge: 'bg-zinc-600/15 text-zinc-400' },
};

export default function ScanResultModal({ isOpen, onClose, scanResult }: ScanResultModalProps) {
  const { t, locale } = useI18n();
  const titleId = useId();

  const completedResults = getCompletedScanResults(scanResult.results || []);

  const sortedResults = [...completedResults].sort((a, b) => {
    const aOrder = SEVERITY_ORDER[a.severity.toUpperCase()] ?? 5;
    const bOrder = SEVERITY_ORDER[b.severity.toUpperCase()] ?? 5;
    return aOrder - bOrder;
  }).map((result, index) => ({ ...result, animIndex: index }));

  const inProgress = scanResult.status === 'PENDING' || scanResult.status === 'RUNNING';
  const status = STATUS_STYLES[scanResult.status] ?? STATUS_STYLES.PENDING;

  // Read out when a scan that was running while the modal is open comes to an end.
  const outcome =
    scanResult.status === 'COMPLETED'
      ? t.scan.testsCompleted(sortedResults.length)
      : scanResult.status === 'FAILED'
        ? t.scan.errorTitle
        : '';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop
      className="m-auto p-0 w-[calc(100%-2rem)] max-w-2xl overflow-hidden bg-black/60 backdrop-blur-xl rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.15)] border border-cyan-500/30 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {/* Modal Header */}
      <div className="px-5 py-3 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 id={titleId} className="text-base font-bold text-white">{t.scan.resultsTitle}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <i className="ri-global-line text-zinc-500" aria-hidden="true"></i>
              <span className="sr-only">{t.scan.target}: </span>
              <span className="text-cyan-400/80 font-mono truncate">{scanResult.target_url.replace(/^https?:\/\//, '')}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${status.badge}`}>
                {status.icon && <i className={`${status.icon} text-[10px]`} aria-hidden="true"></i>}
                {t.scan.status[scanResult.status] ?? scanResult.status}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(event) => closeEnclosingDialog(event, onClose)}
            aria-label={t.common.close}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group ml-3"
          >
            <i className="ri-close-line text-lg text-zinc-400 group-hover:text-white transition-colors" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {/* Modal Content; focusable so it can be scrolled from the keyboard */}
      <div
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
        className="p-4 overflow-y-auto scrollbar-hidden max-h-[calc(85vh-120px)] focus-visible:-outline-offset-2"
      >
        {sortedResults.length > 0 ? (
          <>
            <ul className="space-y-2.5">
              {sortedResults.map((result) => (
                <li key={result.id}>
                  <ScanResultItem result={result} index={result.animIndex} />
                </li>
              ))}
            </ul>
            {locale !== 'en' && (
              <p className="mt-3 text-xs text-zinc-400">{t.scan.engineLanguageNote}</p>
            )}
          </>
        ) : inProgress ? (
          <div role="status" className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-2" aria-hidden="true">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{t.scan.inProgressTitle}</h3>
            <p className="text-zinc-400 text-sm">{t.scan.inProgressBody}</p>
          </div>
        ) : (
          <p className="text-center py-8 text-zinc-400 text-sm">
            {scanResult.status === 'FAILED' ? t.scan.errors.unexpected : t.scan.errors.detailsUnavailable}
          </p>
        )}
      </div>

      <p role="status" className="sr-only">{outcome}</p>

      {/* Modal Footer */}
      <div className="px-5 py-3 border-t border-zinc-800/50 flex items-center justify-between">
        <div className="text-xs text-zinc-400 hidden lg:flex items-center gap-3">
          {sortedResults.length > 0 && (
            <span>{t.scan.testsCompleted(sortedResults.length)}</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 ml-auto">
          {sortedResults.length > 0 && (
            <button
              type="button"
              onClick={() => downloadScanReport(scanResult)}
              className="px-3.5 py-1.5 bg-cyan-600/20 text-cyan-300 rounded-lg hover:bg-cyan-600/30 transition-all font-medium text-xs border border-cyan-500/30 cursor-pointer flex items-center gap-1.5"
            >
              <i className="ri-download-line text-sm" aria-hidden="true"></i>
              {t.scan.export}
            </button>
          )}
          <button
            type="button"
            onClick={(event) => closeEnclosingDialog(event, onClose)}
            className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-700/50 transition-all font-medium text-sm border border-zinc-700/50 cursor-pointer"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
