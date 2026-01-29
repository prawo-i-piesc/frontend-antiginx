"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';

export default function SiteHeader() {
  const auth = useAuth();

  return (
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
                className="h-8 sm:h-10 w-auto hover:scale-101 transition-transform duration-200"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-5">
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <a href="#features" className="text-shadow-white hover:text-cyan-300 transition-colors font-normal text-sm duration-300">Features</a>
              <a href="https://prawo-i-piesc.github.io/engine-antiginx/" target="_blank" rel="noopener noreferrer" className="text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm">Documentation</a>
              <a href="/pricing" rel="noopener noreferrer" className="text-shadow-white hover:text-cyan-300 transition-colors duration-300 font-normal text-sm">Pricing</a>
            </nav>
            <Link
              href={auth?.initialized && auth?.token ? '/dashboard' : '/login'}
              className="px-4 sm:px-5 py-1.5 sm:py-2 inline-block bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-200 whitespace-nowrap cursor-pointer font-medium text-md sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-sm"
            >
              {auth?.initialized && auth?.token ? 'Dashboard' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
