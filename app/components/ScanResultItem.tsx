"use client";

import { motion } from 'framer-motion';
import FireCanvas from './FireCanvas';

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
    if (s === 'high') return 'border-orange-600/50 bg-orange-900/20';
    if (s === 'medium') return 'border-yellow-600/50 bg-yellow-900/20';
    if (s === 'low') return 'border-yellow-700/40 bg-yellow-950/15';
    return 'border-zinc-600/50 bg-zinc-900/20';
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.2,
        delay: index * 0.2
      }}
      className={`rounded-lg p-3 border relative overflow-hidden ${
        result.passed ? 'bg-green-900/10 border-green-600/20' : getSeverityColor(result.severity)
      } ${isCritical && !result.passed ? 'shadow-[0_0_20px_rgba(251,146,60,0.2),0_0_40px_rgba(234,88,12,0.1)] border-orange-500/40' : ''}`}
    >
      {/* Fire effect for critical */}
      {isCritical && !result.passed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FireCanvas />
        </div>
      )}
      
      <div className="flex items-center gap-3 relative z-10">
        {/* Status Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          result.passed ? 'bg-green-600/25 border border-green-500/30' : 'bg-red-600/20 border border-red-500/30'
        }`}>
          <i className={`${
            result.passed ? 'ri-checkbox-circle-fill text-green-400' : 'ri-close-circle-fill text-red-400'
          } text-base`}></i>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h4 className="font-semibold text-white text-sm leading-tight">{result.test_name}</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 ${
              result.severity.toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-400' :
              result.severity.toLowerCase() === 'high' ? 'bg-orange-500/20 text-orange-400' :
              result.severity.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              result.severity.toLowerCase() === 'low' ? 'bg-yellow-600/15 text-yellow-500' :
              'bg-zinc-500/20 text-zinc-400'
            }`}>
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
