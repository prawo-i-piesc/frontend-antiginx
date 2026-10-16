"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import DashboardSidebar, {
  type AdminPage,
  type DashboardArea,
  type DashboardPage,
} from "@/app/components/layout/DashboardSidebar";
import DashboardTopBar from "@/app/components/layout/DashboardTopBar";
import { MAIN_CONTENT_ID } from "@/app/components/ui/SkipLink";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import useProfile from "@/app/hooks/useProfile";
import { useI18n } from "@/app/i18n/I18nProvider";
import { useAuth } from "@/app/providers/AuthProvider";

const SIDEBAR_ID = "dashboard-sidebar";

/** Tailwind's xl breakpoint, from which the sidebar is always on screen. */
const DESKTOP_QUERY = "(min-width: 1280px)";

type DashboardShellProps = {
  children: React.ReactNode;
  /** Classes added to <main>, e.g. "flex flex-col p-6" for a page that fills the height. */
  mainClassName?: string;
} & (
  | { area: "dashboard"; activePage: DashboardPage }
  | { area: "admin"; activePage: AdminPage }
);

/**
 * Sidebar, top bar and <main> for every page behind sign-in.
 *
 * Below xl the sidebar is a drawer, and while open it behaves like a modal
 * dialog: focus moves into it, the page behind is inert, Escape or a tap on
 * the backdrop closes it, and focus returns to the menu button.
 */
export default function DashboardShell({ area, activePage, mainClassName = "", children }: DashboardShellProps) {
  const { t } = useI18n();
  const { logout } = useAuth();
  const { profileName } = useProfile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const drawerOpen = sidebarOpen && !isDesktop;

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Focus can only go back once the page is no longer inert, which is a
  // render after the close — so the close leaves a note for the effect.
  const restoreFocus = useRef(false);

  const closeDrawer = useCallback(() => {
    restoreFocus.current = true;
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!drawerOpen) {
      if (restoreFocus.current) {
        restoreFocus.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;

      // The page behind is inert, but the skip link and the toasts live
      // outside it; Tab wraps around inside the drawer instead of reaching them.
      const drawer = document.getElementById(SIDEBAR_ID);
      const stops = drawer
        ? Array.from(drawer.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"))
        : [];
      if (stops.length === 0) return;

      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      const inside = drawer?.contains(active) ?? false;

      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, closeDrawer]);

  return (
    <div className="h-screen xl:flex bg-zinc-200 dark:bg-zinc-950 transition-colors">
      <DashboardSidebar
        id={SIDEBAR_ID}
        area={area}
        activePage={activePage}
        open={sidebarOpen}
        drawer={drawerOpen}
        onClose={closeDrawer}
        closeButtonRef={closeButtonRef}
        profileName={profileName}
        onLogout={() => void logout()}
      />

      <div className="flex-1 flex flex-col min-h-screen xl:ml-0" inert={drawerOpen}>
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          sidebarId={SIDEBAR_ID}
          onToggleSidebar={() => (sidebarOpen ? closeDrawer() : setSidebarOpen(true))}
          menuButtonRef={menuButtonRef}
          searchPlaceholder={area === "admin" ? t.shell.adminSearchPlaceholder : undefined}
        />

        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className={`flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 scrollbar-theme focus:outline-none ${mainClassName}`}
        >
          {children}
        </main>
      </div>

      {drawerOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 xl:hidden"
          onClick={closeDrawer}
        />
      ) : null}
    </div>
  );
}

export type { DashboardArea, DashboardPage, AdminPage };
