interface StatsCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  value: string | number;
  label: string;
  trend: {
    value: string;
    isPositive: boolean;
    color: string;
  };
}

export default function StatsCard({
  icon,
  iconColor,
  iconBgColor,
  value,
  label,
  trend,
}: StatsCardProps) {
  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 border border-zinc-300 dark:border-zinc-800/30 p-4 sm:p-6 hover:border-zinc-500 dark:hover:border-zinc-500/30 hover:bg-zinc-200 dark:hover:bg-zinc-900/30 transition-all">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconBgColor}`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{value}</h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-0 sm:mb-2">{label}</p>
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend.color}`}>
          <i className={`ri-arrow-${trend.isPositive ? 'up' : 'down'}-line`}></i>
          {trend.value}
        </span>
      </div>
    </div>
  );
}
