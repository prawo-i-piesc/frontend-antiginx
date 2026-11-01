"use client";

import Link from "next/link";
import { useId } from "react";

import NavLink from "@/app/components/interface/NavLink";
import { iconButtonClass } from "@/app/components/ui/buttonStyles";
import RailTooltip from "@/app/components/ui/RailTooltip";
import { useI18n } from "@/app/i18n/I18nProvider";
import type { Messages } from "@/app/i18n/messages";
import type { Plan } from "@/app/lib/billingApi";
import { useTheme } from "@/app/providers/ThemeProvider";

export type DashboardArea = "dashboard" | "admin";
export type DashboardPage = "overview" | "scanner" | "charts" | "profile";
export type AdminPage = "overview" | "users" | "scans" | "system" | "profile";

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
        { href: "/admin/users", icon: "ri-group-line", label: "users", page: "users" },
        { href: "/admin/scans", icon: "ri-radar-line", label: "scans", page: "scans" },
        { href: "/admin/system", icon: "ri-pulse-line", label: "system", page: "system" },
      ],
    },
    {
      label: "other",
      links: [{ href: "/dashboard/profile", icon: "ri-user-line", label: "profile", page: "profile" }],
    },
  ],
};

const SWITCH_FRAME =
  "mb-6 grid gap-0.5 rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900";
const SEGMENT = "flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium";
const SEGMENT_CURRENT = "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100";

/** Where each area starts, for the switch between them. */
const AREA_HOME: Record<DashboardArea, { href: string; icon: string; link: LinkKey }> = {
  dashboard: { href: "/dashboard", icon: "ri-dashboard-line", link: "userDashboard" },
  admin: { href: "/admin", icon: "ri-shield-star-line", link: "adminPanel" },
};

function shortName(profileName: string | null | undefined, fallback: string) {
  if (!profileName) return fallback;
  const [firstName, lastName] = profileName.split(" ");
  if (!lastName) return firstName;
  return `${firstName} ${lastName[0]}.`;
}

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]);
  return letters.join("").toUpperCase();
}

type DashboardSidebarProps = {
  id: string;
  area: DashboardArea;
  activePage: DashboardPage | AdminPage;
  /** Slid in on screens narrower than lg; always shown from lg up. */
  open: boolean;
  /** True while it is open as a drawer over the page, which is then a modal dialog. */
  drawer: boolean;
  /** From lg up: a thin rail of icons instead of the full sidebar. Never in the drawer. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onClose: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
  profileName?: string | null;
  profilePlan?: Plan;
  /** The signed-in account has the admin role. */
  canAdminister?: boolean;
  onLogout: () => void;
};

export default function DashboardSidebar({
  id,
  area,
  activePage,
  open,
  drawer,
  collapsed,
  onToggleCollapsed,
  onClose,
  closeButtonRef,
  profileName,
  profilePlan = "free",
  canAdminister = false,
  onLogout,
}: DashboardSidebarProps) {
  const { t } = useI18n();
  const labelPrefix = useId();
  const navId = useId();
  const isAdmin = area === "admin";
  const name = shortName(profileName, isAdmin ? t.shell.defaultAdminName : t.shell.defaultUserName);
  const role = isAdmin ? t.shell.administrator : t.shell.plans[profilePlan];

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
      className={`fixed top-0 left-0 z-50 flex h-dvh w-70 shrink-0 flex-col border-r border-zinc-200/80 bg-white/95 shadow-xl backdrop-blur-2xl duration-200 ease-out motion-reduce:transition-none lg:static lg:h-full lg:bg-white/90 lg:shadow-none dark:border-zinc-800/60 dark:bg-zinc-950/95 lg:dark:bg-zinc-950/80 ${
        collapsed ? "lg:w-16" : "lg:w-64"
      } ${
        open
          ? "visible translate-x-0 transition-[width,translate]"
          : "invisible -translate-x-full transition-[width,translate,visibility] lg:visible lg:translate-x-0"
      }`}
    >
      <div
        className={`flex h-20 shrink-0 items-center border-b border-zinc-200/60 dark:border-zinc-800/40 ${
          collapsed ? "justify-center px-2" : "justify-between gap-3 pl-5 pr-3"
        }`}
      >
        {collapsed ? (
          // In the rail the mark is the way back out: it turns into the expand
          // icon under the pointer or keyboard focus.
          <RailTooltip label={t.shell.expandSidebar}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={t.shell.expandSidebar}
              aria-expanded={false}
              aria-controls={navId}
              className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            >
              <span className="block w-4.5 overflow-hidden transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logotype.png" alt="" className="h-7 w-auto max-w-none invert dark:invert-0" />
              </span>
              <i
                className="ri-sidebar-unfold-line absolute text-lg text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-zinc-300"
                aria-hidden="true"
              />
            </button>
          </RailTooltip>
        ) : (
          <>
            <Link href="/" className="group flex items-center rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logotype.png"
                alt={t.common.homeLink}
                className="h-7 w-auto invert transition-transform group-hover:scale-105 dark:invert-0"
              />
            </Link>
            {/* The drawer closes; the sidebar beside the page folds to a rail. */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={t.shell.closeMenu}
              className={`${iconButtonClass("ghost")} lg:hidden`}
            >
              <i className="ri-close-line" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={t.shell.collapseSidebar}
              title={t.shell.collapseSidebar}
              aria-expanded={true}
              aria-controls={navId}
              className={`${iconButtonClass("ghost")} max-lg:hidden`}
            >
              <i className="ri-sidebar-fold-line" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <nav
        id={navId}
        aria-label={isAdmin ? t.shell.adminNav : t.shell.dashboardNav}
        className={`flex-1 overflow-x-hidden overflow-y-auto py-4 scrollbar-theme ${collapsed ? "px-3" : "px-4"}`}
      >
        <AreaSwitch area={area} collapsed={collapsed} switchable={canAdminister || isAdmin} />

        {NAVIGATION[area].map((section, index) => {
          const labelId = `${labelPrefix}-${section.label}`;
          return (
            <div
              key={section.label}
              className={
                index === 0
                  ? undefined
                  : collapsed
                    ? "mt-3 border-t border-zinc-200/80 pt-3 dark:border-zinc-800/60"
                    : "mt-7"
              }
            >
              {/* In the rail the heading is for screen readers only; a rule separates the groups. */}
              <p
                id={labelId}
                className={
                  collapsed
                    ? "sr-only"
                    : "mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400"
                }
              >
                {t.shell.sections[section.label]}
              </p>
              <ul aria-labelledby={labelId} className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      icon={link.icon}
                      label={t.shell.links[link.label]}
                      isActive={link.page !== undefined && link.page === activePage}
                      collapsed={collapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className={`shrink-0 border-t border-zinc-200/60 py-3 dark:border-zinc-800/40 ${collapsed ? "px-3" : "px-4"}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            {/* Who is signed in: initials on screen, the name in a tooltip and for screen readers. */}
            <RailTooltip label={`${name} · ${role}`}>
              <span className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <span aria-hidden="true">{initials(name)}</span>
                <span className="sr-only">{`${name}, ${role}`}</span>
              </span>
            </RailTooltip>
            <AccountControls side="right" onLogout={onLogout} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
              {isAdmin ? (
                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{role}</p>
              ) : (
                // The plan leads to the plans, to compare or move up.
                <Link
                  href="/pricing"
                  className="block truncate text-xs text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {role}
                  <span className="sr-only">. {t.shell.seePlans}</span>
                </Link>
              )}
            </div>
            <div className="flex shrink-0 items-center">
              <AccountControls side="top" onLogout={onLogout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The controls that belong to the person rather than the page: theme,
 * notifications and signing out. They live by the account at the foot of the
 * sidebar, so there is no top bar and every page starts at the top. Icons
 * only, named in a tooltip and for screen readers.
 */
function AccountControls({ side, onLogout }: { side: "right" | "top"; onLogout: () => void }) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const themeLabel = theme === "dark" ? t.shell.lightTheme : t.shell.darkTheme;

  return (
    <>
      <RailTooltip label={themeLabel} side={side}>
        <button
          type="button"
          onClick={(event) => toggleTheme(event)}
          aria-label={themeLabel}
          className={iconButtonClass("ghost")}
        >
          {/* What a click turns on: the sun in the dark, the moon in the light. */}
          <i className={theme === "dark" ? "ri-sun-line" : "ri-moon-line"} aria-hidden="true" />
        </button>
      </RailTooltip>
      {/* Not built yet. aria-disabled rather than disabled, so it still takes
          focus and the pointer, and the tooltip can say so. */}
      <RailTooltip label={t.shell.notifications} side={side}>
        <button
          type="button"
          aria-disabled="true"
          aria-label={t.shell.notifications}
          className={`${iconButtonClass("ghost")} aria-disabled:hover:bg-transparent aria-disabled:hover:text-zinc-700 dark:aria-disabled:hover:text-zinc-300`}
        >
          <i className="ri-notification-3-line" aria-hidden="true" />
        </button>
      </RailTooltip>
      <RailTooltip label={t.shell.logout} side={side}>
        <button
          type="button"
          onClick={onLogout}
          aria-label={t.shell.logout}
          className={`${iconButtonClass("ghost")} hover:text-red-700 dark:hover:text-red-400`}
        >
          <i className="ri-logout-box-line" aria-hidden="true" />
        </button>
      </RailTooltip>
    </>
  );
}

/**
 * For an administrator, the two halves of the app side by side: where they
 * are, and the way to the other one. In the rail, a single icon leads across.
 * Navigation only; /admin checks the role again, and so does every /api/admin
 * route on the server.
 *
 * Everyone else has the dashboard only, and sees its name in the same frame,
 * as the one segment there is: text, not a control.
 */
function AreaSwitch({
  area,
  collapsed,
  switchable,
}: {
  area: DashboardArea;
  collapsed: boolean;
  switchable: boolean;
}) {
  const { t } = useI18n();

  if (!switchable) {
    // An icon in the rail would look like a link that goes nowhere.
    if (collapsed) return null;
    return (
      <div className={`${SWITCH_FRAME} grid-cols-1`}>
        <p className={`${SEGMENT} ${SEGMENT_CURRENT}`}>
          <i className={`${AREA_HOME[area].icon} text-sm`} aria-hidden="true" />
          {t.shell.areas[area]}
        </p>
      </div>
    );
  }

  if (collapsed) {
    const other = AREA_HOME[area === "admin" ? "dashboard" : "admin"];
    return (
      <div className="mb-3 border-b border-zinc-200/80 pb-3 dark:border-zinc-800/60">
        <NavLink href={other.href} icon={other.icon} label={t.shell.links[other.link]} collapsed />
      </div>
    );
  }

  return (
    <div role="group" aria-label={t.shell.areaSwitch} className={`${SWITCH_FRAME} grid-cols-2`}>
      {(["dashboard", "admin"] as const).map((target) => {
        const current = target === area;
        return (
          <Link
            key={target}
            href={AREA_HOME[target].href}
            aria-current={current ? "true" : undefined}
            className={`${SEGMENT} transition-colors ${
              current
                ? SEGMENT_CURRENT
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <i className={`${AREA_HOME[target].icon} text-sm`} aria-hidden="true" />
            {t.shell.areas[target]}
          </Link>
        );
      })}
    </div>
  );
}
