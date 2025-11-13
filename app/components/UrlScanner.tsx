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
    <div className="w-4/5 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-2 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-lg"
              disabled={isScanning}
              aria-label="URL to scan"
            />

            <button
              type="submit"
              disabled={isScanning || !url.trim()}
              className="w-12 h-12 flex items-center justify-center bg-linear-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              aria-label="Start scan"
              title="Scan"
            >
              {isScanning ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <i className="ri-search-line text-white text-lg" aria-hidden="true"></i>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
