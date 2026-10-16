import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const adminDatabase: Messages["adminDatabase"] = {
  title: "Baza danych",
  subtitle: "Przeglądaj wpisy w bazie danych i zarządzaj nimi.",
  tableSwitcher: "Tabela bazy danych",
  tables: {
    users: { name: "Użytkownicy", search: "Szukaj użytkowników" },
    scans: { name: "Skany", search: "Szukaj skanów" },
    premium_scans: { name: "Skany premium", search: "Szukaj skanów premium" },
  },
  tableLabel: (table) => `Tabela „${table}”`,
  caption: (table) => `Tabela „${table}”. Wybierz nagłówek kolumny, aby posortować.`,
  sortedAscending: (column) => `Posortowano według kolumny „${column}”, rosnąco`,
  sortedDescending: (column) => `Posortowano według kolumny „${column}”, malejąco`,
  found: "Znaleziono:",
  loadError: "Nie udało się wczytać tej tabeli.",
  forbidden: "Nie masz uprawnień do przeglądania tej tabeli.",
  empty: "Tabela jest pusta.",
  noMatches: "Brak pasujących danych.",
  noValue: "Brak wartości",
  yes: "Tak",
  no: "Nie",
  itemCount: (count) => `[${count} ${pluralPl(count, "element", "elementy", "elementów")}]`,
  object: "Obiekt {…}",

  columns: {
    id: "ID",
    email: "E-mail",
    full_name: "Imię i nazwisko",
    role: "Rola",
    status: "Status",
    email_verified: "E-mail potwierdzony",
    created_at: "Utworzono",
    updated_at: "Zaktualizowano",
    target_url: "Adres celu",
    user_id: "ID użytkownika",
    user: "Użytkownik",
    started_at: "Rozpoczęto",
    completed_at: "Zakończono",
    results: "Wyniki",
  },

  roles: {
    admin: "Administrator",
    user: "Użytkownik",
  },
};

export default adminDatabase;
