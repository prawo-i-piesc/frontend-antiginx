import type { Messages } from "@/app/i18n/messages/en";

const scanner: Messages["scanner"] = {
  title: "Skaner",
  subtitle: "Przeglądaj wszystkie zakończone skany stron",
  newScan: "Nowy skan",

  form: {
    title: "Uruchom nowy skan",
    urlLabel: "Adres celu",
    urlPlaceholder: "https://example.com",
    urlRequired: "Wpisz adres strony do przeskanowania.",
    scope: "Zakres testów",
    testsLoadError: "Nie udało się wczytać listy testów.",
    selectCategory: (category) => `Zaznacz wszystkie testy: ${category}`,
    selectedCount: (selected, total) => `Zaznaczono ${selected} z ${total}`,
    noTestsSelected: "Nie wybrano żadnego testu",
    allSelected: (total) => `Wszystkie testy: ${total}`,
    categoryAll: "Zaznacz wszystkie",
    categoryNone: "Odznacz wszystkie",
    // "z" takes the genitive: z 1 testu, z 2 testów, z 5 testów.
    totalSelected: (selected, total) => `Zaznaczono ${selected} z ${total} ${total === 1 ? "testu" : "testów"}`,
    authorization:
      "Potwierdzam, że mam uprawnienia do testowania tej domeny skanerem antybotowym Antiginx oraz wszystkie zgody potrzebne do przeprowadzenia testów bezpieczeństwa strony docelowej.",
    submit: "Uruchom skan",
    scanning: "Skanowanie…",
  },

  announce: {
    started: (url) => `Trwa skanowanie ${url}…`,
    finished: "Skanowanie zakończone.",
    failed: "Skanowanie nie powiodło się.",
  },

  list: {
    caption: "Zakończone skany",
    searchLabel: "Szukaj skanów po adresie URL",
    searchPlaceholder: "Szukaj po adresie URL…",
    filterLabel: "Filtruj według statusu",
    filters: {
      all: "Wszystkie",
      safe: "Bezpieczne",
      warning: "Ostrzeżenia",
      danger: "Niebezpieczne",
    },
    loading: "Ładowanie skanów…",
    loadError: "Nie udało się wczytać skanów.",
    clearFilters: "Wyczyść filtry",
    allStatuses: "Wszystkie statusy",
    empty: "Brak skanów na tym koncie.",
    noMatches: "Żaden skan nie pasuje do wyszukiwania ani filtra.",
    columns: {
      status: "Status",
      date: "Data",
      duration: "Czas trwania",
    },
    status: {
      safe: "Bezpieczna",
      warning: "Ostrzeżenie",
      danger: "Zagrożenie",
    },
    scanId: (id) => `ID skanu: ${id}`,
    underOneSecond: "poniżej sekundy",
    viewDetails: (url) => `Pokaż szczegóły: ${url}`,
    downloadReport: (url) => `Pobierz raport: ${url}`,
    deleteComingSoon: (url) => `Usuń skan: ${url} (wkrótce)`,
  },

  detail: {
    back: "Wróć do listy",
    resultsHeading: "Wyniki testów",
    failed: "Ten skan nie powiódł się i nie ma wyników.",
    noResults: "Ten skan nie ma wyników testów.",
  },
};

export default scanner;
