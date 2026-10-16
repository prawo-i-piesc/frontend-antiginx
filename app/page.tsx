"use client";

import { useEffect } from 'react';
import Link from 'next/link';

import HeroSection from './components/HeroSection';
import ScannerSection, { SCANNER_HEADING_ID, SCANNER_SECTION_ID } from './components/ScannerSection';
import ScanResultModal from './components/ScanResultModal';
import ScanErrorModal from './components/ScanErrorModal';
import SiteHeader, { FEATURES_HEADING_ID, FEATURES_SECTION_ID } from './components/SiteHeader';
import Footer from './components/Footer';
import { MAIN_CONTENT_ID } from './components/ui/SkipLink';
import { useScanModal } from './hooks/useScanModal';
import { useDebugModals } from './hooks/useDebugModals';
import { useI18n } from './i18n/I18nProvider';

const SECURITY_POINTS = [
  { key: 'encryption', icon: 'ri-lock-line' },
  { key: 'updates', icon: 'ri-refresh-line' },
  { key: 'retention', icon: 'ri-database-line' },
] as const;

const SECURITY_HIGHLIGHTS = ['tls', 'reliability', 'monitoring', 'reviews'] as const;

const FEATURE_CARDS = [
  {
    key: 'detection',
    icon: 'ri-search-eye-line',
    glow: 'from-cyan-500/10',
    badge: 'from-green-500 to-emerald-600',
    check: 'text-green-400',
    surface: 'rgba(9, 9, 11, 0.5)',
  },
  {
    key: 'intelligence',
    icon: 'ri-database-2-line',
    glow: 'from-blue-500/10',
    badge: 'from-blue-500 to-blue-600',
    check: 'text-blue-400',
    surface: 'rgba(9, 9, 11, 0.8)',
  },
  {
    key: 'ai',
    icon: 'ri-brain-line',
    glow: 'from-purple-500/10',
    badge: 'from-purple-500 to-purple-600',
    check: 'text-purple-400',
    surface: 'rgba(9, 9, 11, 0.8)',
  },
] as const;

export default function HomePage() {
  const { t } = useI18n();
  const copy = t.landing;
  const {
    scanResult,
    isScanning,
    scanError,
    isModalOpen,
    handleScan,
    closeModal,
    setScanResult,
    setScanError,
    setIsModalOpen
  } = useScanModal({ mode: "free" });

  // Debug helpers (only in development)
  useDebugModals({ setScanResult, setScanError, setIsModalOpen });

  // Arriving at /#features or /#scanner from another page, the router scrolls
  // to the section but leaves focus at the top of the document.
  useEffect(() => {
    const headingId = {
      [`#${FEATURES_SECTION_ID}`]: FEATURES_HEADING_ID,
      [`#${SCANNER_SECTION_ID}`]: SCANNER_HEADING_ID,
    }[window.location.hash];
    if (headingId) document.getElementById(headingId)?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="marketing-surface min-h-screen overflow-x-clip text-white" style={{ backgroundColor: '#09090b' }}>
      <SiteHeader />

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus:outline-none">
        <HeroSection />

        <ScannerSection
          onScan={handleScan}
          isScanning={isScanning}
        />

        {/* Security Section */}
        <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 relative">
          {/* Background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/3 w-[800px] h-[800px] bg-[radial-gradient(closest-side,rgba(16,185,129,0.35),rgba(6,182,212,0.2),transparent_50%)] rounded-full blur-4xl opacity-25" />
            <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.3),transparent_50%)] rounded-full blur-3xl opacity-30" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  {copy.security.title.lead}<br />
                  <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                    {copy.security.title.highlight}
                  </span>
                </h2>
                <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                  {copy.security.body}
                </p>

                <div className="space-y-5">
                  {SECURITY_POINTS.map(({ key, icon }) => (
                    <div key={key} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                        <i className={`${icon} text-green-400 text-sm`} aria-hidden="true"></i>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white mb-1">{copy.security.points[key].title}</h3>
                        <p className="text-zinc-400 text-sm">{copy.security.points[key].body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="relative backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50" style={{ backgroundColor: 'rgba(9, 9, 11, 0.5)' }}>
                  <ul className="grid grid-cols-2 gap-4">
                    {SECURITY_HIGHLIGHTS.map((key) => (
                      <li key={key} className="text-center p-4 bg-zinc-800/50 rounded-xl">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">{copy.security.highlights[key].value}</div>
                        <div className="text-zinc-400 text-xs">{copy.security.highlights[key].label}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id={FEATURES_SECTION_ID} className="py-20 px-4 sm:px-6 lg:px-8 relative">
          {/* Background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-[radial-gradient(closest-side,rgba(6,182,212,0.4),rgba(6,182,212,0.15),transparent_50%)] rounded-full blur-4xl opacity-30"
            />
            <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.3),transparent_50%)] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2
                id={FEATURES_HEADING_ID}
                tabIndex={-1}
                className="text-3xl sm:text-4xl font-bold text-white mb-5 focus:outline-none"
              >
                {copy.features.title.lead} <br />{copy.features.title.tail}
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                {copy.features.body}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {FEATURE_CARDS.map((card) => {
                const feature = copy.features.cards[card.key];
                return (
                  <div key={card.key} className="group relative">
                    <div className={`absolute inset-0 bg-linear-to-r ${card.glow} to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`}></div>
                    <div className="relative backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full" style={{ backgroundColor: card.surface }}>
                      <div className={`w-12 h-12 bg-linear-to-br ${card.badge} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
                        <i className={`${card.icon} text-white text-lg`} aria-hidden="true"></i>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-zinc-400 leading-relaxed mb-5 text-sm">
                        {feature.body}
                      </p>
                      <ul className="space-y-2 text-zinc-400 text-sm">
                        {feature.points.map((point) => (
                          <li key={point} className="flex items-center">
                            <i className={`ri-check-line ${card.check} mr-2 text-xs`} aria-hidden="true"></i>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          {/* Background glows */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.4),rgba(6,182,212,0.2),transparent_50%)] rounded-full blur-4xl opacity-30" />
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6">
              {copy.cta.title}
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
              {copy.cta.body}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/register"
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-center bg-cyan-700 text-white rounded-full hover:bg-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base"
              >
                {copy.cta.start}
              </Link>
              {/* No destination yet: there is no contact page or address to send this to. */}
              <button type="button" className="px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent text-white rounded-full hover:bg-white/10 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base border-2 border-white/30 hover:border-white/50">
                {copy.cta.expert}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/*
        Kept mounted and opened through `isOpen`, so closing goes through the
        native dialog, which hands focus back to the scanner. The result modal
        comes first: when a running scan fails, it has to close (returning
        focus) before the error modal opens and records where focus goes back.
      */}
      {scanResult && (
        <ScanResultModal
          isOpen={isModalOpen && !scanError}
          onClose={closeModal}
          scanResult={scanResult}
        />
      )}

      <ScanErrorModal
        isOpen={isModalOpen && Boolean(scanError)}
        onClose={closeModal}
        error={scanError}
      />
    </div>
  );
}
