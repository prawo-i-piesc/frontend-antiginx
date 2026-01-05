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
        className="group relative flex items-center gap-3.5 rounded-l py-3 px-4 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="absolute inset-0 bg-linear-to-r from-cyan-500/5 to-transparent dark:from-cyan-400/5 pointer-events-none"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500"></div>
        <i className={`${icon} text-lg relative z-10 drop-shadow-sm`}></i>
        <span className="relative z-10">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3.5 rounded-l py-3 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 transition-all duration-300 hover:pl-5 overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-zinc-400 to-zinc-500 dark:from-zinc-500 dark:to-zinc-600 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      <i className={`${icon} text-lg transition-transform group-hover:scale-110 duration-300`}></i>
      <span className="transition-all duration-300 relative z-10">{label}</span>
    </Link>
  );
}
