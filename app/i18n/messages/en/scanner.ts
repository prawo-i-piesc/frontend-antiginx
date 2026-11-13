import { pluralEn } from "@/app/i18n/plural";

/**
 * The dashboard scanner: the list of scans, the new-scan form and the results
 * view. Test names, categories, severities and the results copy shared with
 * other screens live in `scan`.
 */
const scanner = {
  title: "Scanner",
  subtitle: "Your website scans, running and finished",
  newScan: "New scan",

  form: {
    title: "Run new scan",
    urlLabel: "Target URL",
    urlPlaceholder: "example.com",
    urlRequired: "Enter the address of the website to scan.",
    scope: "Test scope",
    testsLoadError: "We could not load the list of tests.",
    selectedCount: (selected: number, total: number) => `${selected} of ${total} selected`,
    noTestsSelected: "No tests selected",
    allSelected: (total: number) => `All ${total} tests`,
    categoryAll: "Select all",
    /** Spoken and on hover for a check the plan does not include; the chip links to the pricing page. */
    proTest: "On the Pro plan, see plans",
    categoryNone: "Select none",
    totalSelected: (selected: number, total: number) =>
      `${selected} of ${total} ${pluralEn(total, "test", "tests")} selected`,
    authorization:
      "I confirm that I am authorized to test this domain with the Antiginx anti-bot scanner and that I have obtained all permissions needed to run security tests on the target website.",
    submit: "Start scan",
    scanning: "Scanning…",
  },

  /** Read out by screen readers while a scan started on this page runs. */
  announce: {
    started: (url: string) => `Scanning ${url}…`,
    finished: "Scan finished.",
    failed: "The scan failed.",
  },

  list: {
    caption: "Scans",
    searchLabel: "Search scans by URL",
    searchPlaceholder: "Search by URL…",
    filterLabel: "Filter by status",
    filters: {
      active: "In progress",
      COMPLETED: "Completed",
      FAILED: "Failed",
    },
    loading: "Loading scans…",
    loadError: "We could not load your scans.",
    clearFilters: "Clear filters",
    allStatuses: "All statuses",
    empty: "No scans found for this account.",
    noMatches: "No scans match your search or filter.",
    columns: {
      status: "Status",
      date: "Date",
      duration: "Duration",
    },
    /** Spoken in place of the "<1s" shown on screen. */
    underOneSecond: "less than a second",
    viewDetails: (url: string) => `Show details: ${url}`,
    downloadReport: (url: string) => `Download report: ${url}`,
    deleteComingSoon: (url: string) => `Delete scan: ${url} (coming soon)`,
  },

  detail: {
    back: "Back to list",
    loadError: "We could not load this scan.",
    resultsHeading: "Test results",
    failed: "This scan failed and has no results.",
    noResults: "This scan has no test results.",
  },
};

export default scanner;
