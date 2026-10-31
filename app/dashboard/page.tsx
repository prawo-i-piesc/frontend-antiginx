"use client";

import DashboardShell from "@/app/components/layout/DashboardShell";
import PagePending from "@/app/components/layout/PagePending";
import { DASHBOARD_DEFAULTS, DASHBOARD_WIDGETS, UserWidgetsData } from "@/app/components/widgets/dashboardWidgets";
import WidgetBoard from "@/app/components/widgets/WidgetBoard";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function DashboardPage() {
  const { authenticated, initialized } = useRequireAuth();

  if (!initialized || !authenticated) return <PagePending layout="widgets" />;

  return (
    <DashboardShell area="dashboard" activePage="overview">
      <UserWidgetsData.Provider>
        <Overview />
      </UserWidgetsData.Provider>
    </DashboardShell>
  );
}

function Overview() {
  const { t } = useI18n();
  const { error, reload } = UserWidgetsData.useData();

  return (
    <WidgetBoard
      storageKey="dashboard.widgets"
      registry={DASHBOARD_WIDGETS}
      defaults={DASHBOARD_DEFAULTS}
      title={t.dashboard.title}
      description={t.dashboard.description}
      error={error ? t.dashboard.loadError : null}
      onRetry={reload}
    />
  );
}
