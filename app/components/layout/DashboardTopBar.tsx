"use client";

import Link from "next/link";

import { useI18n } from "@/app/i18n/I18nProvider";
import { useTheme } from "@/app/providers/ThemeProvider";

interface DashboardTopBarProps {
  sidebarOpen: boolean;
  /** Id of the sidebar the menu button opens, for aria-controls. */
  sidebarId: string;
  onToggleSidebar: () => void;
  menuButtonRef?: React.Ref<HTMLButtonElement>;
}

export default function DashboardTopBar({
  sidebarOpen,
  sidebarId,
  onToggleSidebar,
  menuButtonRef,
}: DashboardTopBarProps) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const iconButtonClass =
    "group relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300/80 bg-zinc-100/80 text-zinc-600 transition-all hover:border-zinc-400 hover:bg-zinc-200/80 dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/70";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-2xl transition-colors dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-3 sm:px-5 lg:h-20 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={onToggleSidebar}
            className={`${iconButtonClass} shrink-0 cursor-pointer lg:hidden`}
            aria-label={t.shell.menu}
            aria-expanded={sidebarOpen}
            aria-controls={sidebarId}
          >
            <i className="ri-menu-line text-[18px] text-current" aria-hidden="true"></i>
          </button>

          {/* With the sidebar tucked away, the logo would otherwise be missing from the screen. */}
          <Link href="/" className="flex shrink-0 items-center rounded-md lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logotype.png" alt={t.common.homeLink} className="h-6 w-auto invert dark:invert-0" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl">
          <button
            type="button"
            onClick={(event) => toggleTheme(event)}
            className={`${iconButtonClass} cursor-pointer`}
            aria-label={t.shell.darkMode}
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? (
              <i className="ri-moon-line text-[17px] transition-colors group-hover:text-cyan-500 dark:group-hover:text-cyan-400" aria-hidden="true"></i>
            ) : (
              <i className="ri-sun-line text-[17px] transition-colors group-hover:text-cyan-700" aria-hidden="true"></i>
            )}
          </button>

          <button
            type="button"
            className={`${iconButtonClass} cursor-not-allowed opacity-50`}
            aria-label={t.shell.notifications}
            title={t.shell.notifications}
            disabled
          >
            <i className="ri-notification-3-line text-[17px]" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
