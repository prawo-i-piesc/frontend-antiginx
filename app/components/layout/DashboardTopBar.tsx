"use client";

interface DashboardTopBarProps {
  title?: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme: "dark" | "light";
  onToggleTheme: (event?: React.MouseEvent) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showNotifications?: boolean;
  showMessages?: boolean;
}

export default function DashboardTopBar({
  title,
  sidebarOpen,
  onToggleSidebar,
  theme,
  onToggleTheme,
  showSearch = true,
  searchPlaceholder = "Search for scans, threats, or reports...",
  showNotifications = true,
  showMessages = true,
}: DashboardTopBarProps) {
  const iconButtonClass =
    "group relative flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-300/80 bg-zinc-100/80 text-zinc-600 transition-all hover:border-zinc-400 hover:bg-zinc-200/80 dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/70";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-2xl transition-colors dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="flex h-20 w-full items-center justify-between gap-4 px-5 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
          <button
            onClick={onToggleSidebar}
            className={`${iconButtonClass} xl:hidden`}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <i className="ri-menu-line text-[18px] text-current"></i>
          </button>

          {title ? (
            <h1 className="hidden shrink-0 text-base font-semibold text-zinc-900 dark:text-zinc-100 lg:block">
              {title}
            </h1>
          ) : null}

          {showSearch ? (
            <div className="hidden min-w-0 flex-1 lg:block">
              <div className="relative group max-w-xl">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-cyan-500/5 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="relative h-10 w-full rounded-2xl border border-zinc-300/80 bg-zinc-100/80 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-500 transition-all focus:border-cyan-500/50 focus:bg-zinc-50 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900/80"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-cyan-500 dark:text-zinc-500 dark:group-focus-within:text-cyan-400">
                  <i className="ri-search-line text-[17px]"></i>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl">
          <button
            onClick={(e) => onToggleTheme(e)}
            className={iconButtonClass}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <i className="ri-moon-line text-[17px] transition-colors group-hover:text-cyan-500 dark:group-hover:text-cyan-400"></i>
            ) : (
              <i className="ri-sun-line text-[17px] transition-colors group-hover:text-cyan-500"></i>
            )}
          </button>

          {showNotifications ? (
            <button className={iconButtonClass} aria-label="Notifications">
              <i className="ri-notification-3-line text-[17px] transition-colors group-hover:text-cyan-500 dark:group-hover:text-cyan-400"></i>
            </button>
          ) : null}

          {false && showMessages ? (
            <button className={`${iconButtonClass} sm:flex`} aria-label="Messages">
              <i className="ri-message-3-line text-[17px] transition-colors group-hover:text-cyan-500 dark:group-hover:text-cyan-400"></i>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
