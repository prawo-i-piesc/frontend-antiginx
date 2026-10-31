import type { Messages } from "@/app/i18n/messages/en";

const widgets: Messages["widgets"] = {
  names: {
    totalScans: "Wszystkie skany",
    safeSites: "Bezpieczne strony",
    threats: "Wykryte zagrożenia",
    recentScans: "Ostatnie skany",
    topThreats: "Najczęściej nieudane testy",
    riskTrend: "Ryzyko w czasie",
    averageRisk: "Średnie ryzyko",
    domains: "Domeny",
    failedTests: "Nieudane testy",
    domainRisk: "Ryzyko domen",
    severity: "Nieudane testy według wagi",
    totalUsers: "Łączna liczba użytkowników",
    activeScans: "Wszystkie skany",
    newRegistrations: "Nowe rejestracje",
    failedChecks: "Najczęściej nieudane testy",
  },

  kpi: {
    inProgress: (count) => `${count} w toku`,
    noneInProgress: "Nic w toku",
    window: "W ostatnich 30 dniach",
    failedOf: (run) => `Z ${run} w ostatnich 30 dniach`,
  },

  noData: "Brak danych",
  viewAll: "Pokaż wszystkie",
  trend: {
    up: "Wzrost",
    down: "Spadek",
  },

  board: {
    customize: "Dostosuj",
    dragHint: "Przeciągnij widżet za uchwyt, aby go przenieść.",
    keyboardHint: "Spacja lub Enter podnosi i upuszcza widżet, strzałki go przesuwają, a Escape anuluje.",
    move: (name) => `Przenieś widżet: ${name}`,
    moveEarlier: "Przesuń wcześniej",
    moveLater: "Przesuń dalej",
    remove: (name) => `Usuń widżet: ${name}`,
    add: (name) => `Dodaj widżet: ${name}`,
    available: "Dostępne widżety",
    reset: "Przywróć domyślne",
    announce: {
      grabbed: (name, position, total) => `Podniesiono widżet „${name}”. Pozycja ${position} z ${total}.`,
      moved: (name, position, total) => `Przeniesiono widżet „${name}” na pozycję ${position} z ${total}.`,
      dropped: (name, position, total) => `Upuszczono widżet „${name}” na pozycji ${position} z ${total}.`,
      cancelled: (name, position, total) =>
        `Anulowano przenoszenie. Widżet „${name}” wrócił na pozycję ${position} z ${total}.`,
      removed: (name) => `Usunięto widżet „${name}”.`,
      reset: "Przywrócono domyślny układ.",
      added: (name, position, total) => `Dodano widżet „${name}” na pozycji ${position} z ${total}.`,
    },
  },

  recentScans: {
    viewAllContext: "skany",
    loading: "Ładowanie ostatnich skanów…",
    empty: "Brak ostatnich skanów.",
    error: "Nie udało się wczytać ostatnich skanów.",
  },

  newRegistrations: {
    window: "w ostatnich 7 dniach",
  },

  failedChecks: {
    scope: "Wszystkie skany, 30 dni",
  },

  scanStatus: {
    safe: "Bezpieczna",
    suspicious: "Podejrzana",
    dangerous: "Niebezpieczna",
  },
};

export default widgets;
