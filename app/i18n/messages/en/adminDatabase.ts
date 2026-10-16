import { pluralEn } from "@/app/i18n/plural";

/**
 * The admin database browser. Cell values are database data and are shown as
 * they are, except dates, yes/no flags and the enums known below.
 */
const adminDatabase = {
  title: "Database",
  subtitle: "Browse and manage database entries.",
  tableSwitcher: "Database table",
  tables: {
    users: { name: "Users", search: "Search users" },
    scans: { name: "Scans", search: "Search scans" },
    premium_scans: { name: "Premium scans", search: "Search premium scans" },
  },
  tableLabel: (table: string) => `${table} table`,
  caption: (table: string) => `${table} table. Select a column header to sort.`,
  sortedAscending: (column: string) => `Sorted by ${column}, ascending`,
  sortedDescending: (column: string) => `Sorted by ${column}, descending`,
  found: "Found:",
  loadError: "We could not load this table.",
  forbidden: "You do not have permission to view this table.",
  empty: "Table is empty.",
  noMatches: "No matching data found.",
  noValue: "No value",
  yes: "Yes",
  no: "No",
  itemCount: (count: number) => `[${count} ${pluralEn(count, "item", "items")}]`,
  object: "Object {…}",

  /** Keyed by column name; others are shown with underscores as spaces. */
  columns: {
    id: "ID",
    email: "Email",
    full_name: "Full name",
    role: "Role",
    status: "Status",
    email_verified: "Email verified",
    created_at: "Created",
    updated_at: "Updated",
    target_url: "Target URL",
    user_id: "User ID",
    user: "User",
    started_at: "Started",
    completed_at: "Completed",
    results: "Results",
  } as Record<string, string>,

  roles: {
    admin: "Admin",
    user: "User",
  } as Record<string, string>,
};

export default adminDatabase;
