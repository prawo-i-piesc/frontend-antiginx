import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const scan: Messages["scan"] = {
  severity: {
    CRITICAL: "Krytyczna",
    HIGH: "Wysoka",
    MEDIUM: "Średnia",
    LOW: "Niska",
    INFO: "Informacyjna",
  },

  status: {
    PENDING: "Oczekuje",
    RUNNING: "W toku",
    COMPLETED: "Zakończony",
    FAILED: "Nieudany",
  },

  result: {
    passed: "Zaliczony",
    failed: "Niezaliczony",
  },

  tests: {
    https: "Weryfikacja protokołu HTTPS",
    hsts: "Analiza nagłówka HSTS",
    "ssl-cert": "Analiza bezpieczeństwa certyfikatu SSL",
    csp: "Analiza Content Security Policy",
    xframe: "Analiza ochrony przed osadzaniem w ramkach (X-Frame-Options i CSP)",
    "permissions-policy": "Analiza nagłówka Permissions-Policy",
    "x-content-type-options": "Analiza nagłówka X-Content-Type-Options",
    "referrer-policy": "Analiza nagłówka Referrer-Policy",
    "cross-origin-x": "Analiza nagłówków bezpieczeństwa Cross-Origin",
    "cookie-sec": "Analiza bezpieczeństwa plików cookie",
    "serv-h-a": "Analiza ujawniania technologii serwera",
    sitemap: "Analiza bezpieczeństwa mapy witryny",
    "js-obf": "Wykrywanie zaciemniania kodu JavaScript",
    "phishing-url": "Analiza adresu pod kątem phishingu",
    "dns-reputation": "Analiza DNS i rejestracji domeny",
    "favicon-origin": "Analiza pochodzenia favikony",
    "bot-protection": "Ocena blokady ochrony przed botami",
  },

  testsShort: {
    https: "HTTPS",
    hsts: "HSTS",
    "ssl-cert": "Certyfikat SSL",
    csp: "Content Security Policy",
    xframe: "X-Frame-Options",
    "permissions-policy": "Permissions Policy",
    "x-content-type-options": "X-Content-Type-Options",
    "referrer-policy": "Referrer Policy",
    "cross-origin-x": "Nagłówki Cross-Origin",
    "cookie-sec": "Bezpieczeństwo cookie",
    "serv-h-a": "Nagłówek Server",
    sitemap: "Mapa witryny",
    "js-obf": "Zaciemnianie JavaScriptu",
    "phishing-url": "Phishingowy adres URL",
    "dns-reputation": "Reputacja DNS",
    "favicon-origin": "Pochodzenie favikony",
    "bot-protection": "Ochrona przed botami",
  },

  categories: {
    "SSL/TLS & Encryption": "SSL/TLS i szyfrowanie",
    "Security Headers": "Nagłówki bezpieczeństwa",
    "Privacy & Session Management": "Prywatność i zarządzanie sesją",
    "Reconnaissance & Server Information": "Rozpoznanie i informacje o serwerze",
    "Vulnerabilities & Code Analysis": "Podatności i analiza kodu",
  },
  categoryOther: "Inne",

  resultsTitle: "Wyniki skanu bezpieczeństwa",
  target: "Cel",
  riskScore: "Poziom ryzyka",
  inProgressTitle: "Skanowanie w toku",
  inProgressBody: "Analizujemy bezpieczeństwo strony…",
  testsCompleted: (count) => `Ukończono ${count} ${pluralPl(count, "test", "testy", "testów")}`,
  export: "Eksportuj",
  exportReport: "Eksportuj raport",
  downloadReport: "Pobierz raport",
  engineLanguageNote: "Szczegóły testów pochodzą z silnika skanującego i są w języku angielskim.",

  errorTitle: "Skanowanie nie powiodło się",
  errors: {
    timeoutFree:
      "Skanowanie trwa dłużej niż zwykle. Spróbuj ponownie za chwilę albo sprawdź, czy adres jest osiągalny.",
    timeoutPremium: "Skanowanie nie zakończyło się w oczekiwanym czasie. Spróbuj ponownie za chwilę.",
    network: "Nie można połączyć się ze skanerem. Sprawdź połączenie i spróbuj ponownie.",
    invalidRequest: "Nieprawidłowe żądanie skanowania. Sprawdź adres i spróbuj ponownie.",
    unauthorized: "Nie masz uprawnień do uruchomienia tego skanu. Zaloguj się ponownie.",
    notFound: "Nie znaleziono skanu. Zadanie mogło wygasnąć lub zostać usunięte.",
    rateLimited: "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie.",
    server: "Skaner jest chwilowo niedostępny. Spróbuj ponownie za chwilę.",
    unexpected: "Podczas skanowania tego adresu wystąpił nieoczekiwany błąd.",
    detailsUnavailable: "Szczegóły skanu nie są jeszcze dostępne.",
  },

  report: {
    title: "Pobierz raport",
    target: "Raport dla",
    formatLabel: "Format",
    formats: {
      pdf: { name: "PDF", description: "Gotowy do druku i udostępnienia." },
      html: { name: "HTML", description: "Jedna strona, otworzysz ją w każdej przeglądarce, także offline." },
      md: { name: "Markdown", description: "Do zgłoszeń, wiki i repozytoriów." },
      sarif: { name: "SARIF", description: "Dla narzędzi bezpieczeństwa, np. GitHub code scanning." },
    },
    preview: "Podgląd",
    previewLoading: "Generujemy podgląd…",
    previewError: "Nie udało się wygenerować podglądu.",
    previewFrame: (url) => `Podgląd raportu: ${url}`,
    previewNote: "Każdy format zawiera to samo co ten podgląd.",
    download: "Pobierz",
    downloadAs: (format) => `Pobierz ${format}`,
    generating: "Generujemy raport…",
    downloaded: "Raport pobrany",
    downloadFailed: "Nie udało się wygenerować raportu.",
    errors: {
      notFinished: "Skan jeszcze się nie zakończył. Poczekaj, aż się skończy.",
      notFound: "Nie znaleziono skanu. Mógł zostać usunięty.",
      network: "Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.",
      rateLimited: "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie.",
      server: "Generowanie raportów jest chwilowo niedostępne. Spróbuj ponownie za chwilę.",
      unexpected: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",
    },
    severity: "Ważność",
  },
};

export default scan;
