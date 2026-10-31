"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { ApiError, messageForCode } from "@/app/lib/authErrors";

/** What a screen can tell the admin about a load that failed. */
export type LoadError =
  | { kind: "forbidden" }
  | { kind: "network" }
  | { kind: "failed"; message: string };

/** Called from a fetch callback, so the copy comes out in the current language. */
export function loadErrorOf(error: unknown): LoadError {
  if (error instanceof ApiError) {
    return error.status === 403 ? { kind: "forbidden" } : { kind: "failed", message: error.message };
  }
  // fetch() rejects with a TypeError when the network is down.
  if (error instanceof TypeError) return { kind: "network" };
  return { kind: "failed", message: messageForCode(null) };
}

interface Answer<T> {
  request: string;
  data?: T;
  error?: LoadError;
}

/**
 * Loads what `key` describes, again whenever the key changes or reload() is
 * called; a null key loads nothing.
 *
 * Each answer is tagged with the request it belongs to, so "loading" simply
 * means the newest answer is for an older request. Its data stays available
 * meanwhile: a table can keep the old page on screen, dimmed, instead of
 * collapsing to a spinner on every page change. A request overtaken by a newer
 * one is aborted and its answer dropped.
 */
export default function useAdminQuery<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) {
  const [reloads, setReloads] = useState(0);
  const [answer, setAnswer] = useState<Answer<T> | null>(null);
  const request = key === null ? null : `${key}#${reloads}`;

  const run = useEffectEvent((signal: AbortSignal) => load(signal));

  useEffect(() => {
    if (request === null) return;

    const controller = new AbortController();
    run(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setAnswer({ request, data });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Admin request failed:", error);
        setAnswer({ request, error: loadErrorOf(error) });
      },
    );
    return () => controller.abort();
  }, [request]);

  const loading = request !== null && answer?.request !== request;

  return {
    /** The newest answer's data; while loading, the previous request's. */
    data: answer?.data,
    loading,
    error: loading ? null : (answer?.error ?? null),
    reload: () => setReloads((count) => count + 1),
  };
}
