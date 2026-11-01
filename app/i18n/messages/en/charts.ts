import { pluralEn } from "@/app/i18n/plural";

/** The charts page and the chart widgets: risk over time, failed checks, and each domain's history. */
const charts = {
  title: "Charts",
  subtitle: "Risk, failed checks and scan history across your sites",
  loadError: "We could not load your statistics.",
  noScans: "No completed scans yet. Finished scans show up here.",
  noScansInPeriod: "No completed scans in this period.",
  newScan: "New scan",
  keyboardHint: "Use the left and right arrow keys to move between points.",

  /** Live metric charts (admin System view): the lines in words for screen readers. */
  metric: {
    summary: (label: string, now: string, peak: string) => `${label}: now ${now}, peak ${peak}.`,
  },

  filters: {
    domain: "Domain",
    allDomains: "All domains",
    period: "Period",
    periods: { 30: "30 days", 90: "90 days", 365: "1 year" } as Record<number, string>,
  },

  kpi: {
    scans: "Completed scans",
    acrossDomains: (count: number) => `across ${count} ${pluralEn(count, "domain", "domains")}`,
    since: (date: string) => `first on ${date}`,
    averageRisk: "Average risk",
    averageHint: "per scan in this period",
    latestRisk: "Latest risk",
    belowAverage: (points: number) => `${points} below average`,
    aboveAverage: (points: number) => `${points} above average`,
    atAverage: "Same as the average",
    failedChecks: "Failed checks",
    failedOf: (run: string, share: string) => `of ${run} run, ${share}`,
    /** After a risk score: "52 / 100". */
    outOf: "/ 100",
  },

  risk: {
    heading: "Risk over time",
    perScan: "Per scan",
    daily: "Daily average",
    weekly: "Weekly average",
    /** The measure, as the tooltip and the table name it. */
    value: "Risk",
    chartTitle: (scope: string) => `Risk over time: ${scope}`,
    scanDetail: (failed: number, tests: number) => `${failed} of ${tests} ${pluralEn(tests, "check", "checks")} failed`,
    bucketDetail: (count: number) => `Average of ${count} ${pluralEn(count, "scan", "scans")}`,
    week: (date: string) => `Week of ${date}`,
    footnote:
      "Risk runs from 0 to 100. The worst failed check sets the band (low from 1, medium from 25, high from 50, critical from 75), and every further one raises it.",
    date: "Date",
  },

  severity: {
    heading: "Failed checks by severity",
    passed: (count: string) => `Passed in the same scans: ${count}`,
    detail: (level: string, count: string, share: string) => `${level}: ${count} failed, ${share} of failures`,
    none: "No check failed in this period.",
  },

  tests: {
    heading: "Most failed checks",
    detail: (name: string, failures: string, runs: string, rate: string) =>
      `${name}: failed ${failures} of ${runs} times, ${rate}`,
    none: "No check failed in this period.",
  },

  domains: {
    heading: "Domains",
    columns: { domain: "Domain", scans: "Scans", last: "Last scan", risk: "Risk", change: "Change", trend: "Trend" },
    filter: (url: string) => `Show only ${url}`,
    up: (points: number) => `up ${points}`,
    down: (points: number) => `down ${points}`,
    same: "no change",
  },

  scans: {
    heading: "Scans",
    columns: { date: "Date", checks: "Checks", failed: "Failed", risk: "Risk" },
    open: "Open scan",
  },

  /** Chart widgets on the dashboard: always the last 30 days, across every domain. */
  widget: {
    period: "Last 30 days",
    more: "Charts",
    /** Completes "Charts" for screen readers. */
    moreContext: "for more periods and domains",
  },
};

export default charts;
