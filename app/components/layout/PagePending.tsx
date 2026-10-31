"use client";

import ChartsSkeleton from "@/app/components/charts/ChartsSkeleton";
import { Bone, ROW_WIDTHS, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { SURFACE } from "@/app/components/ui/surface";

/** Which page is on its way, so the placeholder has that page's shape. */
export type PendingLayout = "widgets" | "table" | "chart" | "stack";

/**
 * What a signed-in page shows while the session is still being restored: the
 * shell drawn in placeholders, with the sidebar as wide as the real one and
 * the content in the shape of the page, so nothing jumps when it arrives.
 *
 * The sidebar holds only grey bars, not links: whether this is the admin
 * panel or the dashboard, and what the account may open, is not known yet.
 */
export default function PagePending({ layout = "table" }: { layout?: PendingLayout }) {
  return (
    <SkeletonRegion className="h-dvh bg-zinc-200 lg:flex dark:bg-zinc-950">
      <div
        aria-hidden="true"
        className="shell-skeleton-sidebar hidden h-full shrink-0 flex-col border-r border-zinc-200/80 bg-white/90 lg:flex dark:border-zinc-800/60 dark:bg-zinc-950/80"
      >
        <div className="flex h-20 shrink-0 items-center border-b border-zinc-200/60 px-5 dark:border-zinc-800/40">
          <Bone className="h-6 w-full max-w-24" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-5">
          {[0, 1, 2, 3].map((item) => (
            <Bone key={item} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex h-15 shrink-0 items-center border-t border-zinc-200/60 px-3 dark:border-zinc-800/40">
          <Bone className="h-9 w-full rounded-lg" />
        </div>
      </div>

      <div className="flex h-dvh min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-2 sm:px-4 lg:hidden dark:border-zinc-800/60 dark:bg-zinc-950/90">
          <Bone className="h-9 w-9 rounded-lg" />
          <Bone className="h-6 w-24" />
        </div>

        <div className="@container flex-1 overflow-hidden bg-zinc-100 p-4 sm:p-6 lg:pt-8 dark:bg-zinc-950">
          <div className="mb-6 space-y-2">
            <Bone className="h-7 w-48" />
            <Bone className="h-4 w-72 max-w-full" />
          </div>
          <Content layout={layout} />
        </div>
      </div>
    </SkeletonRegion>
  );
}

function Content({ layout }: { layout: PendingLayout }) {
  if (layout === "widgets") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 @4xl:grid-cols-4">
        {[0, 1, 2, 3].map((card) => (
          <div key={card} className={`${SURFACE} space-y-3 p-5`}>
            <Bone className="h-3.5 w-28 max-w-full" />
            <Bone className="h-8 w-12" />
          </div>
        ))}
        {[0, 1].map((card) => (
          <div key={card} className={`${SURFACE} col-span-2 space-y-4 p-5`}>
            <Bone className="h-4 w-36" />
            {ROW_WIDTHS.slice(0, 4).map((width) => (
              <Bone key={width} className={`h-3 max-w-full ${width}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (layout === "chart") return <ChartsSkeleton filters />;

  if (layout === "stack") {
    return (
      <div className="flex flex-col gap-6">
        {[3, 2, 2].map((rows, card) => (
          <div key={card} className={`${SURFACE} p-4 sm:p-6`}>
            <Bone className="h-5 w-32" />
            <Bone className="mt-2 h-3.5 w-64 max-w-full" />
            <div className="mt-5 space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-700/50">
              {Array.from({ length: rows }, (_, row) => (
                <Bone key={row} className={`h-4 max-w-full ${ROW_WIDTHS[row]}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${SURFACE} overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-zinc-200 px-3 py-3 sm:px-4 dark:border-zinc-800">
        <Bone className="h-9 w-full max-w-72 rounded-lg" />
        <Bone className="hidden h-9 w-40 rounded-lg sm:block" />
      </div>
      {ROW_WIDTHS.map((width) => (
        <div
          key={width}
          className="flex h-11 items-center gap-6 border-b border-zinc-100 px-3 last:border-0 dark:border-zinc-800/60"
        >
          <span className="min-w-0 flex-1">
            <Bone className={`h-3 max-w-full ${width}`} />
          </span>
          <Bone className="hidden h-3 w-16 sm:block" />
          <Bone className="hidden h-3 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}
