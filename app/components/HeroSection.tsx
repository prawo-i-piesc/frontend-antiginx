"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onScrollToScanner: () => void;
  onScrollToFeatures: () => void;
}

export default function HeroSection({ onScrollToScanner, onScrollToFeatures }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col pt-2 lg:pt-6">
      {/* Animated Background */}
      <div className="absolute inset-0" style={{ backgroundColor: '#09090b' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,140,190,0.13),transparent_90%)]"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size-[100px_100px]"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-[5%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-5s', animationDuration: '15s'}}></div>
        <div className="absolute bottom-0 left-[15%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-8s', animationDuration: '18s'}}></div>
        <div className="absolute bottom-0 left-[25%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-3s', animationDuration: '16s'}}></div>
        <div className="absolute bottom-0 left-[35%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-12s', animationDuration: '20s'}}></div>
        <div className="absolute bottom-0 left-[45%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-7s', animationDuration: '14s'}}></div>
        <div className="absolute bottom-0 left-[55%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-10s', animationDuration: '18s'}}></div>
        <div className="absolute bottom-0 left-[65%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-4s', animationDuration: '15s'}}></div>
        <div className="absolute bottom-0 left-[75%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-9s', animationDuration: '17s'}}></div>
        <div className="absolute bottom-0 left-[85%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '19s'}}></div>
        <div className="absolute bottom-0 left-[95%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-11s', animationDuration: '18s'}}></div>
        <div className="absolute bottom-0 left-[10%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-2s', animationDuration: '16s'}}></div>
        <div className="absolute bottom-0 left-[20%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-13s', animationDuration: '17s'}}></div>
        <div className="absolute bottom-0 left-[30%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-8s', animationDuration: '19s'}}></div>
        <div className="absolute bottom-0 left-[40%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-5s', animationDuration: '14s'}}></div>
        <div className="absolute bottom-0 left-[50%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-10s', animationDuration: '18s'}}></div>
        <div className="absolute bottom-0 left-[60%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-7s', animationDuration: '15s'}}></div>
        <div className="absolute bottom-0 left-[70%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-3s', animationDuration: '17s'}}></div>
        <div className="absolute bottom-0 left-[80%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-14s', animationDuration: '20s'}}></div>
        <div className="absolute bottom-0 left-[90%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-6s', animationDuration: '18s'}}></div>
        <div className="absolute bottom-0 left-[8%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-float-up" style={{animationDelay: '-9s', animationDuration: '16s'}}></div>
      </div>

      {/* Header */}
      <motion.header 
        className="top-0 z-50 relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-6xl mt-2 sm:mt-0 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logotype.png"
                  alt="Antiginx Logo"
                  width={100}
                  height={40}
                  className="h-8 sm:h-10  w-auto hover:scale-101 transition-transform duration-200"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-5">
              <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <a href="#features" className="text-shadow-white hover:text-cyan-300 transition-colors font-normal text-sm duration-300">Features</a>
                <a href="https://prawo-i-piesc.github.io/engine-antiginx/" target="_blank" rel="noopener noreferrer" className="text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm">Documentation</a>
                <a href="/pricing" rel="noopener noreferrer" className="text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm">Pricing</a>
              </nav>
              <Link href="/login" className="px-4 sm:px-5 py-1.5 sm:py-2 inline-block bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 whitespace-nowrap cursor-pointer font-medium text-l sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-sm">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-5xl mx-auto px-1 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center sm:pt-5 pb-8">
        <div className="mb-0">
          <motion.h1 
            className="text-[2.1rem] lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-0 md:px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="text-zinc-200 ">Scan </span>
            <span className="bg-linear-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent">websites security</span>
            <br className="hidden sm:block" /><span className="sm:hidden"> </span>
            <span className="bg-linear-to-r from-zinc-300 via-white to-zinc-400 bg-clip-text text-transparent">before you visit</span>
          </motion.h1>

          <motion.p 
            className="text-l sm:text-sm md:text-base lg:text-lg xl:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-5 sm:mb-6 md:mb-8 lg:mb-10 px-4 sm:px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            The most advanced website security scanner powered by artificial intelligence 
            and comprehensive threat analysis algorithms.
          </motion.p>
        </div>

        {/* Action buttons */}
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
              alt="Logo"
              width={96}
              height={32}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 sm:h-8 w-auto opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-150 group-hover:-translate-y-12 sm:group-hover:-translate-y-16 transition-all duration-500 pointer-events-none"
              style={{ zIndex: 5 }}
            />
            <button onClick={onScrollToScanner} className="relative w-3/4 sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.35)]" style={{ zIndex: 10 }}>
              Try it out for free!
            </button>
          </div>
          <button onClick={onScrollToFeatures} className="mx-auto sm:mx-0 w-3/4 sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent text-white rounded-full hover:bg-white/10 transition-all duration-200 whitespace-nowrap cursor-pointer font-semibold text-sm sm:text-base border-2 border-white/30 hover:border-white/50">
            Learn more
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">99.8%</div>
            <div className="text-zinc-400 text-xs">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">30.0+</div>
            <div className="text-zinc-400 text-xs">Scans</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">150+</div>
            <div className="text-zinc-400 text-xs">Threats blocked</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">&lt;2s</div>
            <div className="text-zinc-400 text-xs">Scan time</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
