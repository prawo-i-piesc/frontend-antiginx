"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background copied from HeroSection, slightly darker */}
      <div className="absolute inset-0" style={{ backgroundColor: '#060607' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_150%_90%_at_50%_0%,rgba(6,140,190,0.15),transparent_90%)]"></div>

      {/* Grid Pattern (dimmed) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size-[100px_100px]"></div>

      <motion.div className="max-w-2xl w-full text-center relative z-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Logo 404 with subtle glow behind */}
        <div className="mb-8 relative">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10">
            <div className="w-56 h-56 bg-cyan-300/15 rounded-full blur-3xl" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 1, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeIn", opacity: { duration: 0.5 } }}
          >
            <Image
              src="/logo404.png"
              alt="404 Error"
              width={250}
              height={250}
              className="mx-auto relative z-10"
              priority
            />
          </motion.div>
        </div>

        {/* Text */}
        <motion.h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
          Hey!
        </motion.h1>
        <motion.p className="text-xl text-zinc-400 mb-8" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}>
          You shouldn't be here. <br /> The page you're looking for doesn't exist.
        </motion.p>

        {/* Back to home button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.18 }}>
          <Link 
            href="/"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-all duration-200 whitespace-nowrap font-semibold text-sm sm:text-base shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.35)]"
          >
            Return to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
