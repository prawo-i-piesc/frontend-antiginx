import { useState, useEffect } from "react";
import {
  ApiRequestError,
  createScan,
  ScanAccessMode,
  ScanResponse,
} from "@/app/lib/api";
import usePollScan from "./usePollScan";
import { SCAN_CONFIG } from "@/app/config/constants";

interface UseScanModalOptions {
  mode?: ScanAccessMode;
  token?: string | null;
}

export function useScanModal(options?: UseScanModalOptions) {
  const mode = options?.mode ?? "free";
  const token = options?.token;
  const pollMaxAttempts =
    mode === "free"
      ? SCAN_CONFIG.FREE_MAX_POLL_ATTEMPTS
      : SCAN_CONFIG.MAX_POLL_ATTEMPTS;

  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startPolling, stopPolling, isPolling, setScan } = usePollScan({
    maxAttempts: pollMaxAttempts,
    intervalMs: SCAN_CONFIG.POLL_INTERVAL,
    requestOptions: { mode, token },
  });

  function getFriendlyScanError(error: unknown): string {
    if (error instanceof ApiRequestError) {
      if (error.code === "SCAN_TIMEOUT") {
        return mode === "free"
          ? "The scan is taking longer than usual. Try again in a moment or verify that the URL is reachable."
          : "The scan did not finish within the expected time. Please try again shortly.";
      }

      if (error.code === "NETWORK_ERROR") {
        return "Cannot connect to the scanner backend. Check your network or NEXT_PUBLIC_BACKEND_URL configuration.";
      }

      if (error.status === 400) {
        return "Invalid scan request. Please verify the URL and try again.";
      }

      if (error.status === 401 || error.status === 403) {
        return "You are not authorized to run this scan. Please sign in again.";
      }

      if (error.status === 404) {
        return "Scan not found. The job may have expired or been removed.";
      }

      if (error.status === 429) {
        return "Too many requests. Please wait a moment and try again.";
      }

      if (error.status && error.status >= 500) {
        return "The scanner server is temporarily unavailable. Please try again shortly.";
      }

      return error.message;
    }

    if (error instanceof Error) {
      if (/failed to fetch|network/i.test(error.message)) {
        return "Cannot connect to the scanner backend. Check your connection and try again.";
      }
      return error.message;
    }

    return "An unexpected error occurred while scanning the URL.";
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

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const handleScan = async (url: string, tests?: string[]) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const { scanId } = await createScan(url.trim(), tests, {
        mode,
        token,
      });

      // start polling, update state on progress — await to preserve spinner lifecycle
      const completedScan = await startPolling(scanId, (scan) => {
        setScanResult(scan);
        setScan(scan as any);
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
          !isModalOpen
        ) {
          setIsModalOpen(true);
          setIsScanning(false);
        }
      });

      setScanResult(completedScan as ScanResponse);
      if (completedScan.status === "COMPLETED" && !isModalOpen) {
        setIsModalOpen(true);
      }
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
