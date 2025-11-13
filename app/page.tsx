"use client";

import { useState } from 'react';
import Image from 'next/image';
import SecurityReport from './components/SecurityReport';
import UrlScanner from './components/UrlScanner';
import Footer from './components/Footer';

export default function HomePage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    // Simulation of scanning
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResult = {
      url,
      threatLevel: Math.floor(Math.random() * 100),
      isPhishing: Math.random() > 0.7,
      scanTime: new Date().toISOString(),
      details: {
        domainAge: Math.floor(Math.random() * 365) + 1,
        sslCertificate: Math.random() > 0.3,
        suspiciousPatterns: Math.floor(Math.random() * 5),
        reputation: Math.random() > 0.5 ? 'good' : 'suspicious',
      },
    };

    setScanResult(mockResult);
    setIsScanning(false);
  };

  const scrollToScanner = () => {
    const el = document.getElementById('scanner');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero Section with Navigation */}
      <section className="relative min-h-screen flex flex-col  pt-2 lg:pt-6">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size-[40px_40px]"></div>

        {/* Floating Elements */}
        <div className="absolute top-16 left-8 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-cyan-600 rounded-full animate-pulse"></div>

        {/* Header */}
        <header className="top-0 z-50 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Antiginx Logo"
                  width={96}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-white">Antiginx</span>
              </div>
              <div className="flex items-center space-x-5">
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="#features" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Features</a>
                  <a href="#pricing" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Pricing</a>
                  <a href="#api" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">API</a>
                  <a href="#documentation" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Documentation</a>
                </nav>
                <button className="px-5 py-2 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm">
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center pt-5">
          <div className="mb-0">
            <h1 className="text-5xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Scan <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">website security</span>
              <br />before you visit
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
              The most advanced website security scanner powered by artificial intelligence 
              and comprehensive threat analysis algorithms.
            </p>
            </div>

          {/* Action buttons in Hero */}
          <div className="flex justify-center gap-6 lg:gap-10 mb-8">
            <button onClick={scrollToScanner} className="px-3 lg:px-5 py-1 lg:py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm">
              Try it out for free!
            </button>
            <button onClick={scrollToFeatures} className="px-3 lg:px-5 py-2 lg:py-3  bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-700/50 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm border border-zinc-700/40">
              Learn more
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">99.8%</div>
              <div className="text-zinc-400 text-xs">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">30.0+</div>
              <div className="text-zinc-400 text-xs">Scans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">150+</div>
              <div className="text-zinc-400 text-xs">Threats blocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">&lt;2s</div>
              <div className="text-zinc-400 text-xs">Scan time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Scanner Section */}
  <section id="scanner" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-wider">
                          <i className="ri-spy-fill pr-3"></i>
            Try it out!
            </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Check a website for potential threats before visiting  <strong className='tracking-wider text-cyan-400'>for free</strong>.</p>
        </div>

        {/* big glows placed in section background and clipped by section bounds */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/3 w-[900px] h-[900px] bg-[radial-gradient(closest-side,rgba(6,182,212,0.65),rgba(6,182,212,0.28),transparent_50%)] rounded-full blur-4xl opacity-40 transform rotate-6 animate-pulse"
            style={{ animationDuration: '7s' }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.32),rgba(6,182,212,0.16),transparent_60%)] rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/3 w-[520px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.36),transparent_50%)] rounded-full blur-3xl opacity-35 transform -rotate-6" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <UrlScanner onScan={handleScan} isScanning={isScanning} />
        </div>
      </section>

      {/* Results Section */}
      {scanResult && (
        <section className="py-4 px-4 sm:px-6 lg:px-8 bg-zinc-950/50">
          <div className="max-w-5xl mx-auto">
            <SecurityReport result={scanResult} />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
              <i className="ri-cpu-line text-cyan-400 mr-2 text-sm"></i>
              <span className="text-cyan-300 text-xs font-medium">Advanced technologies</span>
            </div>
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
              <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full">
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
              <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full">
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
              <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/30 transition-all duration-300 h-full">
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

      {/* Security Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-linear-to-r from-cyan-950/20 to-zinc-950/20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                  <i className="ri-shield-star-line text-cyan-400 mr-2 text-sm"></i>
                  <span className="text-cyan-300 text-xs font-medium">Security first</span>
                </div>
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
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500/20 to-transparent rounded-2xl blur-3xl"></div>
              <div className="relative bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50">
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-cyan-950/30 to-zinc-950/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready for complete protection?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of companies that already protect themselves from security threats 
            with AntiGinx
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-bold text-base shadow-lg hover:shadow-xl border border-cyan-500/30">
              Start for free
            </button>
            <button className="px-6 py-3 bg-zinc-800/50 text-zinc-300 rounded-xl hover:bg-zinc-700/50 transition-all duration-200 whitespace-nowrap cursor-pointer font-bold text-base border border-zinc-600/50 hover:border-zinc-500/50">
              Talk to an expert
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
