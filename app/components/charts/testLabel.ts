"use client";

import { useCallback } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";
import scanEn from "@/app/i18n/messages/en/scan";

/**
 * Results are stored under the name the engine reports, in English: "HSTS
 * Header Analysis". The interface keys its labels by test id, so the name is
 * matched back to its id first. An id itself is accepted as well.
 */
const ID_BY_NAME = new Map(Object.entries(scanEn.tests).map(([id, name]) => [name.toLowerCase(), id]));

export function testIdOf(name: string): string | null {
  if (Object.hasOwn(scanEn.tests, name)) return name;
  return ID_BY_NAME.get(name.trim().toLowerCase()) ?? null;
}

/** The short label for lists and the full name for tooltips, in the interface language. */
export function useTestLabel() {
  const { t } = useI18n();
  return useCallback(
    (name: string) => {
      const id = testIdOf(name);
      if (!id) return { short: name, full: name };
      return { short: t.scan.testsShort[id] ?? name, full: t.scan.tests[id] ?? name };
    },
    [t],
  );
}
