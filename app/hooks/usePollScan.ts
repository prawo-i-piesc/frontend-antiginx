"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { pollScanUntilComplete, ScanResponse } from '@/app/lib/api';

interface UsePollScanOptions {
  maxAttempts?: number;
  intervalMs?: number;
}

export function usePollScan(options?: UsePollScanOptions) {
  const { maxAttempts = 60, intervalMs = 2000 } = options || {};
  const [scan, setScan] = useState<ScanResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; abortRef.current = true; };
  }, []);

  const stopPolling = useCallback(() => {
    abortRef.current = true;
  }, []);

  const startPolling = useCallback(async (scanId: string, onProgress?: (s: ScanResponse) => void) => {
    abortRef.current = false;
    setIsPolling(true);
    setError(null);

    try {
      const result = await pollScanUntilComplete(
        scanId,
        (s) => {
          if (!mountedRef.current) return;
          setScan(s);
          if (onProgress) onProgress(s);
        },
        maxAttempts,
        intervalMs,
        () => abortRef.current
      );

      if (!mountedRef.current) return result;
      setScan(result);
      setIsPolling(false);
      return result;
    } catch (err: any) {
      if (!mountedRef.current) return Promise.reject(err);
      setError(err?.message || 'Polling failed');
      setIsPolling(false);
      return Promise.reject(err);
    }
  }, [maxAttempts, intervalMs]);

  return { scan, isPolling, error, startPolling, stopPolling, setScan } as const;
}

export default usePollScan;
