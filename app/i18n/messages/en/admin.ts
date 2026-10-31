import { pluralEn } from "@/app/i18n/plural";

/**
 * The admin panel's users and scans views and the account inspector. Values
 * from the database (emails, addresses, IDs) are shown as they are.
 */
const admin = {
  noAccess: {
    title: "No administrator access",
    description:
      "Your account does not have the administrator role any more, so the panel cannot load anything. If that is a mistake, ask another administrator.",
    back: "Go to your dashboard",
  },

  loadError: "We could not load this list.",
  you: "you",

  roles: { admin: "admin", user: "user" },

  users: {
    title: "Users",
    description: "Every account on the platform, newest first.",
    search: "Search by email or name",
    caption: "Accounts, newest first.",
    empty: "There are no accounts yet.",
    noMatches: (query: string) => `No account matches “${query}”.`,
    clearSearch: "Clear search",
    columns: {
      id: "ID",
      email: "Email",
      name: "Name",
      role: "Role",
      verification: "Email address",
      totp: "TOTP",
      created: "Created",
      actions: "Actions",
    },
    verified: "verified",
    unverified: "unverified",
    totpOn: "on",
    totpOff: "off",
    inspect: "Details",
    inspectContext: (email: string) => `of ${email}`,
  },

  scans: {
    title: "Scans",
    description: "Free and premium scans together, newest first.",
    caption: "Scans, newest first.",
    search: "Search by target address",
    ownerFilter: (owner: string) => `Owner: ${owner}`,
    clearOwner: "Remove the owner filter",
    typeFilter: "Scan type",
    statusFilter: "Status",
    allTypes: "All",
    allStatuses: "All statuses",
    types: { free: "free", premium: "premium" },
    empty: "There are no scans yet.",
    noMatches: "No scan matches these filters.",
    clearFilters: "Clear filters",
    columns: {
      id: "ID",
      target: "Target",
      type: "Type",
      status: "Status",
      owner: "Owner",
      created: "Created",
      actions: "Actions",
    },
    anonymous: "anonymous",
    ownerGone: "deleted account",
    openOwner: (owner: string) => `Account details of ${owner}`,
    inspect: "Details",
    inspectContext: (url: string) => `of the scan of ${url}`,
    delete: (url: string) => `Delete the scan of ${url}`,
    deleteTitle: "Delete this scan?",
    deleteDescription: (url: string) =>
      `The scan of ${url} is deleted together with all its results. This cannot be undone.`,
    deleteConfirm: "Delete scan",
    deleted: "Scan deleted",
  },

  inspector: {
    title: "Account details",
    loadError: "We could not load this account.",
    sections: {
      identity: "Identity",
      security: "Sign-in and security",
      activity: "Activity",
      actions: "Actions",
    },
    fields: {
      id: "ID",
      email: "Email",
      name: "Name",
      role: "Role",
      created: "Created",
      emailVerified: "Email verified",
      password: "Password",
      passkeyMode: "Passkey mode",
      totp: "TOTP",
      passkeys: "Passkeys",
      recoveryCodes: "Recovery codes left",
      providers: "Linked providers",
      sessions: "Active sessions",
      premiumScans: "Premium scans",
    },
    passkeyModes: { second_factor: "second factor", passwordless: "passwordless" },
    yes: "yes",
    no: "no",
    set: "set",
    notSet: "not set",
    on: "on",
    off: "off",
    none: "none",
    showScans: "show",
    showScansContext: "this account's premium scans",
    selfNote: "This is your own account. The panel does not change it: use your profile instead.",
    profileLink: "Open your profile",

    makeAdmin: "Make administrator",
    removeAdmin: "Remove administrator role",
    logout: "Sign out everywhere",
    delete: "Delete account",

    grant: {
      title: "Make this account an administrator?",
      description: (email: string) =>
        `${email} gets full access to the admin panel: every account and every scan on the platform.`,
      confirm: "Make administrator",
      done: (email: string) => `${email} is now an administrator`,
    },
    revoke: {
      title: "Remove the administrator role?",
      description: (email: string) => `${email} loses access to the admin panel with their next request.`,
      confirm: "Remove role",
      done: (email: string) => `${email} is no longer an administrator`,
    },
    signOut: {
      title: "Sign this account out everywhere?",
      description: (email: string) =>
        `Every session of ${email} is revoked. A page they already have open keeps working until its access token expires, a few minutes at most.`,
      confirm: "Sign out everywhere",
      done: (email: string) => `${email} is signed out everywhere`,
    },
    remove: {
      title: "Delete this account?",
      description: (email: string) =>
        `The account ${email} is deleted with its premium scans, sessions and sign-in methods, and an active Pro subscription is cancelled. This cannot be undone.`,
      typeToConfirm: "Type the email address to confirm",
      mismatch: "This does not match the account's email address.",
      confirm: "Delete account",
      done: (email: string) => `Account ${email} deleted`,
    },
  },

  scanInspector: {
    title: "Scan details",
    loadError: "We could not load this scan.",
    sections: { scan: "Scan", results: "Results" },
    fields: {
      id: "ID",
      target: "Target",
      type: "Type",
      status: "Status",
      owner: "Owner",
      created: "Created",
      started: "Started",
      completed: "Completed",
      duration: "Duration",
    },
    seconds: (shown: string) => `${shown} s`,
    summary: (total: number, failed: number) =>
      `${pluralEn(total, "1 test", `${total} tests`)}, ${failed} failed`,
    columns: { result: "Result", test: "Test", severity: "Severity" },
    noResults:
      "No results yet. The scan is still queued or running, or it stopped before any test finished.",
  },
};

export default admin;
