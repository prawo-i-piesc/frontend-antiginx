"use client";

import StatsCard from "@/app/components/interface/StatsCard";
import type { Tone } from "@/app/components/ui/surface";
import { FailedTestsWidget } from "@/app/components/widgets/ChartWidgets";
import type { WidgetDefinition, WidgetRegistry } from "@/app/components/widgets/contract";
import RecentScansWidget from "@/app/components/widgets/RecentScansWidget";
import { createWidgetData } from "@/app/components/widgets/WidgetData";
import { ChartMeta } from "@/app/components/charts/StatsCharts";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getFailedTests, getWidgets, type AdminWidgets } from "@/app/lib/adminApi";

/** The counters and recent scans, from one response the overview loads for all of them. */
export const AdminWidgetsData = createWidgetData("admin:widgets", getWidgets);

type CounterType = "totalUsers" | "activeScans" | "threats" | "newRegistrations";

function counter(
  type: CounterType,
  icon: string,
  tone: Tone,
  pick: (data: AdminWidgets) => number,
  hint?: (t: ReturnType<typeof useI18n>["t"]) => string,
): WidgetDefinition {
  function Counter() {
    const { t } = useI18n();
    const { data, loading, error } = AdminWidgetsData.useData();
    return (
      <StatsCard
        icon={icon}
        tone={tone}
        label={t.widgets.names[type]}
        // A failed load shows "no data", not a misleading zero.
        value={error ? null : data ? pick(data) : 0}
        loading={loading && !data}
        hint={hint?.(t)}
      />
    );
  }
  return { size: "1x1", name: (t) => t.widgets.names[type], Component: Counter };
}

function RecentScans() {
  const { data, loading, error } = AdminWidgetsData.useData();
  return (
    <RecentScansWidget
      scans={data?.recent_scans ?? []}
      isLoading={loading && !data}
      error={error !== null}
      viewAllHref="/admin/scans"
      scanHref={(scan) => `/admin/scans?scan=${encodeURIComponent(scan.id)}`}
    />
  );
}

/** Free and premium scans of every account. */
function PlatformFailedTests() {
  const { t } = useI18n();
  return (
    <FailedTestsWidget
      title={t.widgets.names.failedChecks}
      queryKey="admin:widget:tests"
      load={getFailedTests}
      action={<ChartMeta>{t.widgets.failedChecks.scope}</ChartMeta>}
    />
  );
}

export type AdminWidget = "totalUsers" | "newRegistrations" | "activeScans" | "threats" | "recentScans" | "failedChecks";

/** The admin overview's widgets, in the order the library lists them. */
export const ADMIN_WIDGETS: WidgetRegistry<AdminWidget> = {
  totalUsers: counter("totalUsers", "ri-group-line", "violet", (data) => data.total_users),
  newRegistrations: counter(
    "newRegistrations",
    "ri-user-add-line",
    "emerald",
    (data) => data.new_users,
    (t) => t.widgets.newRegistrations.window,
  ),
  activeScans: counter("activeScans", "ri-scan-line", "cyan", (data) => data.all_time_scans),
  threats: counter("threats", "ri-alert-line", "rose", (data) => data.detected_threats),
  recentScans: { size: "2x2", name: (t) => t.widgets.names.recentScans, Component: RecentScans },
  failedChecks: { size: "2x2", name: (t) => t.widgets.names.failedChecks, Component: PlatformFailedTests },
};

export const ADMIN_DEFAULTS: readonly AdminWidget[] = [
  "totalUsers",
  "newRegistrations",
  "activeScans",
  "threats",
  "recentScans",
  "failedChecks",
];
