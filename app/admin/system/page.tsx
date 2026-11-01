"use client";

import AdminFrame, { NoAccess } from "@/app/components/admin/AdminFrame";
import { KPI_GRID } from "@/app/components/charts/ChartsSkeleton";
import MetricChart from "@/app/components/charts/MetricChart";
import { PERCENT_TICKS, VIZ } from "@/app/components/charts/tokens";
import PageHeader, { PAGE_PADDING } from "@/app/components/layout/PageHeader";
import {
  metricsUnavailable,
  MUTED,
  NodeFigures,
  rateTicks,
  STATUS_TONES,
  SYSTEM_REFRESH_MS,
  useUnits,
  type Units,
} from "@/app/components/system/shared";
import { buttonClass } from "@/app/components/ui/buttonStyles";
import { Bone, SkeletonRegion } from "@/app/components/ui/Skeleton";
import { SURFACE } from "@/app/components/ui/surface";
import { DATA, PANEL, ROW, SCROLL_REGION, TABLE, TD, TH, THEAD, TableMessage } from "@/app/components/ui/table";
import usePolledQuery from "@/app/hooks/usePolledQuery";
import { useI18n } from "@/app/i18n/I18nProvider";
import {
  getSystem,
  type SystemCheck,
  type SystemMetrics,
  type SystemNode,
  type SystemStatus,
  type SystemWorkload,
} from "@/app/lib/systemApi";

const SECTION_HEADING = "mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-100";

export default function AdminSystemPage() {
  return (
    <AdminFrame activePage="system">
      <SystemView />
    </AdminFrame>
  );
}

function SystemView() {
  const { t } = useI18n();
  const copy = t.system;
  const units = useUnits();
  const { data, error } = usePolledQuery("admin:system", getSystem, SYSTEM_REFRESH_MS);

  if (error?.kind === "forbidden") return <NoAccess />;

  return (
    <div className={PAGE_PADDING}>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <>
            {data ? <span className={`${MUTED} hidden sm:inline`}>{copy.readAt(units.clock(data.checked_at))}</span> : null}
            {data?.grafana_url ? (
              <a href={data.grafana_url} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
                <i className="ri-external-link-line" aria-hidden="true" />
                {copy.grafana}
                <span className="sr-only">, {copy.grafanaContext}</span>
              </a>
            ) : null}
          </>
        }
      />

      {/* Always rendered, so a failed refresh is announced when it happens. */}
      <div role="status" className={error && data ? "mb-4 text-sm text-rose-700 dark:text-rose-400" : "sr-only"}>
        {error && data ? copy.stale(units.clock(data.checked_at)) : null}
      </div>

      {data ? (
        <SystemReport status={data} units={units} />
      ) : error ? (
        <div className={PANEL}>
          <TableMessage>{copy.loadError}</TableMessage>
        </div>
      ) : (
        <SystemSkeleton />
      )}
    </div>
  );
}

function SystemReport({ status, units }: { status: SystemStatus; units: Units }) {
  const { t, format } = useI18n();
  const copy = t.system;
  const scans = status.scans;

  return (
    <div className="space-y-8">
      <section aria-labelledby="system-services">
        <h2 id="system-services" className={SECTION_HEADING}>
          {copy.checks.heading}
        </h2>
        <ul className={`${KPI_GRID} stagger`}>
          {status.checks.map((check) => (
            <li key={check.name}>
              <CheckCard check={check} />
            </li>
          ))}
          <li>
            <div className={`${SURFACE} h-full p-4`}>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{copy.checks.queue}</p>
              <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {scans ? (
                  <>
                    {format.number(scans.pending)} <span className="font-normal">{copy.checks.waiting(scans.pending)}</span>
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className={`${MUTED} mt-0.5`}>{scans ? copy.checks.running(format.number(scans.running)) : "\u00a0"}</p>
            </div>
          </li>
        </ul>
      </section>

      {status.metrics ? (
        <Metrics metrics={status.metrics} units={units} />
      ) : (
        <div className={`${PANEL} px-5 py-6 text-sm text-zinc-600 dark:text-zinc-400`}>
          {metricsUnavailable(status, copy)}
        </div>
      )}
    </div>
  );
}

function CheckCard({ check }: { check: SystemCheck }) {
  const { t } = useI18n();
  const copy = t.system.checks;
  return (
    <div className={`${SURFACE} h-full p-4`}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{copy.names[check.name] ?? check.name}</p>
      <p className={`mt-1 text-base font-semibold ${STATUS_TONES[check.status]}`}>{copy.status[check.status]}</p>
      <p className={`${MUTED} mt-0.5`}>{check.latency_ms === null ? "\u00a0" : copy.latency(check.latency_ms)}</p>
    </div>
  );
}

function Metrics({ metrics, units }: { metrics: SystemMetrics; units: Units }) {
  const { t } = useI18n();
  const copy = t.system;
  const history = metrics.history;
  const hasHistory = history.cpu.length > 1 || history.network_rx.length > 1;
  const networkTicks = rateTicks([history.network_rx, history.network_tx]);

  return (
    <>
      {metrics.nodes.map((node) => (
        <NodeLoad key={node.name} node={node} units={units} />
      ))}

      <section aria-labelledby="system-history">
        <h2 id="system-history" className={SECTION_HEADING}>
          {copy.history.heading(Math.round(metrics.window / 60))}
        </h2>
        {hasHistory ? (
          <div className="stagger grid gap-3 sm:gap-4 @4xl:grid-cols-2">
            <ChartCard title={copy.history.load}>
              <MetricChart
                series={[
                  { key: "cpu", label: copy.history.cpu, color: VIZ.accent, points: history.cpu },
                  { key: "memory", label: copy.history.memory, color: VIZ.series2, points: history.memory },
                ]}
                format={units.percent}
                domain={[0, 100]}
                ticks={PERCENT_TICKS}
              />
            </ChartCard>
            <ChartCard title={copy.history.network}>
              <MetricChart
                series={[
                  { key: "rx", label: copy.history.received, color: VIZ.accent, points: history.network_rx },
                  { key: "tx", label: copy.history.sent, color: VIZ.series2, points: history.network_tx },
                ]}
                format={units.rate}
                domain={[0, networkTicks[networkTicks.length - 1]]}
                ticks={networkTicks}
                axisWidth={72}
              />
            </ChartCard>
          </div>
        ) : (
          <div className={`${PANEL} px-5 py-6 text-sm text-zinc-600 dark:text-zinc-400`}>{copy.history.empty}</div>
        )}
      </section>

      <Workloads workloads={metrics.workloads} units={units} />
    </>
  );
}

function NodeLoad({ node, units }: { node: SystemNode; units: Units }) {
  const { t } = useI18n();
  const copy = t.system.node;

  return (
    <section aria-label={node.name}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{node.name}</h2>
        {node.uptime > 0 ? <p className={MUTED}>{copy.uptime(units.duration(node.uptime))}</p> : null}
      </div>
      <dl className={`${KPI_GRID} stagger`}>
        <NodeFigures node={node} units={units} size="lg" itemClassName={`${SURFACE} h-full p-4`} />
      </dl>
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${SURFACE} p-4 sm:p-5`}>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      {children}
    </div>
  );
}

function Workloads({ workloads, units }: { workloads: readonly SystemWorkload[]; units: Units }) {
  const { t } = useI18n();
  const copy = t.system.workloads;

  return (
    <section aria-labelledby="system-pods">
      <h2 id="system-pods" className={SECTION_HEADING}>
        {copy.heading}
      </h2>
      <div className={PANEL}>
        {workloads.length === 0 ? (
          <TableMessage>{copy.empty}</TableMessage>
        ) : (
          <div className={SCROLL_REGION}>
            <table className={TABLE}>
              <thead className={THEAD}>
                <tr>
                  <th scope="col" className={`${TH} pl-4`}>
                    {copy.columns.pod}
                  </th>
                  <th scope="col" className={TH}>
                    {copy.columns.namespace}
                  </th>
                  <th scope="col" className={TH}>
                    {copy.columns.status}
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    {copy.columns.restarts}
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    {copy.columns.cpu}
                  </th>
                  <th scope="col" className={`${TH} pr-4 text-right`}>
                    {copy.columns.memory}
                  </th>
                </tr>
              </thead>
              <tbody>
                {workloads.map((workload) => (
                  <tr key={`${workload.namespace}/${workload.pod}`} className={ROW}>
                    <td className={`${TD} max-w-72 truncate pl-4`} title={workload.pod}>
                      {workload.pod}
                    </td>
                    <td className={`${TD} text-zinc-600 dark:text-zinc-400`}>{workload.namespace}</td>
                    <td className={TD}>
                      <span
                        className={`font-medium ${
                          workload.ready ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
                        }`}
                      >
                        {workload.ready ? copy.ready : copy.notReady}
                      </span>
                    </td>
                    <td className={`${TD} ${DATA} text-right`}>{workload.restarts}</td>
                    <td className={`${TD} ${DATA} text-right`}>{units.millicores(workload.cpu)}</td>
                    <td className={`${TD} ${DATA} pr-4 text-right`}>{units.bytes(workload.memory)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SystemSkeleton() {
  return (
    <SkeletonRegion className="space-y-8">
      {[0, 1].map((section) => (
        <div key={section}>
          <Bone className="mb-3 h-5 w-32" />
          <div className={KPI_GRID}>
            {[0, 1, 2, 3].map((card) => (
              <div key={card} className={`${SURFACE} space-y-3 p-4`}>
                <Bone className="h-3.5 w-24" />
                <Bone className="h-6 w-16" />
                <Bone className="h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="grid gap-3 sm:gap-4 @4xl:grid-cols-2">
        {[0, 1].map((card) => (
          <div key={card} className={`${SURFACE} p-5`}>
            <Bone className="mb-4 h-4 w-32" />
            <Bone className="h-44 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}
