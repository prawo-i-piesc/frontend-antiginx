"use client";

import { useState } from "react";

/** Where a site's icon is served. The hash names the content, so the address never goes stale. */
export function faviconUrl(hash: string): string {
  return `/api/favicons/${hash}`;
}

interface SiteIconProps {
  /** The `favicon` the API sends beside a scan's address; null while the site has none or it is not fetched yet. */
  hash?: string | null;
  className?: string;
}

/**
 * A scanned site's icon in a 16px square, or a globe when there is none.
 * The square keeps its size either way, so an icon arriving on a later read
 * moves nothing. It is decoration: the address beside it names the site.
 */
export default function SiteIcon({ hash, className = "" }: SiteIconProps) {
  // Remembers which icon failed, so a different one is still tried.
  const [failed, setFailed] = useState<string | null>(null);
  const src = hash && failed !== hash ? faviconUrl(hash) : null;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-4 shrink-0 items-center justify-center ${
        // Many marks are dark on a transparent ground (GitHub's is hard-coded #24292E), and a
        // dark page would swallow them; on a light plate every icon reads, as it does in light.
        src ? "dark:rounded-[3px] dark:bg-zinc-100" : ""
      } ${className}`}
    >
      {src ? (
        // A 16px image from our own API, cached for good; next/image would only add a hop.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={16}
          height={16}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(hash ?? null)}
          // An SVG icon picks its colours with prefers-color-scheme, which in an <img> follows the
          // element's color-scheme. Set from the app's theme, a dark mark is not drawn on a dark page.
          className="size-4 object-contain [color-scheme:light] dark:size-3.5 dark:[color-scheme:dark]"
        />
      ) : (
        <i className="ri-global-line text-base leading-none text-zinc-500 dark:text-zinc-400" />
      )}
    </span>
  );
}
