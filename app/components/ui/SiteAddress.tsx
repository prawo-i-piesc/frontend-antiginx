"use client";

import type { ReactNode } from "react";

import SiteIcon from "@/app/components/ui/SiteIcon";
import { useI18n } from "@/app/i18n/I18nProvider";

/** The address itself when it leads somewhere: cut short on screen, underlined under the pointer, in the colour around it. */
export const ADDRESS_LINK = "min-w-0 cursor-pointer truncate text-left underline-offset-2 hover:underline";

/** The address as plain text, cut short on screen. */
export const ADDRESS_TEXT = "min-w-0 truncate";

interface SiteAddressProps {
  /** The scanned address, opened by the arrow. */
  url: string;
  favicon?: string | null;
  /** The address as the view shows it: a link, a button or plain text, styled with ADDRESS_LINK or ADDRESS_TEXT. */
  children: ReactNode;
  className?: string;
}

/**
 * A scanned site in one line: its icon, the address, and an arrow that opens
 * the site in a new tab. The arrow follows the address rather than the end of
 * the cell, and stays put however the address is cut short.
 */
export default function SiteAddress({ url, favicon, children, className = "" }: SiteAddressProps) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <SiteIcon hash={favicon} />
      {children}
      <OpenSiteLink url={url} />
    </span>
  );
}

/** The arrow that opens a scanned site in a new tab; 24px to hit, pulled into the line so it keeps its height. */
export function OpenSiteLink({ url, className = "" }: { url: string; className?: string }) {
  const { t } = useI18n();
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.scan.openSite(url)}
      title={t.scan.openSite(url)}
      className={`-my-1 -ml-1 inline-flex size-6 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 ${className}`}
    >
      <i className="ri-arrow-right-up-line text-sm leading-none" aria-hidden="true" />
    </a>
  );
}
