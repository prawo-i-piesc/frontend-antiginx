import { useEffect } from 'react';
import { ScanResponse } from '@/app/lib/api';
import { mockScanWithResults, mockScanInProgress, mockScanError } from '@/app/mocks/scanData';

interface UseDebugModalsProps {
  setScanResult: (result: ScanResponse | null) => void;
  setScanError: (error: string | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export function useDebugModals({ setScanResult, setScanError, setIsModalOpen }: UseDebugModalsProps) {
  useEffect(() => {
    // Only enable debug functions in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // @ts-expect-error -- debug helper, not declared on Window
    window.testModalWithResults = () => {
      setScanResult(mockScanWithResults);
      setScanError(null);
      setIsModalOpen(true);
      console.log('✅ Modal with 6 test results opened');
    };

    // @ts-expect-error -- debug helper, not declared on Window
    window.testModalInProgress = () => {
      setScanResult(mockScanInProgress);
      setScanError(null);
      setIsModalOpen(true);
      console.log('✅ Modal with "in progress" state opened');
    };

    // @ts-expect-error -- debug helper, not declared on Window
    window.testModalError = () => {
      setScanResult(null);
      setScanError(mockScanError);
      setIsModalOpen(true);
      console.log('✅ Error modal opened');
    };

    console.log('🎯 Test functions available:');
    console.log('  - testModalWithResults() - Show modal with 6 test results');
    console.log('  - testModalInProgress() - Show modal with scanning in progress');
    console.log('  - testModalError() - Show error modal');

    return () => {
      // @ts-expect-error -- debug helper, not declared on Window
      delete window.testModalWithResults;
      // @ts-expect-error -- debug helper, not declared on Window
      delete window.testModalInProgress;
      // @ts-expect-error -- debug helper, not declared on Window
      delete window.testModalError;
    };
  }, [setScanResult, setScanError, setIsModalOpen]);
}
