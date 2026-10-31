"use client";

import ThreatItem from "@/app/components/interface/ThreatItem";
import type { Tone } from "@/app/components/ui/surface";
import WidgetCard from "@/app/components/widgets/WidgetCard";
import { useI18n } from "@/app/i18n/I18nProvider";

/** Sample figures: no endpoint reports threat categories yet, and the card says so. */
const THREATS: readonly { id: "malware" | "phishing" | "spam" | "exploit" | "suspicious"; icon: string; count: number; percent: number; tone: Tone }[] = [
  { id: "malware", icon: "ri-bug-line", count: 164, percent: 85, tone: "rose" },
  { id: "phishing", icon: "ri-shield-cross-line", count: 126, percent: 65, tone: "orange" },
  { id: "spam", icon: "ri-spam-line", count: 87, percent: 45, tone: "amber" },
  { id: "exploit", icon: "ri-code-s-slash-line", count: 58, percent: 30, tone: "violet" },
  { id: "suspicious", icon: "ri-error-warning-line", count: 23, percent: 12, tone: "cyan" },
];

export default function TopThreatsWidget() {
  const { t, format } = useI18n();

  return (
    <WidgetCard title={t.widgets.names.topThreats} sample>
      <ul className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-theme">
        {THREATS.map(({ id, count, ...threat }) => (
          <li key={id}>
            <ThreatItem {...threat} name={t.widgets.topThreats.categories[id]} value={format.number(count)} />
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
