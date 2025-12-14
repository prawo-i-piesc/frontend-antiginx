"use client";

import { motion } from 'framer-motion';

interface ScanResult {
  id: number;
  test_name: string;
  message: string;
  severity: string;
  passed: boolean;
}

interface ScanResultItemProps {
  result: ScanResult;
  index: number;
}

export default function ScanResultItem({ result, index }: ScanResultItemProps) {
  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'border-red-600/50 bg-red-900/20';
    if (s === 'high') return 'border-red-500/40 bg-red-900/15';
    if (s === 'medium') return 'border-orange-500/40 bg-orange-900/15';
    if (s === 'low') return 'border-yellow-500/40 bg-yellow-900/15';
    return 'border-blue-500/40 bg-blue-900/15';
  };

  const getSeverityTextColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'text-red-400';
    if (s === 'high') return 'text-red-400';
    if (s === 'medium') return 'text-orange-400';
    if (s === 'low') return 'text-yellow-400';
    return 'text-blue-400';
  };

  const isCritical = result.severity.toLowerCase() === 'critical';

  const cleanMessage = result.message.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  const formattedMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={`rounded-lg p-3 border relative overflow-hidden ${
        result.passed ? 'bg-green-900/10 border-green-600/20' : getSeverityColor(result.severity)
      }`}
    >
      {/* Fire effect for critical */}
      {isCritical && !result.passed && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-t from-red-600/0 via-red-500/10 to-orange-500/20 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute left-[10%] text-2xl" style={{ animation: 'fire-fall 3s infinite', animationDelay: '0s' }}>🔥</div>
          <div className="absolute left-[30%] text-xl" style={{ animation: 'fire-fall 3.5s infinite', animationDelay: '0.5s' }}>🔥</div>
          <div className="absolute left-[50%] text-3xl" style={{ animation: 'fire-fall 2.8s infinite', animationDelay: '1s' }}>🔥</div>
          <div className="absolute left-[70%] text-xl" style={{ animation: 'fire-fall 3.2s infinite', animationDelay: '1.5s' }}>🔥</div>
          <div className="absolute left-[85%] text-2xl" style={{ animation: 'fire-fall 3s infinite', animationDelay: '2s' }}>🔥</div>
        </div>
      )}
      
      <div className="flex items-start gap-2.5 relative z-10">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          result.passed ? 'bg-green-600/30' : 'bg-zinc-800/50'
        }`}>
          <i className={`${
            result.passed ? 'ri-checkbox-circle-line text-green-400' : 'ri-close-circle-line text-red-400'
          } text-base`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-white text-sm">{result.test_name}</h4>
            <span className={`text-xs font-medium shrink-0 ${getSeverityTextColor(result.severity)}`}>
              {result.severity}
            </span>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            {formattedMessage}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
