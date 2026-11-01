"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import MetricChart from "@/app/components/charts/MetricChart";
import { PERCENT_TICKS, VIZ } from "@/app/components/charts/tokens";
import {
  metricsUnavailable,
  MUTED,
  NodeFigures,
  STATUS_TONES,
  SYSTEM_REFRESH_MS,
  useUnits,
} from "@/app/components/system/shared";
import { Bone, ROW_WIDTHS, SkeletonRegion } from "@/app/components/ui/Skeleton";
import WidgetCard from "@/app/components/widgets/WidgetCard";
import { createWidgetData } from "@/app/components/widgets/WidgetData";
import { useI18n } from "@/app/i18n/I18nProvider";
import { getSystem, type SystemMetrics, type SystemStatus } from "@/app/lib/systemApi";

/**
 * The System page in brief, for the admin overview. One request serves every
 * system widget; it goes out only while one of them is rendered, and again
 * every ten seconds like the page.
 */
export const SystemData = createWidgetData("admin:system", getSystem, { lazy: true, refresh: SYSTEM_REFRESH_MS });

const MESSAGE = "flex flex-1 items-center justify-center py-6 text-center text-sm text-zinc-600 dark:text-zinc-400";

function SystemLink() {
  const { t } = useI18n();
  return (
    <Link
      href="/admin/system"
      className="inline-flex min-h-6 shrink-0 items-center text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
    >
      {t.shell.links.system}
      <span className="sr-only"> {t.widgets.system.moreContext}</span>
    </Link>
  );
}

/** Loading, failure, and the card's content once the status has arrived. */
function SystemBody({ skeleton, children }: { skeleton: ReactNode; children: (status: SystemStatus) => ReactNode }) {
  const { t } = useI18n();
  const { data, error } = SystemData.useData();
  if (data) return <>{children(data)}</>;
  if (error) return <p className={MESSAGE}>{t.system.loadError}</p>;
  return <SkeletonRegion className="flex-1">{skeleton}</SkeletonRegion>;
}

/** Without metrics, why: Prometheus is not configured, not answering, or its queries fail. */
function MetricsBody({ skeleton, children }: { skeleton: ReactNode; children: (metrics: SystemMetrics) => ReactNode }) {
  const { t } = useI18n();
  return (
    <SystemBody skeleton={skeleton}>
      {(status) =>
        status.metrics ? children(status.metrics) : <p className={MESSAGE}>{metricsUnavailable(status, t.system)}</p>
      }
    </SystemBody>
  );
}

function RowsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-4 pt-1">
      {ROW_WIDTHS.slice(0, rows).map((width) => (
        <Bone key={width} className={`h-3 max-w-full ${width}`} />
      ))}
    </div>
  );
}

/** Whether the backend's dependencies answer, and how long the scan queue is. */
export function ServicesWidget() {
  const { t, format } = useI18n();
  const copy = t.system.checks;

  return (
    <WidgetCard title={t.widgets.names.services} action={<SystemLink />}>
      <SystemBody skeleton={<RowsSkeleton rows={4} />}>
        {(status) => (
          <ul className="-my-2 divide-y divide-zinc-200 text-sm dark:divide-zinc-800/70">
            {status.checks.map((check) => (
              <li key={check.name} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-zinc-800 dark:text-zinc-200">{copy.names[check.name] ?? check.name}</span>
                <span className="flex items-baseline gap-2">
                  {check.latency_ms === null ? null : <span className={MUTED}>{copy.latency(check.latency_ms)}</span>}
                  <span className={`font-medium ${STATUS_TONES[check.status]}`}>{copy.status[check.status]}</span>
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-zinc-800 dark:text-zinc-200">{copy.queue}</span>
              {status.scans ? (
                <span className="text-right">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {format.number(status.scans.pending)} {copy.waiting(status.scans.pending)}
                  </span>
                  <span className={MUTED}> · {copy.running(format.number(status.scans.running))}</span>
                </span>
              ) : (
                <span className="text-zinc-600 dark:text-zinc-400">—</span>
              )}
            </li>
          </ul>
        )}
      </SystemBody>
    </WidgetCard>
  );
}

/** The server now: CPU, memory, disk and network of each node, in one row of figures. */
export function ServerLoadWidget() {
  const { t } = useI18n();
  const copy = t.system.node;
  const units = useUnits();

  return (
    <WidgetCard title={t.widgets.names.serverLoad} action={<SystemLink />}>
      <MetricsBody skeleton={<RowsSkeleton rows={3} />}>
        {(metrics) =>
          metrics.nodes.length === 0 ? (
            <p className={MESSAGE}>{t.widgets.noData}</p>
          ) : (
            <div className="flex flex-1 flex-col gap-5">
              {metrics.nodes.map((node) => (
                <section key={node.name} aria-label={node.name} className="flex flex-1 flex-col">
                  {metrics.nodes.length > 1 ? (
                    <h3 className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{node.name}</h3>
                  ) : null}
                  {/* Four across only where the card has room for them; two by two otherwise. */}
                  <dl className="grid grid-cols-2 gap-x-5 gap-y-4 @xl/widget:grid-cols-4">
                    <NodeFigures node={node} units={units} size="md" />
                  </dl>
                  <p className={`${MUTED} mt-auto truncate pt-4`}>
                    {metrics.nodes.length > 1 ? null : `${node.name} · `}
                    {node.uptime > 0 ? `${copy.uptime(units.duration(node.uptime))} · ` : null}
                    {copy.load(units.load(node.load))}
                  </p>
                </section>
              ))}
            </div>
          )
        }
      </MetricsBody>
    </WidgetCard>
  );
}

/** CPU and memory of the whole cluster over the last half hour. */
export function SystemHistoryWidget() {
  const { t } = useI18n();
  const copy = t.system.history;
  const units = useUnits();

  return (
    <WidgetCard title={t.widgets.names.systemHistory} action={<SystemLink />}>
      <MetricsBody skeleton={<Bone className="h-52 w-full rounded-lg" />}>
        {(metrics) =>
          metrics.history.cpu.length > 1 ? (
            <MetricChart
              series={[
                { key: "cpu", label: copy.cpu, color: VIZ.accent, points: metrics.history.cpu },
                { key: "memory", label: copy.memory, color: VIZ.series2, points: metrics.history.memory },
              ]}
              format={units.percent}
              domain={[0, 100]}
              ticks={PERCENT_TICKS}
              height={200}
              fill
            />
          ) : (
            <p className={MESSAGE}>{copy.empty}</p>
          )
        }
      </MetricsBody>
    </WidgetCard>
  );
}
