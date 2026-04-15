import Link from "next/link";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  isActive?: boolean;
}

export default function NavLink({ href, icon, label, isActive = false }: NavLinkProps) {
  if (isActive) {
    return (
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-200/70 dark:bg-zinc-800/70 border border-zinc-300/70 dark:border-zinc-700/70 transition-colors"
      >
        <i className={`${icon} text-base text-zinc-700 dark:text-zinc-300`}></i>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/90 dark:hover:bg-zinc-800/40 border border-transparent transition-colors"
    >
      <i className={`${icon} text-base`}></i>
      <span>{label}</span>
    </Link>
  );
}
