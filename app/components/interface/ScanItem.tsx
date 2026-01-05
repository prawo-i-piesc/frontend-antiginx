interface ScanItemProps {
  domain: string;
  timeAgo: string;
  status: "safe" | "suspicious" | "dangerous";
}

const statusConfig = {
  safe: {
    label: "Safe",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-400",
    badgeBg: "bg-green-500/10",
    badgeText: "text-green-400",
    badgeBorder: "border-green-500/20",
  },
  suspicious: {
    label: "Suspicious",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
    badgeBg: "bg-yellow-500/10",
    badgeText: "text-yellow-400",
    badgeBorder: "border-yellow-500/20",
  },
  dangerous: {
    label: "Dangerous",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    badgeBg: "bg-red-500/10",
    badgeText: "text-red-400",
    badgeBorder: "border-red-500/20",
  },
};

export default function ScanItem({ domain, timeAgo, status }: ScanItemProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors border border-zinc-200 dark:border-zinc-800/30">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.iconBg} shrink-0`}>
          <i className={`ri-global-line ${config.iconColor}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{domain}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">{timeAgo}</p>
        </div>
      </div>
      <span className={`px-2.5 py-1 text-xs font-medium ${config.badgeText} ${config.badgeBg} rounded-md border ${config.badgeBorder}`}>
        {config.label}
      </span>
    </div>
  );
}
