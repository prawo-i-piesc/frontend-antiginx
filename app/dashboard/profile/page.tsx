"use client";

import { Suspense } from "react";

import useRequireAuth from "@/app/hooks/useRequireAuth";
import DashboardShell from "@/app/components/layout/DashboardShell";
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

  if (!initialized || !authenticated) return null;

  return (
    <DashboardShell area="dashboard" activePage="profile">
      <div className="mx-auto p-3 sm:p-6">
        <div className="animate-in fade-in duration-300">
          <header className="mb-6">
            {/* The same words as the document title, so the two never disagree. */}
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {t.meta.titles.profile}
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {t.profile.page.description}
            </p>
          </header>

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
