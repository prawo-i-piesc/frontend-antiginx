"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

import { useI18n } from '@/app/i18n/I18nProvider';
import { SCANNER_HEADING_ID, SCANNER_SECTION_ID } from './ScannerSection';
import { FEATURES_HEADING_ID, FEATURES_SECTION_ID, jumpToSection } from './SiteHeader';
import { SCANNER_INPUT_ID } from './UrlScanner';

const STATS = ['accuracy', 'scans', 'threats', 'speed'] as const;

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

export default function HeroSection() {
  const { t } = useI18n();
  const copy = t.landing.hero;

  return (
    // Fills the first screen together with the site header above it (4.5rem, 5.5rem from lg).
    <section className="relative min-h-[calc(100vh-4.5rem)] lg:min-h-[calc(100vh-5.5rem)] flex flex-col">
      <HeroBackdrop />

      <div className="relative z-10 max-w-5xl mx-auto px-1 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center sm:pt-5 pb-8">
        <div className="mb-0">
          <motion.h1
            className="text-[2.1rem] lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-0 md:px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="text-zinc-200 ">{copy.title.lead} </span>
            <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">{copy.title.highlight}</span>
            <br className="hidden sm:block" /><span className="sm:hidden"> </span>
            <span className="bg-linear-to-r from-zinc-300 via-white to-zinc-400 bg-clip-text text-transparent">{copy.title.tail}</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-sm md:text-base lg:text-lg xl:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-5 sm:mb-6 md:mb-8 lg:mb-10 px-4 sm:px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            {copy.subtitle}
          </motion.p>
        </div>

        {/* Action buttons: links, so they also work before the page is interactive */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
        >
          <div className="group relative inline-block w-full sm:w-auto overflow-visible">
            {/* Radial light rays */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ zIndex: 0, clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}>
              <div className="absolute inset-0" style={{
                background: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 8deg, rgba(6,182,212,0.7) 8deg, rgba(6,182,212,0.15) 10deg, transparent 10deg, transparent 18deg)',
                maskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)'
              }}></div>
            </div>
            <Image
              src="/logo.png"
              alt=""
              aria-hidden="true"
              width={96}
              height={32}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 sm:h-8 w-auto opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-150 group-hover:-translate-y-12 sm:group-hover:-translate-y-16 transition-all duration-500 pointer-events-none"
              style={{ zIndex: 5 }}
            />
            <a
              href={`#${SCANNER_SECTION_ID}`}
              onClick={(event) => jumpToSection(event, SCANNER_SECTION_ID, SCANNER_INPUT_ID, SCANNER_HEADING_ID)}
              className="relative inline-block text-center w-3/4 sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-cyan-700 text-white rounded-full hover:bg-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.35)]"
              style={{ zIndex: 10 }}
            >
              {copy.tryIt}
            </a>
          </div>
          <a
            href={`#${FEATURES_SECTION_ID}`}
            onClick={(event) => jumpToSection(event, FEATURES_SECTION_ID, FEATURES_HEADING_ID)}
            className="mx-auto sm:mx-0 w-3/4 sm:w-auto text-center px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent text-white rounded-full hover:bg-white/10 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base border-2 border-white/30 hover:border-white/50"
          >
            {copy.learnMore}
          </a>
        </motion.div>

        {/* Trust Indicators; the value is shown above its label */}
        <motion.dl
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          {STATS.map((stat) => (
            <div key={stat} className="flex flex-col-reverse text-center">
              <dt className="text-zinc-400 text-xs">{copy.stats[stat].label}</dt>
              <dd className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">{copy.stats[stat].value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
