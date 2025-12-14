import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  onScrollToScanner: () => void;
  onScrollToFeatures: () => void;
}

export default function HeroSection({ onScrollToScanner, onScrollToFeatures }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col pt-2 lg:pt-6">
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
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="Antiginx Logo"
                  width={96}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-white">Antiginx</span>
              </Link>
            </div>
            <div className="flex items-center space-x-5">
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Features</a>
                <a href="https://prawo-i-piesc.github.io/engine-antiginx/" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white transition-colors font-semibold text-sm">Documentation</a>
              </nav>
              <Link href="/login" className="px-5 py-2 inline-block bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center pt-5">
        <div className="mb-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Scan <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">website security</span>
            <br className="hidden sm:block" /><span className="sm:hidden"> </span>before you visit
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 lg:mb-10 px-2">
            The most advanced website security scanner powered by artificial intelligence 
            and comprehensive threat analysis algorithms.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 px-4">
          <button onClick={onScrollToScanner} className="px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 bg-linear-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold shadow-lg hover:shadow-xl border border-cyan-500/30 text-sm sm:text-base">
            Try it out for free!
          </button>
          <button onClick={onScrollToFeatures} className="px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-700/50 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base border border-zinc-600/50">
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
  );
}
