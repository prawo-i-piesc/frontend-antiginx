"use client";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import { PAGE_PADDING } from "@/app/components/layout/PageHeader";
import { ADMIN_DEFAULTS, ADMIN_WIDGETS, AdminWidgetsData } from "@/app/components/widgets/adminWidgets";
import WidgetBoard from "@/app/components/widgets/WidgetBoard";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function AdminPage() {
  return (
    <AdminFrame activePage="overview">
      <AdminWidgetsData.Provider>
        <Overview />
      </AdminWidgetsData.Provider>
    </AdminFrame>
  );
}

function Overview() {
  const { t } = useI18n();
  const { error, reload } = AdminWidgetsData.useData();

  if (error?.kind === "forbidden") {
    return (
      <div className={PAGE_PADDING}>
        <NoAccess />
      </div>
    );
  }

  return (
    <WidgetBoard
      storageKey="admin.widgets"
      registry={ADMIN_WIDGETS}
      defaults={ADMIN_DEFAULTS}
      title={t.adminOverview.title}
      description={t.adminOverview.description}
      error={error ? t.adminOverview.loadError : null}
      onRetry={reload}
    />
  );
}
