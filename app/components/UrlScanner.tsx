"use client";

import { useId, useState } from 'react';

import { useI18n } from '@/app/i18n/I18nProvider';

/** The hero's "Try it out" link moves focus here. */
export const SCANNER_INPUT_ID = 'scanner-url';

interface UrlScannerProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

export default function UrlScanner({ onScan, isScanning }: UrlScannerProps) {
  const { t } = useI18n();
  const copy = t.landing.scanner;
  const disclaimerId = useId();
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) return;
    if (url.trim()) {
      onScan(url.trim());
    }
  };

  return (
    <div className="w-full px-4 sm:w-4/5 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <label htmlFor={SCANNER_INPUT_ID} className="sr-only">
          {copy.inputLabel}
        </label>
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3 sm:p-4 hover:border-cyan-400/50 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all duration-300 font-mono">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-cyan-400 text-sm sm:text-base select-none" aria-hidden="true">$</span>
            <span className="text-purple-400 text-sm sm:text-base select-none" aria-hidden="true">scan</span>
            {/*
              The box around the field shows its focus, so the field drops the
              global focus outline, which would draw a second frame inside the
              box (it is unlayered, so it beats focus:outline-none). Kept in
              forced-colour modes, where the box's ring is not drawn.

              Read-only rather than disabled while a scan runs, here and on the
              button below: disabling the focused control would drop keyboard
              focus to the top of the page, and the result dialog would then
              return focus there instead of to the scanner.
            */}
            <input
              id={SCANNER_INPUT_ID}
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              readOnly={isScanning}
              aria-describedby={disclaimerId}
              className="flex-1 min-w-0 px-2 py-1 bg-transparent text-white placeholder-zinc-400 focus:outline-none not-forced-colors:focus-visible:outline-none! text-sm sm:text-base caret-cyan-400"
            />

            <button
              type="submit"
              disabled={!url.trim()}
              aria-disabled={isScanning || undefined}
              className="h-9 w-9 sm:h-auto sm:w-auto sm:px-4 sm:py-2 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 rounded hover:bg-cyan-500/30 hover:border-cyan-400/60 disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shrink-0 text-cyan-400 text-xs sm:text-sm"
            >
              {/* On a phone only an icon fits beside the field; the words stay for screen readers. */}
              {isScanning ? (
                <>
                  <span
                    className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent sm:mr-2"
                    aria-hidden="true"
                  />
                  <span className="sr-only sm:not-sr-only">{copy.scanning}</span>
                </>
              ) : (
                <>
                  <i className="ri-search-line text-base text-cyan-400 sm:hidden" aria-hidden="true"></i>
                  <i className="ri-arrow-right-line text-cyan-400 mr-1 hidden sm:inline" aria-hidden="true"></i>
                  <span className="sr-only sm:not-sr-only">{copy.run}</span>
                  <span className="sr-only"> {copy.runContext}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p role="status" className="sr-only">
          {isScanning ? copy.started(url.trim()) : ''}
        </p>

        <p id={disclaimerId} className="text-center text-zinc-400 text-xs sm:text-sm mt-3 px-2">
          {copy.disclaimer}
        </p>
      </form>
    </div>
  );
}
