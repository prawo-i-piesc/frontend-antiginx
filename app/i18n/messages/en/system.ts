import { pluralEn } from "@/app/i18n/plural";

/** The admin System view: services, scan queue and server load from Prometheus. */
const system = {
  title: "System",
  description: "Services and server load, refreshed every 10 seconds.",
  /** Before the time of the last reading: "Read at 12:03:15". */
  readAt: (time: string) => `Read at ${time}`,
  stale: (time: string) => `Could not refresh. Showing the reading from ${time}.`,
  loadError: "We could not load the system status.",
  grafana: "Grafana",
  /** Completes "Grafana" for screen readers. */
  grafanaContext: "dashboards, opens in a new tab",

  checks: {
    heading: "Services",
    names: { db: "Database", rabbitmq: "RabbitMQ", prometheus: "Prometheus" } as Record<string, string>,
    status: { up: "Up", down: "Not responding", degraded: "Queries failing", disabled: "Not configured" },
    latency: (ms: number) => `${ms} ms`,
    queue: "Scan queue",
    /** After the number of scans in the queue: "3 scans waiting". */
    waiting: (count: number) => pluralEn(count, "scan waiting", "scans waiting"),
    running: (count: string) => `${count} running`,
  },

  node: {
    uptime: (duration: string) => `Up for ${duration}`,
    cpu: "CPU",
    cores: (count: number) => `${count} ${pluralEn(count, "core", "cores")}`,
    load: (values: string) => `load ${values}`,
    memory: "Memory",
    disk: "Disk",
    network: "Network",
    of: (used: string, total: string) => `${used} of ${total}`,
    received: "received",
    sent: "sent",
  },

  history: {
    heading: (minutes: number) => `Last ${minutes} minutes`,
    load: "CPU and memory",
    network: "Network",
    cpu: "CPU",
    memory: "Memory",
    received: "Received",
    sent: "Sent",
    empty: "No history yet. Prometheus needs a few minutes of data.",
  },

  workloads: {
    heading: "Pods",
    columns: { namespace: "Namespace", pod: "Pod", status: "Status", restarts: "Restarts", cpu: "CPU", memory: "Memory" },
    ready: "Ready",
    notReady: "Not ready",
    empty: "No pod data. This Prometheus does not collect kube-state-metrics.",
  },

  prometheus: {
    disabled: "Server load needs Prometheus. Set PROMETHEUS_URL on the backend to show it.",
    down: "Prometheus is not responding, so only the services are shown.",
    degraded: "Prometheus answers, but its queries fail. Check that node-exporter and kube-state-metrics are scraped.",
  },
};

export default system;
