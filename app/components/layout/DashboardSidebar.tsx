"use client";

import Link from "next/link";
import { useId } from "react";

import NavLink from "@/app/components/interface/NavLink";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { Messages } from "@/app/i18n/messages";

export type DashboardArea = "dashboard" | "admin";
export type DashboardPage = "overview" | "scanner" | "charts" | "profile";
export type AdminPage = "overview" | "database" | "profile";

type LinkKey = keyof Messages["shell"]["links"];
type SectionKey = keyof Messages["shell"]["sections"];

interface NavSection {
  label: SectionKey;
  links: { href: string; icon: string; label: LinkKey; page?: DashboardPage | AdminPage }[];
}

const NAVIGATION: Record<DashboardArea, NavSection[]> = {
  dashboard: [
    {
      label: "menu",
      links: [
        { href: "/dashboard", icon: "ri-dashboard-line", label: "overview", page: "overview" },
        { href: "/dashboard/scanner", icon: "ri-search-line", label: "scanner", page: "scanner" },
        { href: "/dashboard/charts", icon: "ri-bar-chart-line", label: "charts", page: "charts" },
      ],
    },
    {
      label: "other",
      links: [{ href: "/dashboard/profile", icon: "ri-user-line", label: "profile", page: "profile" }],
    },
  ],
  admin: [
    {
      label: "management",
      links: [
        { href: "/admin", icon: "ri-shield-star-line", label: "overview", page: "overview" },
        { href: "/admin/database", icon: "ri-database-2-line", label: "database", page: "database" },
      ],
    },
    {
      label: "system",
      links: [{ href: "/dashboard", icon: "ri-dashboard-line", label: "userDashboard" }],
    },
    {
      label: "other",
      links: [{ href: "/dashboard/profile", icon: "ri-user-line", label: "profile", page: "profile" }],
    },
  ],
};

function shortName(profileName: string | null | undefined, fallback: string) {
  if (!profileName) return fallback;
  const [firstName, lastName] = profileName.split(" ");
  if (!lastName) return firstName;
  return `${firstName} ${lastName[0]}.`;
}

type DashboardSidebarProps = {
  id: string;
  area: DashboardArea;
  activePage: DashboardPage | AdminPage;
  /** Slid in on screens narrower than xl; always shown from xl up. */
  open: boolean;
  /** True while it is open as a drawer over the page, which is then a modal dialog. */
  drawer: boolean;
  onClose: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
  profileName?: string | null;
  onLogout: () => void;
};

export default function DashboardSidebar({
  id,
  area,
  activePage,
  open,
  drawer,
  onClose,
  closeButtonRef,
  profileName,
  onLogout,
}: DashboardSidebarProps) {
  const { t } = useI18n();
  const labelPrefix = useId();
  const isAdmin = area === "admin";

  return (
    <div
      id={id}
      role={drawer ? "dialog" : undefined}
      aria-modal={drawer ? true : undefined}
      aria-label={drawer ? t.shell.menu : undefined}
      // Closed on a narrow screen it is off-canvas; `invisible` also takes it
      // out of the tab order and the accessibility tree, so the keyboard does
      // not wander through links nobody can see. Visibility is only animated
      // on the way out: on the way in it has to switch at once, or the first
      // frame is still hidden and focus cannot move into the drawer.
      className={`fixed xl:static top-0 left-0 z-50 w-70 h-screen xl:h-full backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/60 flex flex-col duration-300 ease-in-out shadow-xl xl:shadow-none ${
        open
          ? "visible translate-x-0 transition-transform"
          : "invisible -translate-x-full transition-[translate,visibility] xl:visible xl:translate-x-0"
      }`}
    >
      <div className="h-20 px-6 border-b border-zinc-200/60 bg-white/90 dark:bg-zinc-950/80 dark:border-zinc-800/40 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center group rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logotype.png"
            alt={t.common.homeLink}
            className="h-7 w-auto invert dark:invert-0 transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
            {isAdmin ? t.shell.adminBadge : t.shell.dashboardBadge}
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t.shell.closeMenu}
            className="xl:hidden flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
          >
            <i className="ri-close-line text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        aria-label={isAdmin ? t.shell.adminNav : t.shell.dashboardNav}
        className="flex-1 px-4 py-6 overflow-y-auto bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl scrollbar-theme"
      >
        {NAVIGATION[area].map((section, index) => {
          const labelId = `${labelPrefix}-${section.label}`;
          return (
            <div key={section.label} className={index > 0 ? "mt-8" : undefined}>
              <p
                id={labelId}
                className="mb-3 px-1 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.18em]"
              >
                {t.shell.sections[section.label]}
              </p>
              <ul aria-labelledby={labelId} className="space-y-1.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      icon={link.icon}
                      label={t.shell.links[link.label]}
                      isActive={link.page !== undefined && link.page === activePage}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-200/60 dark:border-zinc-800/40 bg-white/90 dark:bg-zinc-950/80">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {shortName(profileName, isAdmin ? t.shell.defaultAdminName : t.shell.defaultUserName)}
            </p>
            <p
              className={
                isAdmin
                  ? "text-xs font-medium text-cyan-700 dark:text-cyan-400"
                  : "text-xs text-zinc-600 dark:text-zinc-400"
              }
            >
              {isAdmin ? t.shell.administrator : t.shell.plan}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-200 hover:text-red-700 dark:hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <i className="ri-logout-box-line text-base" aria-hidden="true" />
            <span className="text-xs font-medium">{t.shell.logout}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
