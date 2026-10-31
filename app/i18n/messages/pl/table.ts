import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const table: Messages["table"] = {
  records: (count, shown) => `${shown} ${pluralPl(count, "rekord", "rekordy", "rekordów")}`,
  pageSize: "Wierszy na stronę",
  copyId: (id) => `Kopiuj ID ${id}`,
  copied: "Skopiowano ID",
  copyFailed: "Nie udało się skopiować. Zaznacz ID i skopiuj je ręcznie.",
  noValue: "Brak wartości",
};

export default table;
