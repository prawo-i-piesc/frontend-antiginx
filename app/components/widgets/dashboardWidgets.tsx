"use client";

import type { ReactNode } from "react";

import StatsCard from "@/app/components/interface/StatsCard";
import type { Tone } from "@/app/components/ui/surface";
import {
  DomainRiskWidget,
  RiskData,
  RiskTrendWidget,
  SeverityData,
  SeverityWidget,
  UserFailedTestsWidget,
  UserTestsData,
} from "@/app/components/widgets/ChartWidgets";
import type { WidgetDefinition, WidgetRegistry } from "@/app/components/widgets/contract";
import RecentScansWidget from "@/app/components/widgets/RecentScansWidget";
import { createWidgetData } from "@/app/components/widgets/WidgetData";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { Messages } from "@/app/i18n/messages/en";
import { getSummary, getUserWidgets, type StatsSummary, type UserWidgets } from "@/app/lib/statsApi";

/** Recent scans and the all-time counters, from one response the overview loads for all of them. */
export const UserWidgetsData = createWidgetData("widgets", getUserWidgets);

/** The overview's figures: the same 30 days as its charts. */
const SummaryData = createWidgetData("widget:summary:30", (signal) => getSummary({ days: 30 }, signal), { lazy: true });

/**
 * Everything the overview's widgets share, loaded once for the whole board.
 * Lazy sources load only while one of their widgets is rendered.
 */
export function DashboardData({ children }: { children: ReactNode }) {
  return (
    <UserWidgetsData.Provider>
      <SummaryData.Provider>
        <RiskData.Provider>
          <SeverityData.Provider>
            <UserTestsData.Provider>{children}</UserTestsData.Provider>
          </SeverityData.Provider>
        </RiskData.Provider>
      </SummaryData.Provider>
    </UserWidgetsData.Provider>
  );
}

/** Every source's state, for the overview's error banner and its retry. */
export function useDashboardDataStatus() {
  return [
    UserWidgetsData.useStatus(),
    SummaryData.useStatus(),
    RiskData.useStatus(),
    SeverityData.useStatus(),
    UserTestsData.useStatus(),
  ];
}

type CounterType = "totalScans" | "averageRisk" | "domains" | "failedTests" | "safeSites" | "threats";

type Format = ReturnType<typeof useI18n>["format"];

interface Figure {
  value: number | null;
  unit?: string;
  hint?: string;
}

/**
 * A figure from one of the shared responses. A failed load shows "no data",
 * not a misleading zero.
 */
function counter<T>(
  type: CounterType,
  icon: string,
  tone: Tone,
  source: { useData: () => { data?: T; loading: boolean; error: unknown } },
  pick: (data: T, messages: Messages, format: Format) => Figure,
): WidgetDefinition {
  function Counter() {
    const { t, format } = useI18n();
    const { data, loading, error } = source.useData();
    const figure = data ? pick(data, t, format) : null;
    return (
      <StatsCard
        icon={icon}
        tone={tone}
        label={t.widgets.names[type]}
        value={error ? null : figure ? figure.value : 0}
        unit={figure?.value === null ? undefined : figure?.unit}
        hint={error ? undefined : figure?.hint}
        loading={loading && !data}
      />
    );
  }
  return { size: "1x1", name: (t) => t.widgets.names[type], Component: Counter };
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
  | "averageRisk"
  | "domains"
  | "failedTests"
  | "riskTrend"
  | "domainRisk"
  | "recentScans"
  | "topThreats"
  | "severity"
  | "safeSites"
  | "threats";

/** The user overview's widgets, in the order the library lists them. */
export const DASHBOARD_WIDGETS: WidgetRegistry<DashboardWidget> = {
  totalScans: counter("totalScans", "ri-search-line", "cyan", SummaryData, (data: StatsSummary, t) => {
    const inProgress = data.scans.pending + data.scans.running;
    return {
      value: data.scans.total,
      hint: inProgress > 0 ? t.widgets.kpi.inProgress(inProgress) : t.widgets.kpi.noneInProgress,
    };
  }),
  averageRisk: counter("averageRisk", "ri-pulse-line", "amber", SummaryData, (data: StatsSummary, t) => ({
    value: data.risk.average,
    unit: t.charts.kpi.outOf,
    hint: t.widgets.kpi.window,
  })),
  domains: counter("domains", "ri-global-line", "sky", SummaryData, (data: StatsSummary, t) => ({
    value: data.domains,
    hint: t.widgets.kpi.window,
  })),
  failedTests: counter("failedTests", "ri-close-circle-line", "rose", SummaryData, (data: StatsSummary, t, format) => ({
    value: data.tests.failed,
    hint: t.widgets.kpi.failedOf(format.number(data.tests.run)),
  })),
  riskTrend: { size: "2x2", name: (t) => t.widgets.names.riskTrend, Component: RiskTrendWidget },
  domainRisk: { size: "2x2", name: (t) => t.widgets.names.domainRisk, Component: DomainRiskWidget },
  recentScans: { size: "2x1", name: (t) => t.widgets.names.recentScans, Component: RecentScans },
  topThreats: { size: "2x1", name: (t) => t.widgets.names.topThreats, Component: UserFailedTestsWidget },
  severity: { size: "2x2", name: (t) => t.widgets.names.severity, Component: SeverityWidget },
  safeSites: counter("safeSites", "ri-shield-check-line", "emerald", UserWidgetsData, (data: UserWidgets) => ({
    value: data.safe_sites,
  })),
  threats: counter("threats", "ri-alert-line", "rose", UserWidgetsData, (data: UserWidgets) => ({
    value: data.detected_threats,
  })),
};

/**
 * What a new account sees, four columns by four rows: the figures, then the
 * risk line beside the domains that carry the most of it, then the latest
 * scans beside the checks that fail most often.
 */
export const DASHBOARD_DEFAULTS: readonly DashboardWidget[] = [
  "totalScans",
  "averageRisk",
  "domains",
  "failedTests",
  "riskTrend",
  "domainRisk",
  "recentScans",
  "topThreats",
];
