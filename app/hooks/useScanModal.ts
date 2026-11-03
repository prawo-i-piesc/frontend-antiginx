import { useEffect, useState } from "react";

import useLiveScan from "@/app/hooks/useLiveScan";
import { useI18n } from "@/app/i18n/I18nProvider";
import { createScan, isFinishedStatus } from "@/app/lib/api";
import { scanErrorMessage } from "@/app/lib/scanErrors";

/**
 * The landing page's free scan: starts it, follows it live in a modal, and
 * brings the modal back when the scan ends if it was closed in the meantime.
 */
export function useScanModal() {
  const { t } = useI18n();

  const [scanId, setScanId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportedScanId, setReportedScanId] = useState<string | null>(null);

  const live = useLiveScan(scanId, "free");

  // However the scan ended, the person hears about it, and only once, or closing
  // the modal would open it again.
  const ended =
    live.error !== null || live.gaveUp || (live.scan !== null && isFinishedStatus(live.scan.status));
  if (scanId !== null && ended && reportedScanId !== scanId) {
    setReportedScanId(scanId);
    setIsModalOpen(true);
  }

  const scanError = startError ?? (live.error ? scanErrorMessage(t.scan.errors, live.error) : null);

  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setStartError(null);
    setScanId(null);

    try {
      const { scanId: created } = await createScan(url, undefined, { mode: "free" });
      setScanId(created);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Scan error:", error);
      setStartError(scanErrorMessage(t.scan.errors, error));
      setIsModalOpen(true);
    } finally {
      setIsScanning(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    live,
    /** Whether there is a scan for the result modal to show. */
    hasScan: scanId !== null,
    isScanning,
    scanError,
    isModalOpen,
    handleScan,
    closeModal,
  };
}
