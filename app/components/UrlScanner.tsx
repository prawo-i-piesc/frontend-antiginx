"use client";

import { useState } from 'react';

interface UrlScannerProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

export default function UrlScanner({ onScan, isScanning }: UrlScannerProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScan(url.trim());
    }
  };

  return (
    <div className="w-full px-4 sm:w-4/5 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3 sm:p-4 hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] font-mono">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-cyan-400 text-sm sm:text-base select-none">$</span>
            <span className="text-purple-400 text-sm sm:text-base select-none">scan</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-2 py-1 bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm sm:text-base caret-cyan-400"
              disabled={isScanning}
              aria-label="URL to scan"
            />

            <button
              type="submit"
              disabled={isScanning || !url.trim()}
              className="px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 rounded hover:bg-cyan-500/30 hover:border-cyan-400/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shrink-0 text-cyan-400 text-xs sm:text-sm"
              aria-label="Start scan"
              title="Scan"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-cyan-400 border-t-transparent mr-2" />
                  <span>SCANNING</span>
                </>
              ) : (
                <>
                  <i className="ri-arrow-right-line text-cyan-400 mr-1" aria-hidden="true"></i>
                  <span>RUN</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <p className="text-center text-zinc-500 text-xs sm:text-sm mt-3 px-2">
          By scanning, you confirm that you have the right to analyze this domain
        </p>
      </form>
    </div>
  );
}
