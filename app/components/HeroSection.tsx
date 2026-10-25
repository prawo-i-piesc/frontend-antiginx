"use client";

import { motion } from 'framer-motion';

import { useI18n } from '@/app/i18n/I18nProvider';
import { PRIMARY_BUTTON } from './ui/buttonStyles';
import { SCANNER_HEADING_ID, SCANNER_SECTION_ID } from './ScannerSection';
import { HOW_HEADING_ID, HOW_SECTION_ID } from './HowItWorksSection';
import { jumpToSection } from './SiteHeader';
import { SCANNER_INPUT_ID } from './UrlScanner';
import XRayPreview from './XRayPreview';

/** Left offsets, delays and durations of the floating particles. */
const PARTICLES = [
  [5, -5, 15], [15, -8, 18], [25, -3, 16], [35, -12, 20], [45, -7, 14],
  [55, -10, 18], [65, -4, 15], [75, -9, 17], [85, -6, 19], [95, -11, 18],
  [10, -2, 16], [20, -13, 17], [30, -8, 19], [40, -5, 14], [50, -10, 18],
  [60, -7, 15], [70, -3, 17], [80, -14, 20], [90, -6, 18], [8, -9, 16],
] as const;

/**
 * Backdrop of the landing and pricing heroes. It reaches up behind the site
 * header, which sits before <main> and so outside the hero; the negative top
 * matches the header's height.
 */
export function HeroBackdrop({ gridSize = 'bg-size-[100px_100px]' }: { gridSize?: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -top-18 lg:-top-22">
      <div className="absolute inset-0" style={{ backgroundColor: '#09090b' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,140,190,0.13),transparent_90%)]"></div>

      {/* Grid Pattern */}
      <div className={`absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] ${gridSize}`}></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {PARTICLES.map(([left, delay, duration]) => (
          <div
            key={left}
            className="absolute bottom-0 w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up"
            style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

const buttonClass =
  'inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 rounded-full border-2 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-200';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const },
});

/** `isScanning` sets the illustration's beam sweeping while a scan below runs. */
export default function HeroSection({ isScanning }: { isScanning: boolean }) {
  const { t } = useI18n();
  const copy = t.landing.hero;

  return (
    // From lg, fills the first screen together with the site header above it (5.5rem), so
    // the scanner below starts under the fold. On a phone it is as tall as its content, so
    // the illustration still shows on the first screen.
    <section className="relative lg:min-h-[calc(100vh-5.5rem)] flex flex-col">
      <HeroBackdrop />

      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-12 sm:pt-10 lg:py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-10">
        <div className="min-w-0 max-w-xl">
          <motion.h1
            className="text-[2.3rem] leading-[1.1] sm:leading-[1.05] sm:text-6xl lg:text-[3.6rem] xl:text-[4rem] font-bold tracking-tight text-zinc-100"
            {...fadeUp(0)}
          >
            {copy.title.lead}{' '}
            <span className="text-cyan-400">
              {copy.title.highlight}
            </span>
          </motion.h1>

          <motion.p className="mt-5 sm:mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed" {...fadeUp(0.15)}>
            {copy.subtitle}
          </motion.p>

          {/* Links, so they also work before the page is interactive */}
          <motion.div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-7" {...fadeUp(0.3)}>
            <a
              href={`#${SCANNER_SECTION_ID}`}
              onClick={(event) => jumpToSection(event, SCANNER_SECTION_ID, SCANNER_INPUT_ID, SCANNER_HEADING_ID)}
              className={`${buttonClass} ${PRIMARY_BUTTON}`}
            >
              {copy.tryIt}
            </a>
            <a
              href={`#${HOW_SECTION_ID}`}
              onClick={(event) => jumpToSection(event, HOW_SECTION_ID, HOW_HEADING_ID)}
              className="group inline-flex items-center gap-2 font-semibold text-sm sm:text-base text-zinc-300 hover:text-cyan-300 transition-colors duration-200"
            >
              {copy.learnMore}
              <i
                className="ri-arrow-down-line transition-transform duration-200 group-hover:translate-y-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              ></i>
            </a>
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.2)}>
          <XRayPreview isScanning={isScanning} />
        </motion.div>
      </div>

    </section>
  );
}
