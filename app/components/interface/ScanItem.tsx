"use client";

import Link from "next/link";

import { Stamp, StatusLabel } from "@/app/components/ui/table";
import type { ScanStatus } from "@/app/lib/api";

interface ScanItemProps {
  url: string;
  status?: ScanStatus;
  createdAt?: string;
  /** Where the scan's details open; without it the row is plain text. */
  href?: string;
}

const ROW = "flex items-center gap-3 rounded-lg px-2 py-2.5";

/** A scan in a short list: address, when, and how it ended. */
export default function ScanItem({ url, status, createdAt, href }: ScanItemProps) {
  const body = (
    <>
      <i className="ri-global-line text-base leading-none text-zinc-500 dark:text-zinc-400" aria-hidden="true"></i>
      <span className="min-w-0 flex-1">
        {/* Truncated on screen only; the whole address stays in the text. */}
        <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100" title={url}>
          {url}
        </span>
        {createdAt ? (
          <span className="block text-xs">
            <Stamp value={createdAt} />
          </span>
        ) : null}
      </span>
      {status ? (
        <span className="shrink-0 text-xs">
          <StatusLabel status={status} />
        </span>
      ) : null}
    </>
  );

  if (!href) return <div className={ROW}>{body}</div>;

  return (
    <Link
      href={href}
      className={`${ROW} transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/40`}
    >
      {body}
    </Link>
  );
}
