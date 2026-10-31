import { Bone } from "@/app/components/ui/Skeleton";
import { SURFACE } from "@/app/components/ui/surface";

/** The charts page's grids, shared with its placeholder so the two cannot drift apart. */
export const CHARTS_GRID = "grid gap-3 sm:gap-4 @4xl:grid-cols-3 @4xl:items-start";
export const KPI_GRID = "grid grid-cols-2 gap-3 sm:gap-4 @4xl:grid-cols-4";

/**
 * The charts page as it will be: the filters, four figures, the line and the
 * bars. Shapes only; the caller puts them in a SkeletonRegion.
 */
export default function ChartsSkeleton({ filters = false }: { filters?: boolean }) {
  return (
    <>
      {filters ? (
        <div className="mb-4 flex flex-wrap gap-3">
          <Bone className="h-9 w-full rounded-lg sm:w-80" />
          <Bone className="h-9 w-48 rounded-lg" />
        </div>
      ) : null}
      <div className={`${KPI_GRID} mb-3 sm:mb-4`}>
        {[0, 1, 2, 3].map((card) => (
          <div key={card} className={`${SURFACE} p-5`}>
            <Bone className="h-3.5 w-24 max-w-full" />
            <Bone className="mt-4 h-8 w-16" />
            <Bone className="mt-3 h-3 w-28 max-w-full" />
          </div>
        ))}
      </div>
      <div className={CHARTS_GRID}>
        <div className={`${SURFACE} p-5 @4xl:col-span-2`}>
          <Bone className="mb-5 h-4 w-32" />
          <Bone className="h-[280px] w-full rounded-lg" />
        </div>
        <div className={`${SURFACE} p-5`}>
          <Bone className="mb-5 h-4 w-40" />
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row}>
                <Bone className="mb-1.5 h-3 w-20" />
                <Bone className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
