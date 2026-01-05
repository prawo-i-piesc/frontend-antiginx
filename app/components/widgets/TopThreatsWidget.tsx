import ThreatItem from "../interface/ThreatItem";

export default function TopThreatsWidget() {
  const threats = [
    { name: "Malware", icon: "ri-bug-line", value: "164", percent: 85, color: "bg-red-500", iconColor: "text-red-400", iconBg: "bg-red-500/10" },
    { name: "Phishing", icon: "ri-shield-cross-line", value: "126", percent: 65, color: "bg-orange-500", iconColor: "text-orange-400", iconBg: "bg-orange-500/10" },
    { name: "Spam", icon: "ri-spam-line", value: "87", percent: 45, color: "bg-yellow-500", iconColor: "text-yellow-400", iconBg: "bg-yellow-500/10" },
    { name: "Exploit", icon: "ri-code-s-slash-line", value: "58", percent: 30, color: "bg-purple-500", iconColor: "text-purple-400", iconBg: "bg-purple-500/10" },
    { name: "Suspicious", icon: "ri-error-warning-line", value: "23", percent: 12, color: "bg-cyan-500", iconColor: "text-cyan-400", iconBg: "bg-cyan-500/10" },
  ];

  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 backdrop-blur-md border border-zinc-300 dark:border-zinc-800/30 p-6 h-full flex flex-col">
      <h4 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">Top Threats</h4>

      <div className="space-y-5 overflow-y-auto flex-1 pr-2">
        {threats.map((threat, i) => (
          <ThreatItem key={i} {...threat} />
        ))}
      </div>
    </div>
  );
}
