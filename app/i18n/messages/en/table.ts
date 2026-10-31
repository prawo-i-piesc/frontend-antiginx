import { pluralEn } from "@/app/i18n/plural";

/** Shared by every data table: the admin lists and the scanner. */
const table = {
  /** `shown` is the count formatted for the locale. */
  records: (count: number, shown: string) => pluralEn(count, `${shown} record`, `${shown} records`),
  pageSize: "Rows per page",
  copyId: (id: string) => `Copy ID ${id}`,
  copied: "ID copied",
  copyFailed: "Could not copy. Select the ID and copy it by hand.",
  noValue: "No value",
};

export default table;
