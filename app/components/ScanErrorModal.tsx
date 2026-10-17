"use client";

import { useId } from 'react';

import Dialog from '@/app/components/ui/Dialog';
import { useI18n } from '@/app/i18n/I18nProvider';

/**
 * Close button handler for the scan modals. Closing the native dialog first
 * lets the browser hand focus back to whatever opened it, even on a page that
 * unmounts the modal as soon as it reports the close; `onClose` then follows
 * from the dialog's close event.
 */
export function closeEnclosingDialog(event: React.MouseEvent<HTMLElement>, onClose: () => void) {
  const dialog = event.currentTarget.closest('dialog');
  if (dialog?.open) dialog.close();
  else onClose();
}

interface ScanErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The modal stays closed without a message. */
  error: string | null;
}

export default function ScanErrorModal({ isOpen, onClose, error }: ScanErrorModalProps) {
  const { t } = useI18n();
  const titleId = useId();
  const messageId = useId();

  return (
    <Dialog
      open={isOpen && Boolean(error)}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={messageId}
      closeOnBackdrop
      className="m-auto p-0 w-[calc(100%-2rem)] max-w-2xl bg-black/60 backdrop-blur-xl rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.15)] border border-cyan-500/30 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
        <h2 id={titleId} className="text-xl font-semibold text-white">{t.scan.errorTitle}</h2>
        <button
          type="button"
          onClick={(event) => closeEnclosingDialog(event, onClose)}
          aria-label={t.common.close}
          className="group w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl text-zinc-400 group-hover:text-white" aria-hidden="true"></i>
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-6">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0 border border-red-600/30">
            <i className="ri-error-warning-line text-red-400 text-lg" aria-hidden="true"></i>
          </div>
          <div className="flex-1">
            <p id={messageId} className="text-zinc-300">{error}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mt-4">
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
