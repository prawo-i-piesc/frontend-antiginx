"use client";

import StatsCard from "@/app/components/interface/StatsCard";
import type { Tone } from "@/app/components/ui/surface";
import { RiskTrendWidget, SeverityWidget, UserFailedTestsWidget } from "@/app/components/widgets/ChartWidgets";
import type { WidgetDefinition, WidgetRegistry } from "@/app/components/widgets/contract";
import RecentScansWidget from "@/app/components/widgets/RecentScansWidget";
import { createWidgetData } from "@/app/components/widgets/WidgetData";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getUserWidgets, type UserWidgets } from "@/app/lib/statsApi";

/** The counters and recent scans, from one response the overview loads for all of them. */
export const UserWidgetsData = createWidgetData("widgets", getUserWidgets);

type CounterType = "totalScans" | "safeSites" | "threats";

/** A figure from the shared response. A failed load shows "no data", not a misleading zero. */
function counter(type: CounterType, icon: string, tone: Tone, pick: (data: UserWidgets) => number): WidgetDefinition {
  function Counter() {
    const { t } = useI18n();
    const { data, loading, error } = UserWidgetsData.useData();
    return (
      <StatsCard
        icon={icon}
        tone={tone}
        label={t.widgets.names[type]}
        value={error ? null : data ? pick(data) : 0}
        loading={loading && !data}
      />
    );
  }
  return { size: "1x1", name: (t) => t.widgets.names[type], Component: Counter };
}

function Scheduled() {
  const { t } = useI18n();
  // The API does not report scheduled tests yet.
  return <StatsCard icon="ri-calendar-line" tone="violet" value={null} label={t.widgets.names.scheduled} />;
}

function RecentScans() {
  const { data, loading, error } = UserWidgetsData.useData();
  return (
    <RecentScansWidget
      scans={data?.recent_scans ?? []}
      isLoading={loading && !data}
      error={error !== null}
      viewAllHref="/dashboard/scanner"
      // The scanner lists finished scans only, so only those link there.
      scanHref={(scan) =>
        scan.status === "COMPLETED" ? `/dashboard/scanner?scan=${encodeURIComponent(scan.id)}` : undefined
      }
    />
  );
}

export type DashboardWidget =
  | "totalScans"
  | "safeSites"
  | "threats"
  | "scheduled"
  | "riskTrend"
  | "recentScans"
  | "topThreats"
  | "severity";

/** The user overview's widgets, in the order the library lists them. */
export const DASHBOARD_WIDGETS: WidgetRegistry<DashboardWidget> = {
  totalScans: counter("totalScans", "ri-search-line", "cyan", (data) => data.total_scans),
  safeSites: counter("safeSites", "ri-shield-check-line", "emerald", (data) => data.safe_sites),
  threats: counter("threats", "ri-alert-line", "rose", (data) => data.detected_threats),
  scheduled: { size: "1x1", name: (t) => t.widgets.names.scheduled, Component: Scheduled },
  riskTrend: { size: "2x2", name: (t) => t.widgets.names.riskTrend, Component: RiskTrendWidget },
  recentScans: { size: "2x2", name: (t) => t.widgets.names.recentScans, Component: RecentScans },
  topThreats: { size: "2x2", name: (t) => t.widgets.names.topThreats, Component: UserFailedTestsWidget },
  severity: { size: "2x2", name: (t) => t.widgets.names.severity, Component: SeverityWidget },
};

export const DASHBOARD_DEFAULTS: readonly DashboardWidget[] = [
  "totalScans",
  "safeSites",
  "threats",
  "scheduled",
  "riskTrend",
  "recentScans",
  "topThreats",
  "severity",
];
