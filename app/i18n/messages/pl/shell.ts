import type { Messages } from "@/app/i18n/messages/en";

const shell: Messages["shell"] = {
  dashboardBadge: "Pulpit",
  adminBadge: "Admin",
  dashboardNav: "Nawigacja pulpitu",
  adminNav: "Nawigacja panelu administratora",

  sections: {
    menu: "Menu",
    other: "Inne",
    management: "Zarządzanie",
    system: "System",
  },

  links: {
    overview: "Przegląd",
    scanner: "Skaner",
    charts: "Wykresy",
    profile: "Profil",
    database: "Baza danych",
    userDashboard: "Pulpit użytkownika",
  },

  plans: { free: "Free", pro: "Pro" },
  administrator: "Administrator",
  defaultUserName: "Użytkownik",
  defaultAdminName: "Administrator",
  logout: "Wyloguj się",

  menu: "Menu",
  closeMenu: "Zamknij menu",
  darkMode: "Tryb ciemny",
  searchPlaceholder: "Szukaj skanów, zagrożeń lub raportów…",
  adminSearchPlaceholder: "Szukaj użytkowników, skanów, raportów…",
  searchUnavailable: "Wyszukiwanie nie jest jeszcze dostępne",
  notifications: "Powiadomienia – wkrótce",
};

export default shell;
