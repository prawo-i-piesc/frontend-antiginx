import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const charts: Messages["charts"] = {
  title: "Wykresy",
  subtitle: "Analizuj wskaźniki bezpieczeństwa stron i historię skanów",
  loading: "Ładowanie danych wykresu…",
  loadError: "Nie udało się wczytać historii skanów.",
  empty: "Brak danych do wyświetlenia na wykresach.",
  domainFilter: "Filtr historii domeny",
  heading: "Poziom zagrożenia w czasie",
  threatLevel: "Poziom zagrożenia",
  noScansForDomain: "Brak skanów dla wybranej domeny.",
  chartTitle: (url) => `Poziom zagrożenia w czasie: ${url}`,
  keyboardHint: "Przechodź między skanami strzałkami w lewo i w prawo.",
  summary: (url, count, from, to) =>
    `${url}: ${count} ${pluralPl(count, "skan", "skany", "skanów")}, ${from === to ? from : `od ${from} do ${to}`}.`,
  levels: (latest, highest, lowest) =>
    `Ostatni poziom zagrożenia: ${latest}. Najwyższy: ${highest}. Najniższy: ${lowest}.`,
  tableCaption: (url) => `Poziom zagrożenia w kolejnych skanach: ${url}`,
  scanDate: "Data skanu",
};

export default charts;
