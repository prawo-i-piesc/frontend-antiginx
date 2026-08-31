"use client";

import { useState } from "react";

import { useTheme } from "@/app/providers/ThemeProvider";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import useProfile from "@/app/hooks/useProfile";
import DashboardTopBar from "@/app/components/layout/DashboardTopBar";
import DashboardSidebar from "@/app/components/layout/DashboardSidebar";
import ProfileDetails from "@/app/components/profile/ProfileDetails";
import ConnectedAccounts from "@/app/components/profile/ConnectedAccounts";
import PasswordSection from "@/app/components/profile/PasswordSection";
import AccountSecurity from "@/app/components/profile/AccountSecurity";

export default function DashboardProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { authenticated, initialized, auth } = useRequireAuth();
  const { profileName } = useProfile();

  if (!initialized || !authenticated) return null;

  return (
    <div className="h-screen select-none bg-zinc-200 transition-colors xl:flex dark:bg-zinc-950">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        profileName={profileName}
        onLogout={() => auth.logout()}
        activePage="profile"
      />

      <div className="flex min-h-screen flex-1 flex-col xl:ml-0">
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          showSearch
          showNotifications
          showMessages
        />

        <main className="scrollbar-theme flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950">
          <div className="mx-auto p-3 sm:p-6">
            <div className="animate-in fade-in duration-300">
              <header className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Profile Settings
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Manage your personal information and account security
                </p>
              </header>

              <div className="flex flex-col gap-6">
                <ProfileDetails />
                <ConnectedAccounts />
                <PasswordSection />
                <AccountSecurity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
