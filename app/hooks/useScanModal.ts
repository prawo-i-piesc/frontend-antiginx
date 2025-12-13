import { useState, useEffect } from 'react';
import { createScan, pollScanUntilComplete, ScanResponse } from '@/app/lib/api';
import { SCAN_CONFIG } from '@/app/config/constants';

export function useScanModal() {
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const { scanId } = await createScan(url);

      const completedScan = await pollScanUntilComplete(
        scanId, 
        (scan) => {
          setScanResult(scan);
          console.log('Scan status:', scan.status, 'Results:', scan.results.length);
          
          // Otwórz modal tylko gdy status zmieni się na RUNNING bez wyników (pokazuje spinner)
          if (scan.status === 'RUNNING' && scan.results.length === 0 && !isModalOpen) {
            setIsModalOpen(true);
            setIsScanning(false);
          }
        },
        SCAN_CONFIG.MAX_POLL_ATTEMPTS,
        SCAN_CONFIG.POLL_INTERVAL
      );

      setScanResult(completedScan);
      
      // Otwórz modal z wynikami tylko gdy scan się zakończy (COMPLETED)
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
