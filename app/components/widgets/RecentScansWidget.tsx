"use client";

import Link from "next/link";

import ScanItem from "@/app/components/interface/ScanItem";
import { Bone, ROW_WIDTHS, SkeletonRegion } from "@/app/components/ui/Skeleton";
import WidgetCard from "@/app/components/widgets/WidgetCard";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { ScanStatus } from "@/app/lib/api";

/** The widget needs the address and an id; status and date are shown when the API sends them. */
export interface ApiScanData {
  id: string;
  target_url: string;
  status?: string;
  created_at?: string;
}

interface RecentScansWidgetProps {
  scans?: ApiScanData[];
  isLoading?: boolean;
  /** Where "View all" leads; without it the link is left out. */
  viewAllHref?: string;
  /** Where one scan's details open; undefined leaves that row without a link. */
  scanHref?: (scan: ApiScanData) => string | undefined;
  /** The scans could not be loaded. */
  error?: boolean;
}

const SCAN_STATUSES = new Set(["PENDING", "RUNNING", "COMPLETED", "FAILED"]);

export default function RecentScansWidget({
  scans = [],
  isLoading = false,
  viewAllHref,
  scanHref,
  error = false,
}: RecentScansWidgetProps) {
  const { t } = useI18n();
  const copy = t.widgets.recentScans;
  const messageClass = "flex flex-1 items-center justify-center text-sm text-zinc-600 dark:text-zinc-400";

  return (
    <WidgetCard
      title={t.widgets.names.recentScans}
      action={
        viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
          >
            {t.widgets.viewAll}
            <span className="sr-only"> {copy.viewAllContext}</span>
          </Link>
        ) : null
      }
    >
      {isLoading ? (
        <SkeletonRegion className="-mx-2 flex-1 divide-y divide-zinc-200 dark:divide-zinc-800/70">
          {ROW_WIDTHS.slice(0, 4).map((width) => (
            <div key={width} className="flex items-center gap-3 px-2 py-3">
              <Bone className="h-4 w-4 shrink-0 rounded-full" />
              <span className="min-w-0 flex-1 space-y-1.5">
                <Bone className={`h-3 max-w-full ${width}`} />
                <Bone className="h-2.5 w-24" />
              </span>
              <Bone className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </SkeletonRegion>
      ) : error ? (
        <p className={messageClass}>{copy.error}</p>
      ) : scans.length === 0 ? (
        <p className={messageClass}>{copy.empty}</p>
      ) : (
        <ul className="-mx-2 flex-1 divide-y divide-zinc-200 overflow-y-auto scrollbar-theme dark:divide-zinc-800/70">
          {scans.map((scan) => (
            <li key={scan.id} className="py-0.5">
              <ScanItem
                url={scan.target_url}
                status={scan.status && SCAN_STATUSES.has(scan.status) ? (scan.status as ScanStatus) : undefined}
                createdAt={scan.created_at}
                href={scanHref?.(scan)}
              />
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
