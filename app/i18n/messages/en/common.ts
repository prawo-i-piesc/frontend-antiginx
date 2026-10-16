import { pluralEn } from "@/app/i18n/plural";

/** Words and phrases used across the whole app. */
const common = {
  appName: "Antiginx",
  homeLink: "Antiginx home page",
  skipToContent: "Skip to main content",

  close: "Close",
  cancel: "Cancel",
  save: "Save",
  continue: "Continue",
  back: "Back",
  done: "Done",
  edit: "Edit",
  change: "Change",
  remove: "Remove",
  delete: "Delete",
  retry: "Try again",
  search: "Search",
  actions: "Actions",
  or: "or",
  loading: "Loading…",
  working: "Working…",
  comingSoon: "Coming soon",
  opensInNewTab: "(opens in a new tab)",

  networkError: "We could not reach the server. Check your connection and try again.",
  genericError: "Something went wrong. Try again in a moment.",
  retryInMinutes: (minutes: number) =>
    pluralEn(minutes, "Try again in about a minute.", `Try again in about ${minutes} minutes.`),

  language: {
    label: "Interface language",
    changed: "Interface language: English",
  },

  toast: {
    region: "Notifications",
    dismiss: "Dismiss notification",
  },

  pagination: {
    label: "Pagination",
    previous: "Previous",
    next: "Next",
    previousPage: "Previous page",
    nextPage: "Next page",
    page: (page: number) => `Page ${page}`,
    range: (from: number, to: number, total: number) => `Showing ${from}–${to} of ${total}`,
  },
};

export default common;
