"use client";

import { useI18n } from "@/app/i18n/I18nProvider";
import { useTheme } from "@/app/providers/ThemeProvider";

interface DashboardTopBarProps {
  sidebarOpen: boolean;
  /** Id of the sidebar the menu button opens, for aria-controls. */
  sidebarId: string;
  onToggleSidebar: () => void;
  menuButtonRef?: React.Ref<HTMLButtonElement>;
  searchPlaceholder?: string;
}

export default function DashboardTopBar({
  sidebarOpen,
  sidebarId,
  onToggleSidebar,
  menuButtonRef,
  searchPlaceholder,
}: DashboardTopBarProps) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const placeholder = searchPlaceholder ?? t.shell.searchPlaceholder;

  const iconButtonClass =
    "group relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300/80 bg-zinc-100/80 text-zinc-600 transition-all hover:border-zinc-400 hover:bg-zinc-200/80 dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/70";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-2xl transition-colors dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="flex h-20 w-full items-center justify-between gap-4 px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={onToggleSidebar}
            className={`${iconButtonClass} cursor-pointer xl:hidden`}
            aria-label={t.shell.menu}
            aria-expanded={sidebarOpen}
            aria-controls={sidebarId}
          >
            <i className="ri-menu-line text-[18px] text-current" aria-hidden="true"></i>
          </button>

          {/* Placeholder until search exists: shown, but out of the tab order. */}
          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="relative max-w-xl">
              <input
                type="search"
                placeholder={placeholder}
                aria-label={placeholder}
                title={t.shell.searchUnavailable}
                className="opacity-50 relative h-10 w-full rounded-2xl border border-zinc-300/80 bg-zinc-100/80 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-600 dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                disabled
              />
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400">
                <i className="ri-search-line text-[17px]" aria-hidden="true"></i>
              </div>
            </div>
          </div>
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
