"use client";

import { useI18n } from "@/app/i18n/I18nProvider";

/** Id of the element every page's main content sits in; the skip link targets it. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * First stop for the Tab key on every page, so a keyboard user can jump past
 * the header and navigation instead of tabbing through them on each visit.
 * Hidden until it receives focus.
 */
export default function SkipLink() {
  const { t } = useI18n();

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:rounded-lg focus:bg-cyan-700 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
    >
      {t.common.skipToContent}
    </a>
  );
}
