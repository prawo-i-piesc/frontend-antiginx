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
    <section id={SCANNER_SECTION_ID} className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto text-center mb-8">
        <h2
          id={SCANNER_HEADING_ID}
          tabIndex={-1}
          className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-wider focus:outline-none"
        >
          <i className="ri-spy-fill pr-3" aria-hidden="true"></i>
          {copy.title}
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          {copy.intro.before}
          <strong className='tracking-wider text-cyan-400'>{copy.intro.emphasis}</strong>
          {copy.intro.after}
        </p>
      </div>

      {/* Background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.32),rgba(6,182,212,0.16),transparent_60%)] rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-1/3 w-[520px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.16),transparent_50%)] rounded-full blur-3xl opacity-35 transform -rotate-6" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <UrlScanner onScan={onScan} isScanning={isScanning} />
      </div>
    </section>
  );
}
