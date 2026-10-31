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
import useSidebarPreference from "@/app/hooks/useSidebarPreference";
import { useAuth } from "@/app/providers/AuthProvider";

const SIDEBAR_ID = "dashboard-sidebar";

/** Tailwind's lg breakpoint, from which the sidebar is always on screen. */
const DESKTOP_QUERY = "(min-width: 1024px)";
/** Tailwind's xl: wide enough for the full sidebar until the person says otherwise. */
const WIDE_QUERY = "(min-width: 1280px)";

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
 * From lg up the sidebar sits beside the page, full or collapsed to a rail of
 * icons; the choice is remembered, and until it is made the rail is used
 * below xl, where the full sidebar would take a quarter of the screen. <main>
 * is a size container, so pages lay themselves out for the room they really
 * have rather than for the window.
 *
 * Below lg the sidebar is a drawer, and while open it behaves like a modal
 * dialog: focus moves into it, the page behind is inert, Escape or a tap on
 * the backdrop closes it, and focus returns to the menu button.
 */
export default function DashboardShell({ area, activePage, mainClassName = "", children }: DashboardShellProps) {
  const { logout, user } = useAuth();
  const { profileName, profilePlan } = useProfile();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isWide = useMediaQuery(WIDE_QUERY);
  const drawerOpen = sidebarOpen && !isDesktop;
  // Widened past lg with the drawer open: it is not needed beside the page,
  // and must not pop back open if the window narrows again.
  if (isDesktop && sidebarOpen) setSidebarOpen(false);

  const [preference, setCollapsed] = useSidebarPreference();
  const collapsed = isDesktop && (preference ?? (isWide ? "expanded" : "collapsed")) === "collapsed";

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
    <div className="h-dvh bg-zinc-200 transition-colors lg:flex dark:bg-zinc-950">
      <DashboardSidebar
        id={SIDEBAR_ID}
        area={area}
        activePage={activePage}
        open={drawerOpen}
        drawer={drawerOpen}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
        onClose={closeDrawer}
        closeButtonRef={closeButtonRef}
        profileName={profileName}
        profilePlan={profilePlan}
        canAdminister={user?.role === "admin"}
        onLogout={() => void logout()}
      />

      <div className="flex h-dvh min-w-0 flex-1 flex-col" inert={drawerOpen}>
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          sidebarId={SIDEBAR_ID}
          onToggleSidebar={() => (sidebarOpen ? closeDrawer() : setSidebarOpen(true))}
          menuButtonRef={menuButtonRef}
        />

        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className={`@container flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 scrollbar-theme focus:outline-none ${mainClassName}`}
        >
          {children}
        </main>
      </div>

      {drawerOpen ? (
        <div
          aria-hidden="true"
          className="animate-fade-in fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden dark:bg-black/60"
          onClick={closeDrawer}
        />
      ) : null}
    </div>
  );
}

export type { DashboardArea, DashboardPage, AdminPage };
