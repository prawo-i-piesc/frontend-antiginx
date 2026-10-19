import type { Messages } from "@/app/i18n/messages/en";

const meta: Messages["meta"] = {
  defaultTitle: "Antiginx – skaner bezpieczeństwa stron",
  titleTemplate: "%s · Antiginx",
  description:
    "Skaner bezpieczeństwa stron internetowych: szyfrowanie, nagłówki bezpieczeństwa, ciasteczka, ujawnione wersje oprogramowania i oznaki phishingu.",

  titles: {
    pricing: "Cennik",
    login: "Logowanie",
    mfa: "Weryfikacja dwuetapowa",
    linkAccount: "Połącz konto",
    register: "Rejestracja",
    forgotPassword: "Resetowanie hasła",
    resetPassword: "Ustaw nowe hasło",
    verifyEmail: "Potwierdzenie adresu e-mail",
    confirmEmail: "Potwierdź adres e-mail",
    welcome: "Witamy",
    dashboard: "Przegląd",
    scanner: "Skaner",
    charts: "Wykresy",
    profile: "Ustawienia profilu",
    admin: "Panel administratora",
    adminDatabase: "Baza danych",
  },
};

export default meta;
