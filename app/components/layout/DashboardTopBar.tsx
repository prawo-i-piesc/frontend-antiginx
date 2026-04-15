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
  return (
    <header className="sticky h-20 top-0 z-40 bg-white/85 dark:bg-zinc-950 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800/50 flex items-center transition-colors">
      <div className="flex items-center justify-between px-6 w-full">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onToggleSidebar}
            className="xl:hidden w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl flex items-center justify-center transition-all border border-zinc-400 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <i className="ri-menu-line text-zinc-700 dark:text-zinc-200 text-xl"></i>
          </button>

          {title ? (
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
          ) : null}

          {showSearch ? (
            <div className="hidden lg:block flex-1 max-w-lg">
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="relative w-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-300 dark:border-zinc-700/50 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:bg-zinc-200 dark:focus:bg-zinc-800/80 transition-all"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 transition-colors">
                  <i className="ri-search-line text-lg"></i>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleTheme(e)}
            className="cursor-pointer w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl flex items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <i className="ri-moon-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors text-lg"></i>
            ) : (
              <i className="ri-sun-line text-zinc-600 group-hover:text-cyan-500 transition-colors text-lg"></i>
            )}
          </button>

          {showNotifications ? (
            <button className="cursor-pointer relative w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl flex items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group">
              <i className="ri-notification-3-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors"></i>
            </button>
          ) : null}

          {showMessages ? (
            <button className="cursor-pointer sm:flex relative w-10 h-10 bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700/60 rounded-xl items-center justify-center transition-all border border-zinc-300 dark:border-zinc-700/50 hover:border-zinc-500 dark:hover:border-zinc-600/50 group">
              <i className="ri-message-3-line text-zinc-600 dark:text-zinc-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors"></i>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
