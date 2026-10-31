"use client";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import StatsCard from "@/app/components/interface/StatsCard";
import RecentScansWidget from "@/app/components/widgets/RecentScansWidget";
import UserLocationMapWidget from "@/app/components/widgets/UserLocationMapWidget";
import WidgetBoard from "@/app/components/widgets/WidgetBoard";
import useAdminQuery from "@/app/hooks/useAdminQuery";
import type { WidgetConfig } from "@/app/hooks/useWidgetLayout";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getWidgets } from "@/app/lib/adminApi";

type WidgetType = "totalUsers" | "activeScans" | "threats" | "newRegistrations" | "recentScans" | "topCountries";

const WIDGET_LIBRARY: readonly WidgetConfig<WidgetType>[] = [
  { id: "totalUsers", type: "totalUsers", size: "1x1" },
  { id: "activeScans", type: "activeScans", size: "1x1" },
  { id: "threats", type: "threats", size: "1x1" },
  { id: "newRegistrations", type: "newRegistrations", size: "1x1" },
  { id: "topCountries", type: "topCountries", size: "2x2" },
  { id: "recentScans", type: "recentScans", size: "2x2" },
];

// Top countries and new registrations have no data behind them yet, so they
// start in the library.
const DEFAULT_WIDGETS: readonly WidgetConfig<WidgetType>[] = [
  { id: "recentScans", type: "recentScans", size: "2x2" },
  { id: "totalUsers", type: "totalUsers", size: "1x1" },
  { id: "activeScans", type: "activeScans", size: "1x1" },
  { id: "threats", type: "threats", size: "1x1" },
];

export default function AdminPage() {
  return (
    <AdminFrame activePage="overview">
      <Overview />
    </AdminFrame>
  );
}

function Overview() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useAdminQuery("widgets", getWidgets);

  if (error?.kind === "forbidden") {
    return (
      <div className="p-4 sm:p-6">
        <NoAccess />
      </div>
    );
  }

  // A failed load shows "no data", not a misleading zero.
  const count = (value: number | undefined) => (error ? null : value ?? 0);

  function renderWidget(widget: WidgetConfig<WidgetType>) {
    const label = t.widgets.names[widget.type];

    switch (widget.type) {
      case "totalUsers":
        return (
          <StatsCard
            icon="ri-group-line"
            tone="violet"
            value={count(data?.total_users)}
            loading={loading}
            label={label}
          />
        );
      case "activeScans":
        return (
          <StatsCard
            icon="ri-scan-line"
            tone="cyan"
            value={count(data?.all_time_scans)}
            loading={loading}
            label={label}
          />
        );
      case "threats":
        return (
          <StatsCard
            icon="ri-alert-line"
            tone="rose"
            value={count(data?.detected_threats)}
            loading={loading}
            label={label}
          />
        );
      case "newRegistrations":
        // The API does not report registrations yet.
        return (
          <StatsCard
            icon="ri-user-add-line"
            tone="emerald"
            value={null}
            label={label}
          />
        );
      case "recentScans":
        return (
          <RecentScansWidget
            scans={data?.recent_scans ?? []}
            isLoading={loading}
            error={error !== null}
            viewAllHref="/admin/scans"
            scanHref={(scan) => `/admin/scans?scan=${encodeURIComponent(scan.id)}`}
          />
        );
      case "topCountries":
        // Sample data until the API reports user locations.
        return <UserLocationMapWidget />;
      default:
        return null;
    }
  }

  return (
    <WidgetBoard
      storageKey="admin.widgets"
      library={WIDGET_LIBRARY}
      defaults={DEFAULT_WIDGETS}
      title={t.adminOverview.title}
      description={t.adminOverview.description}
      widgetName={(type) => t.widgets.names[type]}
      renderWidget={renderWidget}
      error={error ? t.adminOverview.loadError : null}
      onRetry={reload}
    />
  );
}
