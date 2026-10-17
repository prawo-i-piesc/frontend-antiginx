"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import StatsCard from "@/app/components/interface/StatsCard";
import DashboardShell from "@/app/components/layout/DashboardShell";
import RecentScansWidget from "@/app/components/widgets/RecentScansWidget";
import UserLocationMapWidget from "@/app/components/widgets/UserLocationMapWidget";
import WidgetBoard from "@/app/components/widgets/WidgetBoard";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import type { WidgetConfig } from "@/app/hooks/useWidgetLayout";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authorizedFetch } from "@/app/lib/session";

/** GET /api/admin/widgets */
interface ApiScanData {
  id: string;
  target_url: string;
  status: string;
  created_at: string;
  type: string;
}

interface ApiWidgetsResponse {
  all_time_scans: number;
  detected_threats: number;
  recent_scans: ApiScanData[];
  total_users: number;
}

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
  const { t } = useI18n();
  const { authenticated, initialized, auth } = useRequireAuth();

  const [data, setData] = useState<ApiWidgetsResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    const fetchWidgetsData = async () => {
      try {
        const response = await authorizedFetch("/api/admin/widgets", {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json: ApiWidgetsResponse = await response.json();
        if (!active) return;
        setData(json);
        setStatus("ready");
      } catch (error) {
        console.error("Error fetching admin widgets data:", error);
        if (active) setStatus("error");
      }
    };

    void fetchWidgetsData();
    return () => {
      active = false;
    };
  }, [authenticated, attempt]);

  if (!initialized) return null;
  if (!authenticated) return null;
  if (!auth.user) return null;
  if (auth.user.role !== "admin") notFound();

  const loading = status === "loading";
  // A failed load shows "no data", not a misleading zero.
  const count = (value: number | undefined) => (status === "error" ? null : value ?? 0);

  function retry() {
    setStatus("loading");
    setAttempt((current) => current + 1);
  }

  function renderWidget(widget: WidgetConfig<WidgetType>) {
    const label = t.widgets.names[widget.type];

    switch (widget.type) {
      case "totalUsers":
        return (
          <StatsCard
            icon="ri-group-line"
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/10"
            value={count(data?.total_users)}
            loading={loading}
            label={label}
          />
        );
      case "activeScans":
        return (
          <StatsCard
            icon="ri-scan-line"
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/10"
            value={count(data?.all_time_scans)}
            loading={loading}
            label={label}
          />
        );
      case "threats":
        return (
          <StatsCard
            icon="ri-alert-line"
            iconColor="text-red-400"
            iconBgColor="bg-red-500/10"
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
            iconColor="text-emerald-400"
            iconBgColor="bg-emerald-500/10"
            value={null}
            label={label}
          />
        );
      case "recentScans":
        return (
          <RecentScansWidget
            scans={data?.recent_scans ?? []}
            isLoading={loading}
            error={status === "error"}
            viewAllHref="/admin/database"
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
    <DashboardShell area="admin" activePage="overview">
      <WidgetBoard
        storageKey="admin.widgets"
        library={WIDGET_LIBRARY}
        defaults={DEFAULT_WIDGETS}
        title={t.adminOverview.title}
        description={t.adminOverview.description}
        widgetName={(type) => t.widgets.names[type]}
        renderWidget={renderWidget}
        error={status === "error" ? t.adminOverview.loadError : null}
        onRetry={retry}
      />
    </DashboardShell>
  );
}
