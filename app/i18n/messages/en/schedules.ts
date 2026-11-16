import { pluralEn } from "@/app/i18n/plural";

const weekdaysLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Scheduled scans: the dashboard page, its marks in the scan list and the admin view. */
const schedules = {
  title: "Schedules",
  subtitle: "Scans that run by themselves, daily, weekly or monthly",
  newSchedule: "New schedule",

  /** Sunday first, as Date.getDay() counts. */
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdaysLong,

  cadence: {
    daily: (time: string) => `Daily at ${time}`,
    weekly: (weekday: number, time: string) => `Every ${weekdaysLong[weekday]} at ${time}`,
    monthly: (day: number, time: string) => `Monthly on day ${day} at ${time}`,
    /** After the cadence when the schedule keeps another time zone than this browser. */
    zone: (zone: string) => `${zone} time`,
  },

  paywall: {
    title: "Schedules are part of Pro",
    body: "Pick a site, the tests and a time, and the scan runs daily, weekly or monthly. Its results go to Scans and Charts like any other scan.",
    action: "See plans",
    /** Over the list of an account that had schedules and no longer has Pro. */
    lapsed: "These schedules do not run without the Pro plan. You can still pause or delete them.",
  },

  form: {
    titleNew: "New schedule",
    titleEdit: "Edit schedule",
    urlLabel: "Target URL",
    urlPlaceholder: "example.com",
    urlRequired: "Enter the address of the website to scan.",
    frequency: "Repeat",
    frequencies: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
    time: "Time",
    weekday: "Day of the week",
    monthDay: "Day of the month",
    monthDayHint: "Up to the 28th, so it falls in every month.",
    zone: (zone: string) => `Times are in your time zone, ${zone}.`,
    scope: "Test scope",
    save: "Save schedule",
    saving: "Saving…",
    cancel: "Cancel",
  },

  calendar: {
    legend: { done: "Done", failed: "Failed", planned: "Planned" },
    dayEmpty: "Nothing on this day.",
    label: "Calendar of scheduled scans",
    previous: "Previous month",
    next: "Next month",
    today: "Today",
    loadError: "We could not load the calendar.",
    /** A day with more entries than its cell shows. */
    more: (count: number) => `+${count} more`,
    planned: (url: string, time: string) => `${url}, planned at ${time}`,
    run: (url: string, time: string, status: string) => `${url} at ${time}, ${status}`,
    nothing: "Nothing planned this month.",
    dayEntries: (count: number) => `${count} ${pluralEn(count, "entry", "entries")}`,
  },

  table: {
    caption: "Your schedules",
    count: (count: number, limit: number) => `${count} of ${limit}`,
    countLabel: (count: number, limit: number) =>
      `${count} of ${limit} ${pluralEn(limit, "schedule", "schedules")} your plan allows`,
    loadError: "We could not load your schedules.",
    empty: "No schedules yet. Add one to scan a site on a regular basis.",
    columns: {
      target: "Target",
      cadence: "Repeats",
      next: "Next scan",
      last: "Last scan",
      state: "State",
    },
    states: { active: "Active", paused: "Paused", blocked: "Blocked" },
    blockedNote: "Blocked by an administrator",
    blockReason: (reason: string) => `Reason: ${reason}`,
    notYet: "Not yet",
    /** Why the last term passed without a scan. */
    skipped: {
      PRO_REQUIRED: "Skipped, needs Pro",
      QUEUE_UNAVAILABLE: "Skipped, the queue was down",
      INVALID_TARGET: "Skipped, address not allowed",
    },
    runs: (count: number) => `${count} ${pluralEn(count, "scan", "scans")}`,
    history: (url: string) => `Scans started by the schedule for ${url}`,
    pause: (url: string) => `Pause the schedule for ${url}`,
    resume: (url: string) => `Resume the schedule for ${url}`,
    edit: (url: string) => `Edit the schedule for ${url}`,
    delete: (url: string) => `Delete the schedule for ${url}`,
    lastScan: (url: string) => `Last scan of ${url}`,
  },

  deleteDialog: {
    title: "Delete this schedule?",
    description: (url: string) =>
      `${url} stops being scanned on schedule. The scans it has already run stay in Scans.`,
    confirm: "Delete schedule",
  },

  toasts: {
    created: "Schedule saved",
    saved: "Changes saved",
    paused: "Schedule paused",
    resumed: "Schedule resumed",
    deleted: "Schedule deleted",
  },

  /** In the scan list. */
  fromSchedule: "Started by a schedule",
  onlySchedule: "Scans of one schedule",
  clearSchedule: "Show all scans",

  admin: {
    title: "Schedules",
    description: "Scheduled scans of every account, newest first.",
    caption: "Schedules of every account, newest first.",
    search: "Search by address or email",
    stateFilter: "State",
    allStates: "All states",
    empty: "No account has a schedule yet.",
    noMatches: "No schedule matches these filters.",
    clearFilters: "Clear filters",
    columns: { owner: "Owner" },
    ownerGone: "deleted account",
    block: (url: string) => `Block the schedule for ${url}`,
    unblock: (url: string) => `Lift the block on the schedule for ${url}`,
    blockTitle: "Block this schedule?",
    blockDescription: (url: string, owner: string) =>
      `${url} stops being scanned for ${owner}. They see the reason and cannot resume the schedule until you lift the block.`,
    blockReason: "Reason shown to the owner (optional)",
    blockConfirm: "Block schedule",
    unblockTitle: "Lift the block?",
    unblockDescription: (url: string) =>
      `The owner can run the schedule for ${url} again. If they left it on, it continues from its next term.`,
    unblockConfirm: "Lift block",
    blocked: "Schedule blocked",
    unblocked: "Block lifted",
  },
};

export default schedules;
