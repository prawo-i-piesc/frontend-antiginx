import { pluralEn } from "@/app/i18n/plural";

/** The charts page: how a domain's threat level changed across its scans. */
const charts = {
  title: "Charts",
  subtitle: "Analyze website security metrics and scan history",
  loading: "Loading chart data…",
  loadError: "We could not load your scan history.",
  empty: "No data available to display charts.",
  domainFilter: "Domain history filter",
  heading: "Threat level over time",
  threatLevel: "Threat level",
  noScansForDomain: "No scans found for the selected domain.",
  /** Name of the chart itself, which keyboard users can focus. */
  chartTitle: (url: string) => `Threat level over time: ${url}`,
  keyboardHint: "Use the left and right arrow keys to move between scans.",
  /** Text alternative to the chart, with dates already formatted. */
  summary: (url: string, count: number, from: string, to: string) =>
    `${url}: ${count} ${pluralEn(count, "scan", "scans")}, ${from === to ? `on ${from}` : `from ${from} to ${to}`}.`,
  levels: (latest: string, highest: string, lowest: string) =>
    `Latest threat level: ${latest}. Highest: ${highest}. Lowest: ${lowest}.`,
  tableCaption: (url: string) => `Threat level in each scan of ${url}`,
  scanDate: "Scan date",
};

export default charts;
