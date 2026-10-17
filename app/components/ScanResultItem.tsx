"use client";

import { motion } from 'framer-motion';

import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/app/hooks/useMediaQuery';
import { useI18n } from '@/app/i18n/I18nProvider';
import FireCanvas from './FireCanvas';

interface ScanResult {
  id: number;
  /** The engine's test id, which names the test in the interface language. */
  test_id?: string;
  test_name: string;
  message: string;
  severity: string;
  passed: boolean;
}

interface ScanResultItemProps {
  result: ScanResult;
  index: number;
  /**
   * "modal" (the default) makes critical failures glow; "page" is the calmer
   * look for the scanner page, with room on the right of the message.
   */
  variant?: 'modal' | 'page';
}

export default function ScanResultItem({ result, index, variant = 'modal' }: ScanResultItemProps) {
  const { t } = useI18n();
  // Under reduced motion the items appear at once instead of one by one.
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'border-red-300 bg-red-50 dark:border-red-600/50 dark:bg-red-900/20';
    if (s === 'high') return 'border-orange-300 bg-orange-50 dark:border-orange-600/50 dark:bg-orange-900/20';
    if (s === 'medium') return 'border-yellow-300 bg-yellow-50 dark:border-yellow-600/50 dark:bg-yellow-900/20';
    if (s === 'low') return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700/40 dark:bg-yellow-950/15';
    return 'border-zinc-300 bg-zinc-50 dark:border-zinc-600/50 dark:bg-zinc-900/20';
  };

  const getSeverityTextColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'text-red-700 dark:text-red-400';
    if (s === 'high') return 'text-red-600 dark:text-red-400';
    if (s === 'medium') return 'text-orange-700 dark:text-orange-400';
    if (s === 'low') return 'text-yellow-700 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const severity = result.severity.toUpperCase() as keyof typeof t.scan.severity;
  const severityLabel = t.scan.severity[severity] ?? result.severity;
  const testName = (result.test_id && t.scan.tests[result.test_id]) || result.test_name;
  const isCritical = severity === 'CRITICAL';

  const cleanMessage = result.message.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  const formattedMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.2,
        delay: reduceMotion ? 0 : index * 0.2
      }}
      className={`rounded-lg p-3 border relative overflow-hidden ${
        result.passed
          ? 'bg-green-50 border-green-300 dark:bg-green-900/10 dark:border-green-600/20'
          : getSeverityColor(result.severity)
      } ${
        isCritical && variant === 'modal' && !result.passed
          ? 'shadow-[0_0_20px_rgba(251,146,60,0.2),0_0_40px_rgba(234,88,12,0.1)] border-orange-400 dark:border-orange-500/40'
          : ''
      }`}
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
          result.passed
            ? 'bg-green-200 border border-green-300 dark:bg-green-500/25 dark:border-green-500/30'
            : 'bg-red-200 border border-red-300 dark:bg-red-600/20 dark:border-red-500/30'
        }`}>
          <i
            className={`${
              result.passed
                ? 'ri-checkbox-circle-fill text-green-700 dark:text-green-400'
                : 'ri-close-circle-fill ' + getSeverityTextColor(result.severity)
            } text-base`}
            aria-hidden="true"
          ></i>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
              {testName}
              <span className="sr-only"> – {result.passed ? t.scan.result.passed : t.scan.result.failed}</span>
            </h3>
            <span className="sr-only">{t.scan.report.severity}:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 ${
              severity === 'CRITICAL'
                ? 'bg-red-200 border border-red-300 text-red-800 dark:bg-red-500/30 dark:border-red-400/20 dark:text-red-300'
                : severity === 'HIGH'
                ? 'bg-orange-200 border border-orange-300 text-orange-800 dark:bg-orange-500/30 dark:border-orange-400/20 dark:text-orange-300'
                : severity === 'MEDIUM'
                ? 'bg-yellow-200 border border-yellow-300 text-yellow-800 dark:bg-yellow-500/30 dark:border-yellow-400/20 dark:text-yellow-400'
                : severity === 'LOW'
                ? 'bg-yellow-200 border border-yellow-300 text-yellow-800 dark:bg-yellow-600/25 dark:border-yellow-500/20 dark:text-yellow-400'
                : 'bg-zinc-200 border border-zinc-300 text-zinc-600 dark:bg-zinc-500/20 dark:border-zinc-400/20 dark:text-zinc-400'
            }`}>
              {severityLabel}
            </span>
          </div>
          {/* The engine writes these messages in English */}
          <p
            lang="en"
            className={`text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed ${variant === 'page' ? ' md:pr-20' : ''}`}
          >
            {formattedMessage}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
