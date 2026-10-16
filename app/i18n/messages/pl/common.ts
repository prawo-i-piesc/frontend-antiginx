import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const common: Messages["common"] = {
  appName: "Antiginx",
  homeLink: "Antiginx – strona główna",
  skipToContent: "Przejdź do treści",

  close: "Zamknij",
  cancel: "Anuluj",
  save: "Zapisz",
  continue: "Dalej",
  back: "Wstecz",
  done: "Gotowe",
  edit: "Edytuj",
  change: "Zmień",
  remove: "Usuń",
  delete: "Usuń",
  retry: "Spróbuj ponownie",
  search: "Szukaj",
  actions: "Akcje",
  or: "lub",
  loading: "Ładowanie…",
  working: "Przetwarzanie…",
  comingSoon: "Wkrótce",
  opensInNewTab: "(otwiera się w nowej karcie)",

  networkError: "Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.",
  genericError: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
  retryInMinutes: (minutes) =>
    minutes === 1
      ? "Spróbuj ponownie za około minutę."
      : `Spróbuj ponownie za około ${minutes} ${pluralPl(minutes, "minutę", "minuty", "minut")}.`,

  language: {
    label: "Język interfejsu",
    changed: "Język interfejsu: polski",
  },

  toast: {
    region: "Powiadomienia",
    dismiss: "Zamknij powiadomienie",
  },

  pagination: {
    label: "Stronicowanie",
    previous: "Poprzednia",
    next: "Następna",
    previousPage: "Poprzednia strona",
    nextPage: "Następna strona",
    page: (page) => `Strona ${page}`,
    range: (from, to, total) => `Wyświetlono ${from}–${to} z ${total}`,
  },
};

export default common;
