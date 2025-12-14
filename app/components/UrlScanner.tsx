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
        <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-sm sm:text-lg"
              disabled={isScanning}
              aria-label="URL to scan"
            />

            <button
              type="submit"
              disabled={isScanning || !url.trim()}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-linear-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shrink-0"
              aria-label="Start scan"
              title="Scan"
            >
              {isScanning ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
              ) : (
                <i className="ri-search-line text-white text-base sm:text-lg" aria-hidden="true"></i>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
