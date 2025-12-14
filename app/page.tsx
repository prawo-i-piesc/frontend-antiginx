"use client";

import HeroSection from './components/HeroSection';
import ScannerSection from './components/ScannerSection';
import ScanResultModal from './components/ScanResultModal';
import ScanErrorModal from './components/ScanErrorModal';
import Footer from './components/Footer';
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
  } = useScanModal();

  // Debug helpers (only in development)
  useDebugModals({ setScanResult, setScanError, setIsModalOpen });

  const scrollToScanner = () => {
    const el = document.getElementById('scanner');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#09090b' }}>
      {/* Hero Section */}
      <HeroSection 
        onScrollToScanner={scrollToScanner}
        onScrollToFeatures={scrollToFeatures}
      />

      {/* Scanner Section */}
      <ScannerSection 
        onScan={handleScan}
        isScanning={isScanning}
      />

      {/* Modals */}
      {isModalOpen && scanError && (
        <ScanErrorModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          error={scanError}
        />
      )}

      {isModalOpen && scanResult && !scanError && (
        <ScanResultModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          scanResult={scanResult}
        />
      )}

   

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
                  Practical security<br />
                  <span className="bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                    you can rely on
                  </span>
                </h2>
                <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                  We focus on sensible, well-tested security practices — secure connections,
                  careful handling of data, and regular checks to keep things up to date.
                </p>

                <div className="space-y-5">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-lock-line text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">Encrypted connections</h4>
                      <p className="text-zinc-400 text-sm">All traffic is encrypted in transit (HTTPS/TLS).</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-refresh-line text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">Regular updates</h4>
                      <p className="text-zinc-400 text-sm">We run routine security checks and apply updates promptly.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-database-line text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">Minimal data retention</h4>
                      <p className="text-zinc-400 text-sm">We keep only what's necessary and avoid storing unnecessary user data.</p>
                    </div>
                  </div>
                </div>
            </div>

            <div className="relative">
              <div className="relative backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50" style={{ backgroundColor: 'rgba(9, 9, 11, 0.5)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">TLS</div>
                      <div className="text-zinc-400 text-xs">Encrypted connections</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">99%+</div>
                      <div className="text-zinc-400 text-xs">Designed for reliability</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">24/7</div>
                      <div className="text-zinc-400 text-xs">Monitoring</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">Checks</div>
                      <div className="text-zinc-400 text-xs">Regular security reviews</div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

         {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Background glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-[radial-gradient(closest-side,rgba(6,182,212,0.4),rgba(6,182,212,0.15),transparent_50%)] rounded-full blur-4xl opacity-30"
          />
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.3),transparent_50%)] rounded-full blur-3xl opacity-25" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
 
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Comprehensive <br />security protection
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              We use the latest AI and machine learning technologies to detect 
              malware, phishing, suspicious content and other security threats
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full" style={{ backgroundColor: 'rgba(9, 9, 11, 0.5)' }}>
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <i className="ri-search-eye-line text-white text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-threat detection</h3>
                <p className="text-zinc-400 leading-relaxed mb-5 text-sm">
                  Comprehensive scanning for malware, phishing, suspicious scripts, 
                  and other security threats in real-time.
                </p>
                <ul className="space-y-2 text-zinc-500 text-sm">
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-400 mr-2 text-xs"></i>
                    Malware and virus detection
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-400 mr-2 text-xs"></i>
                    Phishing site identification
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-400 mr-2 text-xs"></i>
                    Suspicious script analysis
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full" style={{ backgroundColor: 'rgba(9, 9, 11, 0.8)' }}>
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <i className="ri-database-2-line text-white text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Global threat intelligence</h3>
                <p className="text-zinc-400 leading-relaxed mb-5 text-sm">
                  Constantly updated database containing thousands of known malicious 
                  sites, infected domains and security threats from around the world.
                </p>
                <ul className="space-y-2 text-zinc-500 text-sm">
                  <li className="flex items-center">
                    <i className="ri-check-line text-blue-400 mr-2 text-xs"></i>
                    Real-time threat feeds
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-blue-400 mr-2 text-xs"></i>
                    Security vendor collaboration
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-blue-400 mr-2 text-xs"></i>
                    Community threat sharing
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full" style={{ backgroundColor: 'rgba(9, 9, 11, 0.8)' }}>
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <i className="ri-brain-line text-white text-lg"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI & Machine Learning</h3>
                <p className="text-zinc-400 leading-relaxed mb-5 text-sm">
                  Artificial intelligence trained on millions of samples detecting 
                  new, previously unknown security threats and attack patterns.
                </p>
                <ul className="space-y-2 text-zinc-500 text-sm">
                  <li className="flex items-center">
                    <i className="ri-check-line text-purple-400 mr-2 text-xs"></i>
                    Advanced threat detection
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-purple-400 mr-2 text-xs"></i>
                    Behavioral analysis
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-purple-400 mr-2 text-xs"></i>
                    Zero-day threat detection
                  </li>
                </ul>
              </div>
            </div>
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
            Ready for complete protection?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of companies that already protect themselves from security threats 
            with AntiGinx
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base ">
              Start for free
            </button>
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent text-white rounded-full hover:bg-white/10 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base border-2 border-white/30 hover:border-white/50">
              Talk to an expert
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
