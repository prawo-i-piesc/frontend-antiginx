import type { Messages } from "@/app/i18n/messages/en";

const shell: Messages["shell"] = {
  dashboardNav: "Nawigacja pulpitu",
  adminNav: "Nawigacja panelu administratora",

  sections: {
    menu: "Menu",
    other: "Inne",
    management: "Zarządzanie",
  },

  links: {
    overview: "Przegląd",
    scanner: "Skaner",
    charts: "Wykresy",
    profile: "Profil",
    users: "Użytkownicy",
    scans: "Skany",
    userDashboard: "Pulpit użytkownika",
    adminPanel: "Panel administratora",
  },

  plans: { free: "Free", pro: "Pro" },
  administrator: "Administrator",
  defaultUserName: "Użytkownik",
  defaultAdminName: "Administrator",
  logout: "Wyloguj się",

  areaSwitch: "Przełącz obszar",
  areas: { dashboard: "Pulpit", admin: "Panel admina" },
  collapseSidebar: "Zwiń menu",
  expandSidebar: "Rozwiń menu",
  menu: "Menu",
  closeMenu: "Zamknij menu",
  lightTheme: "Włącz jasny motyw",
  darkTheme: "Włącz ciemny motyw",
  notifications: "Powiadomienia – wkrótce",
};

export default shell;
