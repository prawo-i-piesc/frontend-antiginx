import { pluralPl } from "@/app/i18n/plural";
import type { Messages } from "@/app/i18n/messages/en";

const weekdaysOn = ["w niedzielę", "w poniedziałek", "we wtorek", "w środę", "w czwartek", "w piątek", "w sobotę"];

const schedules: Messages["schedules"] = {
  title: "Harmonogramy",
  subtitle: "Skany, które ruszają same: codziennie, co tydzień albo co miesiąc",
  newSchedule: "Nowy harmonogram",

  weekdaysShort: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
  weekdaysLong: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"],

  cadence: {
    daily: (time) => `Codziennie o ${time}`,
    weekly: (weekday, time) => `Co tydzień ${weekdaysOn[weekday]} o ${time}`,
    monthly: (day, time) => `Co miesiąc, ${day}. dnia o ${time}`,
    zone: (zone) => `czas ${zone}`,
  },

  paywall: {
    title: "Harmonogramy są w planie Pro",
    body: "Wybierasz stronę, testy i godzinę, a skan rusza sam: codziennie, co tydzień albo co miesiąc. Wyniki trafiają do skanów i wykresów jak każdy inny skan.",
    action: "Zobacz plany",
    lapsed: "Bez planu Pro te harmonogramy nie działają. Nadal możesz je wstrzymać albo usunąć.",
  },

  form: {
    titleNew: "Nowy harmonogram",
    titleEdit: "Edycja harmonogramu",
    urlLabel: "Adres strony",
    urlPlaceholder: "example.com",
    urlRequired: "Wpisz adres strony do skanowania.",
    frequency: "Powtarzaj",
    frequencies: { daily: "Codziennie", weekly: "Co tydzień", monthly: "Co miesiąc" },
    time: "Godzina",
    weekday: "Dzień tygodnia",
    monthDay: "Dzień miesiąca",
    monthDayHint: "Najpóźniej 28., żeby wypadał w każdym miesiącu.",
    zone: (zone) => `Godziny są w Twojej strefie czasowej, ${zone}.`,
    scope: "Zakres testów",
    save: "Zapisz harmonogram",
    saving: "Zapisywanie…",
    cancel: "Anuluj",
  },

  calendar: {
    legend: { done: "Wykonany", failed: "Nieudany", planned: "Zaplanowany" },
    dayEmpty: "Tego dnia nic się nie dzieje.",
    label: "Kalendarz zaplanowanych skanów",
    previous: "Poprzedni miesiąc",
    next: "Następny miesiąc",
    today: "Dziś",
    loadError: "Nie udało się wczytać kalendarza.",
    more: (count) => `+${count} więcej`,
    planned: (url, time) => `${url}, zaplanowany na ${time}`,
    run: (url, time, status) => `${url} o ${time}, ${status}`,
    nothing: "W tym miesiącu nic nie jest zaplanowane.",
    dayEntries: (count) => `${count} ${pluralPl(count, "wpis", "wpisy", "wpisów")}`,
  },

  table: {
    caption: "Twoje harmonogramy",
    count: (count, limit) => `${count} z ${limit}`,
    countLabel: (count, limit) => `${count} z ${limit} harmonogramów, na które pozwala plan`,
    loadError: "Nie udało się wczytać harmonogramów.",
    empty: "Nie masz jeszcze harmonogramów. Dodaj pierwszy, żeby regularnie skanować stronę.",
    columns: {
      target: "Cel",
      cadence: "Powtarzanie",
      next: "Następny skan",
      last: "Ostatni skan",
      state: "Stan",
    },
    states: { active: "Aktywny", paused: "Wstrzymany", blocked: "Zablokowany" },
    blockedNote: "Zablokowany przez administratora",
    blockReason: (reason) => `Powód: ${reason}`,
    notYet: "Jeszcze nie",
    skipped: {
      PRO_REQUIRED: "Pominięty, wymaga Pro",
      QUEUE_UNAVAILABLE: "Pominięty, kolejka nie działała",
      INVALID_TARGET: "Pominięty, niedozwolony adres",
    },
    runs: (count) => `${count} ${pluralPl(count, "skan", "skany", "skanów")}`,
    history: (url) => `Skany z harmonogramu dla ${url}`,
    pause: (url) => `Wstrzymaj harmonogram dla ${url}`,
    resume: (url) => `Wznów harmonogram dla ${url}`,
    edit: (url) => `Edytuj harmonogram dla ${url}`,
    delete: (url) => `Usuń harmonogram dla ${url}`,
    lastScan: (url) => `Ostatni skan ${url}`,
  },

  deleteDialog: {
    title: "Usunąć harmonogram?",
    description: (url) => `${url} przestanie być skanowany według harmonogramu. Skany, które już się odbyły, zostają w skanach.`,
    confirm: "Usuń harmonogram",
  },

  toasts: {
    created: "Harmonogram zapisany",
    saved: "Zmiany zapisane",
    paused: "Harmonogram wstrzymany",
    resumed: "Harmonogram wznowiony",
    deleted: "Harmonogram usunięty",
  },

  fromSchedule: "Z harmonogramu",
  onlySchedule: "Skany jednego harmonogramu",
  clearSchedule: "Pokaż wszystkie skany",

  admin: {
    title: "Harmonogramy",
    description: "Zaplanowane skany wszystkich kont, od najnowszych.",
    caption: "Harmonogramy wszystkich kont, od najnowszych.",
    search: "Szukaj po adresie lub e-mailu",
    stateFilter: "Stan",
    allStates: "Wszystkie stany",
    empty: "Żadne konto nie ma jeszcze harmonogramu.",
    noMatches: "Żaden harmonogram nie pasuje do tych filtrów.",
    clearFilters: "Wyczyść filtry",
    columns: { owner: "Właściciel" },
    ownerGone: "usunięte konto",
    block: (url) => `Zablokuj harmonogram dla ${url}`,
    unblock: (url) => `Zdejmij blokadę harmonogramu dla ${url}`,
    blockTitle: "Zablokować harmonogram?",
    blockDescription: (url, owner) =>
      `${url} przestanie być skanowany dla ${owner}. Właściciel zobaczy powód i nie wznowi harmonogramu, dopóki nie zdejmiesz blokady.`,
    blockReason: "Powód dla właściciela (opcjonalnie)",
    blockConfirm: "Zablokuj harmonogram",
    unblockTitle: "Zdjąć blokadę?",
    unblockDescription: (url) =>
      `Właściciel znów może uruchamiać harmonogram dla ${url}. Jeśli zostawił go włączonego, ruszy od najbliższego terminu.`,
    unblockConfirm: "Zdejmij blokadę",
    blocked: "Harmonogram zablokowany",
    unblocked: "Blokada zdjęta",
  },
};

export default schedules;
