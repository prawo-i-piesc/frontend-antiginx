"use client";

import Link from "next/link";

import { iconButtonClass } from "@/app/components/ui/buttonStyles";
import { useI18n } from "@/app/i18n/I18nProvider";

interface DashboardMobileBarProps {
  sidebarOpen: boolean;
  /** Id of the sidebar the menu button opens, for aria-controls. */
  sidebarId: string;
  onToggleSidebar: () => void;
  menuButtonRef?: React.Ref<HTMLButtonElement>;
}

/**
 * Below lg, where the sidebar is a drawer: the button that opens it, and the
 * logo it would otherwise take off screen. From lg up there is no bar at all;
 * the sidebar holds everything and pages start at the top.
 */
export default function DashboardMobileBar({
  sidebarOpen,
  sidebarId,
  onToggleSidebar,
  menuButtonRef,
}: DashboardMobileBarProps) {
  const { t } = useI18n();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-2 sm:px-4 lg:hidden dark:border-zinc-800/60 dark:bg-zinc-950/90">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onToggleSidebar}
        className={iconButtonClass("ghost")}
        aria-label={t.shell.menu}
        aria-expanded={sidebarOpen}
        aria-controls={sidebarId}
      >
        <i className="ri-menu-line text-lg" aria-hidden="true" />
      </button>
      <Link href="/" className="flex items-center rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logotype.png" alt={t.common.homeLink} className="h-6 w-auto invert dark:invert-0" />
      </Link>
    </header>
  );
}
