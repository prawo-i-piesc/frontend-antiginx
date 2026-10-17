import { useState, useEffect, useRef } from "react";
import {
  ApiRequestError,
  createScan,
  PremiumScanCompliance,
  ScanAccessMode,
  ScanResponse,
} from "@/app/lib/api";
import usePollScan from "./usePollScan";
import { SCAN_CONFIG } from "@/app/config/constants";
import { useI18n } from "@/app/i18n/I18nProvider";

interface UseScanModalOptions {
  mode?: ScanAccessMode;
}

export function useScanModal(options?: UseScanModalOptions) {
  const { t } = useI18n();
  const mode = options?.mode ?? "free";
  const pollMaxAttempts =
    mode === "free"
      ? SCAN_CONFIG.FREE_MAX_POLL_ATTEMPTS
      : SCAN_CONFIG.MAX_POLL_ATTEMPTS;

  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startPolling, setScan } = usePollScan({
    maxAttempts: pollMaxAttempts,
    intervalMs: SCAN_CONFIG.POLL_INTERVAL,
    requestOptions: { mode },
  });

  // The progress callback outlives the render it was created in, so it checks
  // this ref rather than state: once the user has closed the modal mid-scan,
  // the next poll must not open it again and pull focus back into it.
  const shownWhileRunning = useRef(false);

  function getFriendlyScanError(error: unknown): string {
    const messages = t.scan.errors;

    if (error instanceof ApiRequestError) {
      if (error.code === "SCAN_TIMEOUT") {
        return mode === "free" ? messages.timeoutFree : messages.timeoutPremium;
      }

      if (error.code === "NETWORK_ERROR") {
        return messages.network;
      }

      if (error.status === 401 || error.status === 403) {
        return messages.unauthorized;
      }

      if (error.status === 404) {
        return messages.notFound;
      }

      if (error.status === 429) {
        return messages.rateLimited;
      }

      if (error.status && error.status >= 500) {
        return messages.server;
      }

      // Any other refusal; the backend explains it in English only.
      if (error.status && error.status >= 400) {
        return messages.invalidRequest;
      }

      return messages.unexpected;
    }

    if (error instanceof Error && /failed to fetch|network/i.test(error.message)) {
      return messages.network;
    }

    return messages.unexpected;
  }

  // Block body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleScan = async (
    url: string,
    tests?: string[],
    authorizedTester?: boolean,
    compliance?: PremiumScanCompliance,
  ) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    shownWhileRunning.current = false;

    try {
      const { scanId } = await createScan(url.trim(), tests, compliance, {
        mode,
        authorizedTester,
      });

      // start polling, update state on progress — await to preserve spinner lifecycle
      const completedScan = await startPolling(scanId, (scan) => {
        setScanResult(scan);
        setScan(scan);
        console.log(
          "Scan status:",
          scan.status,
          "Results:",
          scan.results.length,
        );

        // Open modal when it becomes RUNNING with no results
        if (
          scan.status === "RUNNING" &&
          scan.results.length === 0 &&
          !shownWhileRunning.current
        ) {
          shownWhileRunning.current = true;
          setIsModalOpen(true);
          setIsScanning(false);
        }
      });

      setScanResult(completedScan);
      // Failed scans too: they used to end without any feedback.
      setIsModalOpen(true);
    } catch (error) {
      console.error("Scan error:", error);
      setScanError(getFriendlyScanError(error));
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
    setIsModalOpen,
  };
}
