"use client";

import Link from "next/link";
import NavLink from "@/app/components/interface/NavLink";

type AdminSidebarProps = {
  sidebarOpen: boolean;
  profileName?: string | null;
  onLogout: () => void;
  activePage: "overview" | "database" | "settings" | "logs" | "analytics" | "profile";
};

function formatAdminName(profileName?: string | null) {
  if (!profileName) return "Admin";
  const [firstName, lastName] = profileName.split(" ");
  if (!lastName) return firstName;
  return `${firstName} ${lastName[0]}.`;
}

export default function AdminSidebar({ sidebarOpen, profileName, onLogout, activePage }: AdminSidebarProps) {
  return (
    <aside
      className={`fixed xl:static top-0 left-0 z-50 w-70 h-screen xl:h-full backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/60 flex flex-col transition-all duration-300 ease-in-out shadow-xl xl:shadow-none ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      }`}
    >
      {/* Logo */}
      <div className="h-20 px-6 border-b border-zinc-200/60 bg-white/90 dark:bg-zinc-950/80 dark:border-zinc-800/40 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <img src="/logotype.png" alt="AntiGinx Logo" className="h-7 w-auto invert dark:invert-0 transition-transform group-hover:scale-105" />
        </Link>
        <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl scrollbar-theme">
        <div className="mb-8">
          <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">MANAGEMENT</h3>
          <ul className="space-y-1">
            <li><NavLink href="/admin" icon="ri-shield-star-line" label="Overview" isActive={activePage === "overview"} /></li>
            {/*<li><NavLink href="/admin/users" icon="ri-group-line" label="Users" /></li>*/}
            <li><NavLink href="/admin/database" icon="ri-database-2-line" label="Database" isActive={activePage === "database"} /></li>
            {/*<li><NavLink href="/admin/reports" icon="ri-file-chart-line" label="Reports" /></li>*/}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">SYSTEM</h3>
          <ul className="space-y-1">
            {/*<li><NavLink href="/admin/logs" icon="ri-terminal-box-line" label="Audit Logs" isActive={activePage === "logs"} /></li>*/}
            {/*<li><NavLink href="/admin/analytics" icon="ri-bar-chart-2-line" label="Analytics" isActive={activePage === "analytics"} /></li>*/}
            <li><NavLink href="/dashboard" icon="ri-dashboard-line" label="User Dashboard" /></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 px-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">OTHERS</h3>
          <ul className="space-y-1">
            <li><NavLink href="/dashboard/profile" icon="ri-user-line" label="Profile" isActive={activePage === "profile"} /></li>
          </ul>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="px-4 py-4 border-t border-zinc-200/60 dark:border-zinc-800/40 bg-white/90 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {formatAdminName(profileName)}
              </div>
              <div className="text-xs text-cyan-500 dark:text-cyan-400 font-medium">Administrator</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-200 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <i className="ri-logout-box-line text-base" />
            <span className="text-xs font-medium ">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}