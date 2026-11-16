import Link from "next/link";

import RailTooltip from "@/app/components/ui/RailTooltip";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  isActive?: boolean;
  /** Icon only, in the collapsed sidebar; the label moves to a tooltip and stays the link's name. */
  collapsed?: boolean;
  /** Said after the label when the page needs a plan the account does not have; shown as a lock. */
  locked?: string;
}

export default function NavLink({ href, icon, label, isActive = false, collapsed = false, locked }: NavLinkProps) {
  return (
    <RailTooltip label={locked ? `${label} · ${locked}` : label} enabled={collapsed}>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`group flex h-10 items-center gap-3 rounded-lg border text-sm font-medium transition-colors ${
          collapsed ? "justify-center px-0" : "px-3"
        } ${
          isActive
            ? "border-zinc-300/70 bg-zinc-200/70 text-zinc-900 dark:border-zinc-700/70 dark:bg-zinc-800/70 dark:text-zinc-100"
            : "border-transparent text-zinc-600 hover:bg-zinc-100/90 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100"
        }`}
      >
        <i
          className={`${icon} text-lg leading-none ${isActive ? "text-zinc-700 dark:text-zinc-300" : ""}`}
          aria-hidden="true"
        ></i>
        <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
        {locked ? (
          <>
            {collapsed ? null : <i className="ri-lock-line ml-auto text-sm leading-none" aria-hidden="true"></i>}
            <span className="sr-only">. {locked}</span>
          </>
        ) : null}
      </Link>
    </RailTooltip>
  );
}
