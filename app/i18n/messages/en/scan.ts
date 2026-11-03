import { pluralEn } from "@/app/i18n/plural";

/**
 * Vocabulary shared by every screen that shows a scan: the landing page modal,
 * the dashboard scanner and the report download.
 *
 * Test names are keyed by the engine's test id. The engine's own `message`
 * text is data, not copy, and stays in English — render it with lang="en".
 */
const scan = {
  severity: {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
    INFO: "Info",
  },

  status: {
    PENDING: "Pending",
    RUNNING: "Running",
    COMPLETED: "Completed",
    FAILED: "Failed",
  },

  /** A test's row in the results: its outcome, or why it does not have one. */
  verdict: {
    passed: "Passed",
    failed: "Failed",
    notice: "Notice",
    pending: "Waiting",
    missing: "No result",
  },

  riskBands: {
    none: "No findings",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  },
  riskLegend: "Low 1–24, medium 25–49, high 50–74, critical 75–100",

  /** The results table, shown live while a scan runs. */
  live: {
    /** The scan never reported its end, or has not yet. */
    noSignal: "No end signal",
    summary: {
      status: "Status",
      tests: "Tests",
      risk: "Risk",
      findings: "Findings",
      time: "Time",
      connection: "Updates",
      finished: "Finished",
    },
    transport: {
      connecting: "Connecting…",
      live: "Live",
      polling: "Every 2 s",
      closed: "Stopped",
    },
    stalled: "No new results for 2 minutes. What is shown may be incomplete.",
    stalledShort: "No new results for 2 minutes",
    gaveUp: "Stopped waiting for this scan. Results may be incomplete.",
    gaveUpShort: "Stopped waiting",
    checkAgain: "Check again",
    waitingFirst: "Waiting for the first result…",
    failedCount: (count: number) => `Failed: ${count}.`,
    columns: {
      result: "Result",
      test: "Test",
      message: "Details",
      severity: "Severity",
    },
    filters: {
      searchLabel: "Search tests",
      searchPlaceholder: "Search tests and details…",
      resultLabel: "Filter by result",
      allResults: "All results",
      severityLabel: "Filter by severity",
      allSeverities: "All severities",
      categoryLabel: "Filter by category",
      allCategories: "All categories",
      shown: (shown: string, total: string) => `${shown} of ${total}`,
      noMatches: "No tests match these filters.",
    },
    details: {
      label: (test: string) => `Details: ${test}`,
      message: "Message",
      category: "Category",
      id: "Test ID",
      data: "Recorded data",
      pending: "This test has not reported yet.",
      noMessage: (test: string) => `The engine reported nothing for ${test}.`,
    },
  },

  /** Full names, as the engine reports them. */
  tests: {
    https: "HTTPS Protocol Verification",
    hsts: "HSTS Header Analysis",
    "ssl-cert": "SSL Certificate Security Analysis",
    csp: "Content Security Policy Analysis",
    xframe: "X-Frame-Options & CSP Frame Protection Analysis",
    "permissions-policy": "Permissions-Policy Header Analysis",
    "x-content-type-options": "X-Content-Type-Options Header Analysis",
    "referrer-policy": "Referrer-Policy Header Analysis",
    "cross-origin-x": "Cross-Origin Security Headers Analysis",
    "cookie-sec": "Cookie Security Analysis",
    "serv-h-a": "Server Technology Disclosure Analysis",
    sitemap: "Sitemap Security Analysis",
    "js-obf": "JavaScript Obfuscation Detection",
    "phishing-url": "Phishing URL Analysis",
    "dns-reputation": "DNS and Domain Registration Analysis",
    "favicon-origin": "Favicon Origin Analysis",
    "bot-protection": "Bot Protection Block Assessment",
    "cache-control": "Cache-Control Analysis",
    "robots-txt": "Robots.txt Security Analysis",
    urlhaus: "URLhaus Malicious URL Lookup",
    "dir-listing": "Directory Listing Detection",
    "sensitive-files": "Sensitive File Exposure",
  } as Record<string, string>,

  /** Short labels for the test picker. */
  testsShort: {
    https: "HTTPS",
    hsts: "HSTS",
    "ssl-cert": "SSL certificate",
    csp: "Content Security Policy",
    xframe: "X-Frame-Options",
    "permissions-policy": "Permissions Policy",
    "x-content-type-options": "X-Content-Type-Options",
    "referrer-policy": "Referrer Policy",
    "cross-origin-x": "Cross-Origin headers",
    "cookie-sec": "Cookie security",
    "serv-h-a": "Server header",
    sitemap: "Sitemap",
    "js-obf": "JavaScript obfuscation",
    "phishing-url": "Phishing URL",
    "dns-reputation": "DNS reputation",
    "favicon-origin": "Favicon origin",
    "bot-protection": "Bot protection",
    "cache-control": "Cache-Control",
    "robots-txt": "Robots.txt",
    urlhaus: "URLhaus database",
    "dir-listing": "Directory listing",
    "sensitive-files": "Sensitive files",
  } as Record<string, string>,

  /** Keyed by the category name the backend sends. */
  categories: {
    "SSL/TLS & Encryption": "SSL/TLS & Encryption",
    "Security Headers": "Security Headers",
    "Privacy & Session Management": "Privacy & Session Management",
    "Reconnaissance & Server Information": "Reconnaissance & Server Information",
    "Vulnerabilities & Code Analysis": "Vulnerabilities & Code Analysis",
  } as Record<string, string>,
  categoryOther: "Other",

  resultsTitle: "Security scan results",
  target: "Target",
  riskScore: "Risk score",
  testsCompleted: (count: number) => `${count} ${pluralEn(count, "test", "tests")} completed`,
  export: "Export",
  exportReport: "Export report",
  downloadReport: "Download report",
  /** Explains why test messages are not translated. */
  engineLanguageNote: "Test details come from the scanning engine and are in English.",

  errorTitle: "Scan failed",
  errors: {
    network: "Cannot connect to the scanner. Check your connection and try again.",
    invalidRequest: "Invalid scan request. Check the address and try again.",
    unauthorized: "You are not allowed to run this scan. Sign in again.",
    proRequired: "Some of the selected checks need the Pro plan. Deselect them or move to Pro.",
    notFound: "Scan not found. The job may have expired or been removed.",
    rateLimited: "Too many requests. Wait a moment and try again.",
    server: "The scanner is temporarily unavailable. Try again shortly.",
    unexpected: "An unexpected error occurred while scanning this address.",
  },

  report: {
    title: "Download report",
    /** Read before the address in the dialog header. */
    target: "Report for",
    formatLabel: "Format",
    formats: {
      pdf: { name: "PDF", description: "Ready to print and share." },
      html: { name: "HTML", description: "A single page that opens in any browser, offline too." },
      md: { name: "Markdown", description: "For tickets, wikis and repositories." },
      sarif: { name: "SARIF", description: "For security tools such as GitHub code scanning." },
    },
    preview: "Preview",
    previewLoading: "Generating preview…",
    previewError: "We could not generate the preview.",
    previewFrame: (url: string) => `Report preview: ${url}`,
    /** The report follows the interface language; the engine's test names and messages stay in English. */
    previewNote: "Every format holds the same content as this preview.",
    download: "Download",
    downloadAs: (format: string) => `Download ${format}`,
    generating: "Generating report…",
    downloaded: "Report downloaded",
    downloadFailed: "We could not generate the report.",
    errors: {
      notFinished: "The scan has not finished yet. Wait until it completes.",
      notFound: "Scan not found. It may have been removed.",
      network: "We could not reach the server. Check your connection and try again.",
      rateLimited: "Too many requests. Wait a moment and try again.",
      server: "The report service is temporarily unavailable. Try again shortly.",
      unexpected: "Something went wrong. Try again in a moment.",
    },
    /** Read before the severity of each result. */
    severity: "Severity",
  },
};

export default scan;
