import { useState, useEffect } from 'react';
import { createScan, ScanResponse } from '@/app/lib/api';
import usePollScan from './usePollScan';
import { SCAN_CONFIG } from '@/app/config/constants';

export function useScanModal() {
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startPolling, stopPolling, isPolling, setScan } = usePollScan({
    maxAttempts: SCAN_CONFIG.MAX_POLL_ATTEMPTS,
    intervalMs: SCAN_CONFIG.POLL_INTERVAL,
  });

  // Block body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const { scanId } = await createScan(url);

      // start polling, update state on progress — await to preserve spinner lifecycle
      const completedScan = await startPolling(scanId, (scan) => {
        setScanResult(scan);
        setScan(scan as any);
        console.log('Scan status:', scan.status, 'Results:', scan.results.length);

        // Open modal when it becomes RUNNING with no results
        if (scan.status === 'RUNNING' && scan.results.length === 0 && !isModalOpen) {
          setIsModalOpen(true);
          setIsScanning(false);
        }
      });

      setScanResult(completedScan as ScanResponse);
      if (completedScan.status === 'COMPLETED' && !isModalOpen) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setScanError(error instanceof Error ? error.message : 'Failed to scan URL');
      setIsModalOpen(true);
    } finally {
      setIsScanning(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    scanResult,
    isScanning,
    scanError,
    isModalOpen,
    handleScan,
    closeModal,
    setScanResult,
    setScanError,
    setIsModalOpen
  };
}
