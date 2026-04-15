"use client";

import Link from "next/link";
import NavLink from "@/app/components/interface/NavLink";

type DashboardSidebarProps = {
  sidebarOpen: boolean;
  profileName?: string | null;
  onLogout: () => void;
  activePage: "overview" | "scanner";
};

function formatDisplayName(profileName?: string | null) {
  if (!profileName) return "User";
  const [firstName, lastName] = profileName.split(" ");
  if (!lastName) return firstName;
  return `${firstName} ${lastName[0]}.`;
}

export default function DashboardSidebar({ sidebarOpen, profileName, onLogout, activePage }: DashboardSidebarProps) {
  return (
    <aside
      className={`fixed xl:static top-0 left-0 z-50 w-70 h-screen xl:h-full backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/60 flex flex-col transition-all duration-300 ease-in-out shadow-xl xl:shadow-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      }`}
    >
      <div className="h-20 px-6 border-b border-zinc-200/60 bg-white/90 dark:bg-zinc-950/80 dark:border-zinc-800/40 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <img src="/logotype.png" alt="AntiGinx Logo" className="h-7 w-auto invert dark:invert-0 transition-transform group-hover:scale-105" />
        </Link>
        <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Dashboard
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 overflow-y-auto bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl">
        <div className="mb-3 px-1">
          <h3 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.18em]">Menu</h3>
        </div>
        <ul className="space-y-1.5">
          <li><NavLink href="/dashboard" icon="ri-dashboard-line" label="Overview" isActive={activePage === "overview"} /></li>
          <li><NavLink href="/dashboard/scanner" icon="ri-search-line" label="Scanner" isActive={activePage === "scanner"} /></li>
          <li className="opacity-50"><NavLink href="/dashboard" icon="ri-bar-chart-line" label="Charts" /></li>
        </ul>
        <div className="mb-3 mt-8 px-1">
          <h3 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.18em]">Other</h3>
        </div>
        <ul className="space-y-1.5 opacity-50">
          <li><NavLink href="/dashboard" icon="ri-user-line" label="Profile" /></li>
          <li><NavLink href="/dashboard" icon="ri-settings-line" label="Settings" /></li>
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-zinc-200/60 dark:border-zinc-800/40 bg-white/90 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {formatDisplayName(profileName)}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-500">Premium</div>
          </div>
          <button
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-200 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <i className="ri-logout-box-line text-base" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}