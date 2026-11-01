/**
 * The admin System view: backend-antiginx docs/Backend/System.md.
 *
 * The backend asks the cluster's Prometheus (kube-prometheus-stack) and adds
 * its own probes, so the browser never talks to Prometheus.
 */

import { request } from "@/app/lib/request";

/**
 * degraded: the service answers but does not do its job (Prometheus is up, its
 * queries fail). disabled: the server has no such service configured, which
 * is not a failure.
 */
export type CheckStatus = "up" | "down" | "degraded" | "disabled";

export interface SystemCheck {
  /** "db", "rabbitmq", "prometheus". */
  name: string;
  status: CheckStatus;
  /** null for a disabled check and for one that does no I/O (rabbitmq reads a flag in memory). */
  latency_ms: number | null;
}

/** A value at `t`, in seconds since the epoch. */
export interface MetricPoint {
  t: number;
  v: number;
}

export interface SystemNode {
  name: string;
  /** Percent, 0–100, averaged over cores. */
  cpu: number;
  cores: number;
  /** Load average over 1, 5 and 15 minutes. */
  load: [number, number, number];
  memory_used: number;
  memory_total: number;
  disk_used: number;
  disk_total: number;
  /** Bytes per second. */
  network_rx: number;
  network_tx: number;
  /** Seconds since boot. */
  uptime: number;
}

export interface SystemWorkload {
  namespace: string;
  pod: string;
  ready: boolean;
  restarts: number;
  /** Cores: 0.05 is 50m. */
  cpu: number;
  memory: number;
}

export interface SystemMetrics {
  nodes: SystemNode[];
  workloads: SystemWorkload[];
  /** The whole cluster: CPU and memory in percent, network in bytes per second. */
  history: { cpu: MetricPoint[]; memory: MetricPoint[]; network_rx: MetricPoint[]; network_tx: MetricPoint[] };
  /** Seconds. */
  window: number;
  step: number;
}

export interface SystemStatus {
  checked_at: string;
  checks: SystemCheck[];
  /** null when the count failed or timed out: unknown, not zero. */
  scans: { pending: number; running: number } | null;
  /** null when Prometheus is off, unreachable or a query failed. */
  metrics: SystemMetrics | null;
  grafana_url: string;
}

export function getSystem(signal?: AbortSignal): Promise<SystemStatus> {
  return request<SystemStatus>("/api/admin/system", { signal });
}
