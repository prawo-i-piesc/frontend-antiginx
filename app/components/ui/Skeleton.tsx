"use client";

import { useEffect } from "react";

import { useI18n } from "@/app/i18n/I18nProvider";

/**
 * Placeholders in the shape of what is loading, so the page keeps its layout
 * instead of swapping a spinner for content. The shapes are decorative; the
 * region around them is announced once as "Loading…".
 */

/** As long as .bone in globals.css stays invisible. */
const BONE_DELAY_MS = 300;

/*
 * A wait is often a chain of skeletons: the session's, then the page's, then a
 * card's. Each would start its own 300 ms of invisibility, so a wait long
 * enough to show placeholders would show them, blank, then show them again.
 * The delay is counted once for the chain instead: once skeletons have been
 * on screen long enough, <html data-bones="shown"> makes the next ones appear
 * at once, until no skeleton is left.
 */
let mountedRegions = 0;
let revealTimer: number | undefined;
let settleFrame: number | undefined;

function regionMounted() {
  mountedRegions += 1;
  if (settleFrame !== undefined) {
    cancelAnimationFrame(settleFrame);
    settleFrame = undefined;
  }
  if (revealTimer === undefined && document.documentElement.dataset.bones !== "shown") {
    revealTimer = window.setTimeout(() => {
      revealTimer = undefined;
      if (mountedRegions > 0) document.documentElement.dataset.bones = "shown";
    }, BONE_DELAY_MS);
  }
}

function regionUnmounted() {
  mountedRegions -= 1;
  if (mountedRegions > 0) return;
  // One skeleton replacing another unmounts the old one first; wait a frame
  // before deciding the chain is over.
  settleFrame = requestAnimationFrame(() => {
    settleFrame = undefined;
    if (mountedRegions > 0) return;
    window.clearTimeout(revealTimer);
    revealTimer = undefined;
    delete document.documentElement.dataset.bones;
  });
}

/**
 * One grey bar. Size and shape come from the caller. It shows only once the
 * wait is long enough to notice (see .bone in globals.css), so a fast load
 * goes straight from the empty frame to the content.
 */
export function Bone({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`bone block rounded-md bg-zinc-200 dark:bg-zinc-800/80 ${className}`} />;
}

export function SkeletonRegion({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const { t } = useI18n();
  useEffect(() => {
    regionMounted();
    return regionUnmounted;
  }, []);
  return (
    <div role="status" className={className}>
      <span className="sr-only">{t.common.loading}</span>
      {children}
    </div>
  );
}

/** Widths that vary from row to row, so a list of placeholders does not look like a barcode. */
export const ROW_WIDTHS = ["w-56", "w-40", "w-64", "w-48", "w-36", "w-60"] as const;
