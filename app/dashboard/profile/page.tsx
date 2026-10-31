"use client";

import { Suspense } from "react";

import useRequireAuth from "@/app/hooks/useRequireAuth";
import DashboardShell from "@/app/components/layout/DashboardShell";
import PageHeader from "@/app/components/layout/PageHeader";
import PagePending from "@/app/components/layout/PagePending";
import ProfileDetails from "@/app/components/profile/ProfileDetails";
import ConnectedAccounts from "@/app/components/profile/ConnectedAccounts";
import PlanSection from "@/app/components/profile/PlanSection";
import PasswordSection from "@/app/components/profile/PasswordSection";
import AccountSecurity from "@/app/components/profile/AccountSecurity";
import DangerZone from "@/app/components/profile/DangerZone";
import Preferences from "@/app/components/profile/Preferences";
import { useI18n } from "@/app/i18n/I18nProvider";

export default function DashboardProfilePage() {
  const { t } = useI18n();
  const { authenticated, initialized } = useRequireAuth();

  if (!initialized || !authenticated) return <PagePending layout="stack" />;

  return (
    <DashboardShell area="dashboard" activePage="profile">
      <div className="mx-auto p-4 sm:p-6">
        <div className="animate-in fade-in duration-300">
          {/* The same words as the document title, so the two never disagree. */}
          <PageHeader title={t.meta.titles.profile} description={t.profile.page.description} />

          <div className="flex flex-col gap-6">
            <ProfileDetails />
            <Suspense fallback={null}>
              <PlanSection />
            </Suspense>
            <Preferences />
            <Suspense fallback={null}>
              <ConnectedAccounts />
            </Suspense>
            <PasswordSection />
            <AccountSecurity />
            <DangerZone />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
