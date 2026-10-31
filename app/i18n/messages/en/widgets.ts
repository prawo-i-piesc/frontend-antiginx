/** The widget board shared by the dashboard and admin overviews, and the widgets on it. */
const widgets = {
  /** Keyed by widget type: the card's label, and the name the board's controls use. */
  names: {
    totalScans: "Total scans",
    safeSites: "Safe sites",
    threats: "Detected threats",
    recentScans: "Recent scans",
    topThreats: "Most failed checks",
    riskTrend: "Risk over time",
    averageRisk: "Average risk",
    domains: "Domains",
    failedTests: "Failed checks",
    domainRisk: "Risk by domain",
    severity: "Failed checks by severity",
    totalUsers: "Total users",
    activeScans: "All-time scans",
    newRegistrations: "New registrations",
    failedChecks: "Most failed checks",
  },

  /** Lines under the overview's figures. */
  kpi: {
    inProgress: (count: number) => `${count} in progress`,
    noneInProgress: "None in progress",
    window: "In the last 30 days",
    failedOf: (run: string) => `Of ${run} in the last 30 days`,
  },

  noData: "No data",
  viewAll: "View all",
  trend: {
    up: "Increase",
    down: "Decrease",
  },

  board: {
    customize: "Customize",
    dragHint: "Drag a widget by its handle to move it.",
    /** Also the description of every move handle. */
    keyboardHint: "Space or Enter picks a widget up and drops it, the arrow keys move it, and Escape cancels.",
    move: (name: string) => `Move widget: ${name}`,
    moveEarlier: "Move earlier",
    moveLater: "Move later",
    remove: (name: string) => `Remove widget: ${name}`,
    add: (name: string) => `Add widget: ${name}`,
    available: "Available widgets",
    reset: "Restore defaults",
    /** Read out by screen readers as the board changes. */
    announce: {
      grabbed: (name: string, position: number, total: number) =>
        `Picked up ${name}. Position ${position} of ${total}.`,
      moved: (name: string, position: number, total: number) =>
        `Moved ${name} to position ${position} of ${total}.`,
      dropped: (name: string, position: number, total: number) =>
        `Dropped ${name} at position ${position} of ${total}.`,
      cancelled: (name: string, position: number, total: number) =>
        `Move cancelled. ${name} is back at position ${position} of ${total}.`,
      removed: (name: string) => `Removed ${name}.`,
      reset: "Restored the default layout.",
      added: (name: string, position: number, total: number) =>
        `Added ${name} at position ${position} of ${total}.`,
    },
  },

  recentScans: {
    /** Completes "View all" for screen readers: "View all scans". */
    viewAllContext: "scans",
    loading: "Loading recent scans…",
    empty: "No recent scans found.",
    error: "Could not load recent scans.",
  },

  newRegistrations: {
    window: "in the last 7 days",
  },

  failedChecks: {
    /** The admin widget counts every account's scans, free ones included. */
    scope: "All scans, 30 days",
  },

  scanStatus: {
    safe: "Safe",
    suspicious: "Suspicious",
    dangerous: "Dangerous",
  },
};

export default widgets;
