interface ThreatItemProps {
  name: string;
  icon: string;
  value: string;
  percent: number;
  color: string;
  iconColor: string;
  iconBg: string;
}

export default function ThreatItem({
  name,
  icon,
  value,
  percent,
  color,
  iconColor,
  iconBg,
}: ThreatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} shrink-0`} aria-hidden="true">
        <i className={`${icon} ${iconColor}`} aria-hidden="true"></i>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">{value}</span>
        </div>
        {/* The value is printed above; the bar only pictures it. */}
        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800/50 overflow-hidden rounded-full" aria-hidden="true">
          <div
            className={`h-1 rounded-full ${color}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
