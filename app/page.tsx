"use client";

import { useEffect } from 'react';

import AccountSection from './components/AccountSection';
import ChecksSection from './components/ChecksSection';
import HeroSection from './components/HeroSection';
import HowItWorksSection, { HOW_HEADING_ID, HOW_SECTION_ID } from './components/HowItWorksSection';
import ScannerSection, { SCANNER_HEADING_ID, SCANNER_SECTION_ID } from './components/ScannerSection';
import ScanResultModal from './components/ScanResultModal';
import ScanErrorModal from './components/ScanErrorModal';
import SiteHeader, { FEATURES_HEADING_ID, FEATURES_SECTION_ID } from './components/SiteHeader';
import Footer from './components/Footer';
import { MAIN_CONTENT_ID } from './components/ui/SkipLink';
import { useScanModal } from './hooks/useScanModal';
import { useDebugModals } from './hooks/useDebugModals';

export default function HomePage() {
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

  // Arriving at /#features, /#how-it-works or /#scanner from another page, the router scrolls
  // to the section but leaves focus at the top of the document.
  useEffect(() => {
    const headingId = {
      [`#${FEATURES_SECTION_ID}`]: FEATURES_HEADING_ID,
      [`#${HOW_SECTION_ID}`]: HOW_HEADING_ID,
      [`#${SCANNER_SECTION_ID}`]: SCANNER_HEADING_ID,
    }[window.location.hash];
    if (headingId) document.getElementById(headingId)?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="marketing-surface min-h-screen overflow-x-clip text-white" style={{ backgroundColor: '#09090b' }}>
      <SiteHeader />

      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="focus:outline-none">
        <HeroSection isScanning={isScanning} />

        <ScannerSection
          onScan={handleScan}
          isScanning={isScanning}
        />

        <ChecksSection />

        <HowItWorksSection />

        <AccountSection />
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
