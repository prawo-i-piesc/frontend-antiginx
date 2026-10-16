"use client";

import ThreatItem from "@/app/components/interface/ThreatItem";
import { useI18n } from "@/app/i18n/I18nProvider";

/** Sample figures: no endpoint reports threat categories yet. */
const THREATS = [
  { id: "malware", icon: "ri-bug-line", count: 164, percent: 85, color: "bg-red-500", iconColor: "text-red-400", iconBg: "bg-red-500/10" },
  { id: "phishing", icon: "ri-shield-cross-line", count: 126, percent: 65, color: "bg-orange-500", iconColor: "text-orange-400", iconBg: "bg-orange-500/10" },
  { id: "spam", icon: "ri-spam-line", count: 87, percent: 45, color: "bg-yellow-500", iconColor: "text-yellow-400", iconBg: "bg-yellow-500/10" },
  { id: "exploit", icon: "ri-code-s-slash-line", count: 58, percent: 30, color: "bg-purple-500", iconColor: "text-purple-400", iconBg: "bg-purple-500/10" },
  { id: "suspicious", icon: "ri-error-warning-line", count: 23, percent: 12, color: "bg-cyan-500", iconColor: "text-cyan-400", iconBg: "bg-cyan-500/10" },
] as const;

export default function TopThreatsWidget() {
  const { t, format } = useI18n();

  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 backdrop-blur-md border border-zinc-300 dark:border-zinc-800/30 p-6 h-full flex flex-col">
      <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">{t.widgets.names.topThreats}</h2>

      <ul className="space-y-5 overflow-y-auto flex-1 pr-2 scrollbar-theme">
        {THREATS.map(({ id, count, ...threat }) => (
          <li key={id}>
            <ThreatItem {...threat} name={t.widgets.topThreats.categories[id]} value={format.number(count)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
