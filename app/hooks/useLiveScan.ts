"use client";

import { useCallback, useEffect, useState } from "react";

import type { ScanAccessMode } from "@/app/lib/api";
import { INITIAL_LIVE_STATE, LiveScanSession, type LiveScanState } from "@/app/lib/liveScan";

export interface LiveScan extends LiveScanState {
  /** Starts watching again, after a failure or a scan the session stopped watching. */
  retry: () => void;
}

/**
 * The current state of a scan, kept up to date while it runs. A null id watches
 * nothing. See LiveScanSession for how it stays current.
 */
export default function useLiveScan(scanId: string | null, mode: ScanAccessMode): LiveScan {
  const [attempt, setAttempt] = useState(0);
  const [reported, setReported] = useState<{ scanId: string; state: LiveScanState } | null>(null);

  useEffect(() => {
    if (!scanId) return;
    const session = new LiveScanSession(scanId, mode, (state) => setReported({ scanId, state }));
    session.start();
    return () => session.stop();
  }, [scanId, mode, attempt]);

  // What is on screen stays there, marked as being looked at again.
  const retry = useCallback(() => {
    setReported((current) => current && { ...current, state: { ...INITIAL_LIVE_STATE, scan: current.state.scan } });
    setAttempt((current) => current + 1);
  }, []);

  // Another scan's state is not this one's: nothing shows until this one reports.
  const state = reported?.scanId === scanId ? reported.state : INITIAL_LIVE_STATE;

  // A session gives up after a long silence, which a tab left in the background
  // reaches without the scan being any the worse. Coming back is a reason to look.
  const { gaveUp } = state;
  useEffect(() => {
    if (!gaveUp) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") retry();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [gaveUp, retry]);

  return { ...state, retry };
}
