import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const charts: Messages["charts"] = {
  title: "Wykresy",
  subtitle: "Ryzyko, nieudane testy i historia skanów Twoich stron",
  loadError: "Nie udało się wczytać statystyk.",
  noScans: "Nie masz jeszcze zakończonych skanów. Zakończone skany pojawią się tutaj.",
  noScansInPeriod: "Brak zakończonych skanów w tym okresie.",
  newScan: "Nowy skan",
  keyboardHint: "Przechodź między punktami strzałkami w lewo i w prawo.",

  metric: {
    summary: (label, now, peak) => `${label}: teraz ${now}, maksymalnie ${peak}.`,
  },

  filters: {
    domain: "Domena",
    allDomains: "Wszystkie domeny",
    period: "Okres",
    periods: { 30: "30 dni", 90: "90 dni", 365: "1 rok" },
  },

  kpi: {
    scans: "Zakończone skany",
    acrossDomains: (count) => `${count} ${pluralPl(count, "domena", "domeny", "domen")}`,
    since: (date) => `pierwszy ${date}`,
    averageRisk: "Średnie ryzyko",
    averageHint: "na skan w tym okresie",
    latestRisk: "Ostatnie ryzyko",
    belowAverage: (points) => `${points} poniżej średniej`,
    aboveAverage: (points) => `${points} powyżej średniej`,
    atAverage: "Tyle co średnia",
    failedChecks: "Nieudane testy",
    failedOf: (run, share) => `z ${run} uruchomionych, ${share}`,
    outOf: "/ 100",
  },

  risk: {
    heading: "Ryzyko w czasie",
    perScan: "Każdy skan",
    daily: "Średnia dzienna",
    weekly: "Średnia tygodniowa",
    value: "Ryzyko",
    chartTitle: (scope) => `Ryzyko w czasie: ${scope}`,
    scanDetail: (failed, tests) => `${failed} z ${tests} ${pluralPl(tests, "testu", "testów", "testów")} nieudanych`,
    bucketDetail: (count) => `Średnia z ${count} ${pluralPl(count, "skanu", "skanów", "skanów")}`,
    week: (date) => `Tydzień od ${date}`,
    footnote:
      "Ryzyko od 0 do 100. Najgorszy nieudany test wyznacza pasmo (niskie od 1, średnie od 25, wysokie od 50, krytyczne od 75), a każdy kolejny je podnosi.",
    date: "Data",
  },

  severity: {
    heading: "Nieudane testy według wagi",
    passed: (count) => `Udane w tych samych skanach: ${count}`,
    detail: (level, count, share) => `${level}: ${count} nieudanych, ${share} wszystkich`,
    none: "W tym okresie wszystkie testy przeszły.",
  },

  tests: {
    heading: "Najczęściej nieudane testy",
    detail: (name, failures, runs, rate) => `${name}: nieudany ${failures} z ${runs} razy, ${rate}`,
    none: "W tym okresie wszystkie testy przeszły.",
  },

  domains: {
    heading: "Domeny",
    columns: { domain: "Domena", scans: "Skany", last: "Ostatni skan", risk: "Ryzyko", change: "Zmiana", trend: "Trend" },
    filter: (url) => `Pokaż tylko ${url}`,
    up: (points) => `wzrost o ${points}`,
    down: (points) => `spadek o ${points}`,
    same: "bez zmian",
  },

  scans: {
    heading: "Skany",
    columns: { date: "Data", checks: "Testy", failed: "Nieudane", risk: "Ryzyko" },
    open: "Otwórz skan",
  },

  widget: {
    period: "Ostatnie 30 dni",
    more: "Wykresy",
    moreContext: "z innymi okresami i domenami",
  },
};

export default charts;
