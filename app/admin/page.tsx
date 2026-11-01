"use client";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import { PAGE_PADDING } from "@/app/components/layout/PageHeader";
import {
  ADMIN_DEFAULTS,
  ADMIN_WIDGETS,
  AdminData,
  AdminWidgetsData,
  useAdminDataStatus,
} from "@/app/components/widgets/adminWidgets";
import WidgetBoard from "@/app/components/widgets/WidgetBoard";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function AdminPage() {
  return (
    <AdminFrame activePage="overview">
      <AdminData>
        <Overview />
      </AdminData>
    </AdminFrame>
  );
}

function Overview() {
  const { t } = useI18n();
  // The counters always load, so their answer says whether the role is still there.
  const { error } = AdminWidgetsData.useData();
  const failed = useAdminDataStatus().filter((source) => source.error);

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
      error={failed.length > 0 ? t.adminOverview.loadError : null}
      onRetry={() => failed.forEach((source) => source.reload())}
    />
  );
}
