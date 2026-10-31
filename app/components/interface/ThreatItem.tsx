import { TONES, type Tone } from "@/app/components/ui/surface";

interface ThreatItemProps {
  name: string;
  icon: string;
  /** Already formatted for the interface language by the caller. */
  value: string;
  percent: number;
  tone: Tone;
}

export default function ThreatItem({ name, icon, value, percent, tone }: ThreatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <i className={`${icon} text-base leading-none ${TONES[tone].icon}`} aria-hidden="true"></i>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
          <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">{value}</span>
        </div>
        {/* The value is printed above; the bar only pictures it. */}
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" aria-hidden="true">
          <div className={`h-full rounded-full ${TONES[tone].bar}`} style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  );
}
