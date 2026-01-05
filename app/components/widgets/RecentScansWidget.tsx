import ScanItem from "../interface/ScanItem";

export default function RecentScansWidget() {
  return (
    <div className="rounded-xl bg-white/85 dark:bg-zinc-900/20 backdrop-blur-md border border-zinc-300 dark:border-zinc-800/30 p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Scans</h4>
        <button className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-medium">
          View All
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-2">
        <ScanItem domain="example.com" timeAgo="2 minutes ago" status="safe" />
        <ScanItem domain="suspicious-site.net" timeAgo="15 minutes ago" status="suspicious" />
        <ScanItem domain="malware-test.com" timeAgo="1 hour ago" status="dangerous" />
        <ScanItem domain="trusted-domain.org" timeAgo="2 hours ago" status="safe" />
      </div>
    </div>
  );
}
