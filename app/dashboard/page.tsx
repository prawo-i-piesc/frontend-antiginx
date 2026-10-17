"use client";

import { useEffect, useState } from "react";

import StatsCard from "@/app/components/interface/StatsCard";
import DashboardShell from "@/app/components/layout/DashboardShell";
import RecentScansWidget from "@/app/components/widgets/RecentScansWidget";
import TopThreatsWidget from "@/app/components/widgets/TopThreatsWidget";
import WidgetBoard from "@/app/components/widgets/WidgetBoard";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import type { WidgetConfig } from "@/app/hooks/useWidgetLayout";
import { useI18n } from "@/app/i18n/I18nProvider";
import { authorizedFetch } from "@/app/lib/session";

/** GET /api/users/widgets */
interface ApiScanData {
  id: string;
  target_url: string;
  status: string;
  created_at: string;
  type: string;
}

interface UserWidgetsData {
  detected_threats: number;
  recent_scans: ApiScanData[];
  safe_sites: number;
  total_scans: number;
}

type WidgetType = "totalScans" | "safeSites" | "threats" | "scheduled" | "recentScans" | "topThreats";

const WIDGET_LIBRARY: readonly WidgetConfig<WidgetType>[] = [
  { id: "totalScans", type: "totalScans", size: "1x1" },
  { id: "safeSites", type: "safeSites", size: "1x1" },
  { id: "threats", type: "threats", size: "1x1" },
  { id: "scheduled", type: "scheduled", size: "1x1" },
  { id: "recentScans", type: "recentScans", size: "2x2" },
  { id: "topThreats", type: "topThreats", size: "2x2" },
];

const DEFAULT_WIDGETS = WIDGET_LIBRARY;

export default function DashboardPage() {
  const { t } = useI18n();
  const { authenticated, initialized } = useRequireAuth();

  const [data, setData] = useState<UserWidgetsData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    const fetchWidgetData = async () => {
      try {
        const response = await authorizedFetch("/api/users/widgets");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json: UserWidgetsData = await response.json();
        if (!active) return;
        setData(json);
        setStatus("ready");
      } catch (error) {
        console.error("Error fetching widgets data:", error);
        if (active) setStatus("error");
      }
    };

    void fetchWidgetData();
    return () => {
      active = false;
    };
  }, [authenticated, attempt]);

  if (!initialized) return null;
  if (!authenticated) return null;

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
      case "totalScans":
        return (
          <StatsCard
            icon="ri-search-line"
            iconColor="text-cyan-400"
            iconBgColor="bg-cyan-500/10"
            value={count(data?.total_scans)}
            loading={loading}
            label={label}
          />
        );
      case "safeSites":
        return (
          <StatsCard
            icon="ri-shield-check-line"
            iconColor="text-green-400"
            iconBgColor="bg-green-500/10"
            value={count(data?.safe_sites)}
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
      case "scheduled":
        // The API does not report scheduled tests yet.
        return (
          <StatsCard
            icon="ri-calendar-line"
            iconColor="text-purple-400"
            iconBgColor="bg-purple-500/10"
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
            viewAllHref="/dashboard/scanner"
          />
        );
      case "topThreats":
        return <TopThreatsWidget />;
      default:
        return null;
    }
  }

  return (
    <DashboardShell area="dashboard" activePage="overview">
      <WidgetBoard
        storageKey="dashboard.widgets"
        library={WIDGET_LIBRARY}
        defaults={DEFAULT_WIDGETS}
        title={t.dashboard.title}
        description={t.dashboard.description}
        widgetName={(type) => t.widgets.names[type]}
        renderWidget={renderWidget}
        error={status === "error" ? t.dashboard.loadError : null}
        onRetry={retry}
      />
    </DashboardShell>
  );
}
