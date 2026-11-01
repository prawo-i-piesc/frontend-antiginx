"use client";

import { useState } from "react";

import useApiQuery from "@/app/hooks/useApiQuery";
import usePolling from "@/app/hooks/usePolling";

/**
 * useApiQuery, loaded again every `interval` ms, for a view that shows live
 * figures under a fixed key. A failed refresh keeps the last good answer on
 * screen next to the error, instead of swapping the whole view for an error
 * and then a skeleton every few seconds while the backend is restarting.
 *
 * Only for a fixed key: unlike useApiQuery, data from an earlier key would
 * outlive a failed request for a new one.
 */
export default function usePolledQuery<T>(
  key: string | null,
  load: (signal: AbortSignal) => Promise<T>,
  interval: number | null,
) {
  const query = useApiQuery(key, load);
  usePolling(query.reload, key === null ? null : interval);

  // Held in state rather than a ref, so a newer answer re-renders as usual.
  const [lastGood, setLastGood] = useState<T | undefined>(undefined);
  if (query.data !== undefined && query.data !== lastGood) setLastGood(query.data);

  return { ...query, data: query.data ?? lastGood };
}
