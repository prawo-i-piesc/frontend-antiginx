"use client";

import { useEffect, useEffectEvent, useState } from "react";

/** Long enough to skip the keystrokes in between, short enough to feel live. */
const DELAY_MS = 300;

/**
 * A search field whose committed value lives somewhere else, such as the
 * address. What is typed is committed, trimmed, once typing pauses.
 *
 * The field follows `value` only when something else changed it, such as the
 * back button. A search the field committed itself comes back after the
 * delay, and by then the field may hold more letters that must not be lost.
 */
export default function useSearchDraft(value: string, commit: (value: string) => void) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  const [sent, setSent] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (value !== sent) setDraft(value);
  }

  const commitLatest = useEffectEvent((next: string) => {
    setSent(next);
    commit(next);
  });

  useEffect(() => {
    const next = draft.trim();
    if (next === value) return;
    const timer = setTimeout(() => commitLatest(next), DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft, value]);

  return [draft, setDraft] as const;
}
