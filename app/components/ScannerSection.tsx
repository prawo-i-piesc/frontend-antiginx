"use client";

import { useI18n } from '@/app/i18n/I18nProvider';
import UrlScanner from './UrlScanner';

export const SCANNER_SECTION_ID = 'scanner';
/** Focus lands here when the scanner field cannot take it. */
export const SCANNER_HEADING_ID = 'scanner-heading';

interface ScannerSectionProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

export default function ScannerSection({ onScan, isScanning }: ScannerSectionProps) {
  const { t } = useI18n();
  const copy = t.landing.scanner;

  return (
    <section id={SCANNER_SECTION_ID} className="pt-9 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto text-center mb-8">
        <h2
          id={SCANNER_HEADING_ID}
          tabIndex={-1}
          className="text-[1.75rem] sm:text-4xl font-bold text-white mb-2 focus:outline-none"
        >
          <i className="ri-spy-fill pr-3" aria-hidden="true"></i>
          {copy.title}
        </h2>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
          {copy.intro.before}
          <strong className="text-cyan-400">{copy.intro.emphasis}</strong>
          {copy.intro.after}
          <br />
          {copy.intro.result}
        </p>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <UrlScanner onScan={onScan} isScanning={isScanning} />
      </div>
    </section>
  );
}
