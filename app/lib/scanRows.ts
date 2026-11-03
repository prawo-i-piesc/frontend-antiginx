import { isFinishedStatus, type ScanResponse, type ScanResultItem, type SeverityLevel } from "@/app/lib/api";
import { catalogOrder, categoryOf, testIdOf } from "@/app/lib/scanCatalog";

/**
 * The results table's rows: every test the scan asked for, whether or not it has
 * answered yet, so a row is in its place from the start and only changes state.
 */

export type RowState = "pending" | "passed" | "failed" | "notice" | "missing";

export interface ScanRow {
  key: string;
  testId: string | null;
  /** The name to fall back on, as the engine reported it. */
  engineName: string | null;
  category: string | null;
  state: RowState;
  severity: SeverityLevel | null;
  result: ScanResultItem | null;
}

const WEIGHTED: readonly SeverityLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

/** The weight to show for a result. The engine says None when there is none; anything unknown is a problem, the smallest one. */
export function displaySeverity(severity: string): SeverityLevel | null {
  const value = severity.trim().toUpperCase();
  if (value === "NONE" || value === "") return null;
  return (WEIGHTED as readonly string[]).includes(value) || value === "INFO" ? (value as SeverityLevel) : "LOW";
}

function stateOf(result: ScanResultItem): RowState {
  if (result.notice) return "notice";
  return result.passed ? "passed" : "failed";
}

/** Worst first: what needs attention, then what the engine had to say, then the rest. */
function finishedRank(row: ScanRow): number {
  if (row.state === "failed") {
    const index = WEIGHTED.indexOf(row.severity ?? "LOW");
    return index === -1 ? WEIGHTED.length : index;
  }
  return { notice: 10, missing: 11, passed: 12, pending: 13, failed: 0 }[row.state];
}

export function buildRows(scan: ScanResponse): ScanRow[] {
  const finished = isFinishedStatus(scan.status);
  const planned = Array.isArray(scan.tests) ? scan.tests : [];
  const results = scan.results ?? [];

  const byTest = new Map<string, ScanResultItem>();
  const others: ScanResultItem[] = [];
  for (const result of results) {
    const testId = testIdOf(result.test_name);
    if (testId) byTest.set(testId, result);
    else others.push(result);
  }

  const toRow = (testId: string | null, result: ScanResultItem | null): ScanRow => ({
    key: testId ?? `result-${result?.id}`,
    testId,
    engineName: result?.test_name ?? null,
    category: testId ? categoryOf(testId) : null,
    state: result ? stateOf(result) : finished ? "missing" : "pending",
    severity: result && !result.notice ? displaySeverity(result.severity) : null,
    result,
  });

  const testIds = new Set([...planned, ...byTest.keys()]);
  const rows = [...testIds].map((testId) => toRow(testId, byTest.get(testId) ?? null));
  rows.sort((a, b) => catalogOrder(a.testId) - catalogOrder(b.testId));
  rows.push(...others.map((result) => toRow(null, result)));

  // Rows stay put while results arrive, so nothing moves under someone reading;
  // once the scan is over the worst rise to the top. Array.sort is stable.
  return finished ? rows.sort((a, b) => finishedRank(a) - finishedRank(b)) : rows;
}

/** Whether any test reached a verdict. An engine notice is not one: a scan that only produced those checked nothing. */
export function hasVerdict(rows: readonly ScanRow[]): boolean {
  return rows.some((row) => row.state === "passed" || row.state === "failed");
}

export interface ScanProgress {
  /** Tests with an answer of any kind. */
  done: number;
  /** Null for scans from before the plan was kept. */
  total: number | null;
}

export function progressOf(scan: ScanResponse, rows: readonly ScanRow[]): ScanProgress {
  const total = Array.isArray(scan.tests) ? scan.tests.length : null;
  // An engine notice without a test's name answers for no test in particular.
  const done = rows.filter((row) => row.testId !== null && row.result !== null).length;
  return { done: total === null ? done : Math.min(done, total), total };
}

/** Failed tests per severity, worst first, leaving out the ones with none. */
export function findingCounts(rows: readonly ScanRow[]): { severity: SeverityLevel; count: number }[] {
  return WEIGHTED.map((severity) => ({
    severity,
    count: rows.filter((row) => row.state === "failed" && row.severity === severity).length,
  })).filter((entry) => entry.count > 0);
}

const MAX_METADATA_ROWS = 60;

/** What a test recorded, flattened to `path: value` pairs, without the empty parts. */
export function flattenMetadata(metadata: unknown): { path: string; value: string }[] {
  const rows: { path: string; value: string }[] = [];

  const visit = (value: unknown, path: string) => {
    if (rows.length >= MAX_METADATA_ROWS || value === null || value === undefined || value === "") return;

    if (Array.isArray(value)) {
      if (value.length === 0) return;
      if (value.every((item) => typeof item !== "object" || item === null)) {
        rows.push({ path, value: value.join(", ") });
      } else {
        value.forEach((item, index) => visit(item, `${path}[${index}]`));
      }
      return;
    }

    if (typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) visit(nested, path ? `${path}.${key}` : key);
      return;
    }

    rows.push({ path, value: String(value) });
  };

  visit(metadata, "");
  return rows;
}
