import type { Messages } from "@/app/i18n/messages/en";

const landing: Messages["landing"] = {
  header: {
    nav: "Menu główne",
    features: "Funkcje",
    docs: "Dokumentacja",
    pricing: "Cennik",
    signIn: "Zaloguj się",
    dashboard: "Pulpit",
  },

  hero: {
    title: {
      lead: "Sprawdź",
      highlight: "bezpieczeństwo strony,",
      tail: "zanim ją odwiedzisz",
    },
    subtitle:
      "Najbardziej zaawansowany skaner bezpieczeństwa stron internetowych, oparty na sztucznej inteligencji i kompleksowych algorytmach analizy zagrożeń.",
    tryIt: "Wypróbuj za darmo!",
    learnMore: "Dowiedz się więcej",
    stats: {
      accuracy: { value: "99,8%", label: "Skuteczność" },
      scans: { value: "30,0+", label: "Skany" },
      threats: { value: "150+", label: "Zablokowane zagrożenia" },
      speed: { value: "<2 s", label: "Czas skanu" },
    },
  },

  scanner: {
    title: "Wypróbuj!",
    intro: {
      before: "Sprawdź ",
      emphasis: "za darmo",
      after: ", czy strona jest bezpieczna, zanim na nią wejdziesz.",
    },
    inputLabel: "Adres strony do przeskanowania",
    run: "URUCHOM",
    runContext: "skanowanie",
    scanning: "SKANOWANIE…",
    started: (url) => `Trwa skanowanie ${url}…`,
    disclaimer: "Uruchamiając skanowanie, potwierdzasz, że masz prawo analizować tę domenę.",
  },

  security: {
    title: {
      lead: "Praktyczne bezpieczeństwo,",
      highlight: "na którym możesz polegać",
    },
    body: "Stawiamy na rozsądne, sprawdzone praktyki – szyfrowane połączenia, ostrożne obchodzenie się z danymi i regularne kontrole, dzięki którym wszystko jest aktualne.",
    points: {
      encryption: {
        title: "Szyfrowane połączenia",
        body: "Cały ruch jest szyfrowany podczas przesyłania (HTTPS/TLS).",
      },
      updates: {
        title: "Regularne aktualizacje",
        body: "Rutynowo sprawdzamy zabezpieczenia i szybko instalujemy aktualizacje.",
      },
      retention: {
        title: "Minimum przechowywanych danych",
        body: "Przechowujemy tylko to, co niezbędne, i nie gromadzimy zbędnych danych użytkowników.",
      },
    },
    highlights: {
      tls: { value: "TLS", label: "Szyfrowane połączenia" },
      reliability: { value: "99%+", label: "Niezawodność od podstaw" },
      monitoring: { value: "24/7", label: "Monitorowanie" },
      reviews: { value: "Kontrole", label: "Regularne przeglądy bezpieczeństwa" },
    },
  },

  features: {
    title: {
      lead: "Kompleksowa",
      tail: "ochrona przed zagrożeniami",
    },
    body: "Korzystamy z najnowszych technologii AI i uczenia maszynowego, aby wykrywać złośliwe oprogramowanie, phishing, podejrzane treści i inne zagrożenia.",
    cards: {
      detection: {
        title: "Wykrywanie wielu zagrożeń",
        body: "Kompleksowe skanowanie w czasie rzeczywistym pod kątem złośliwego oprogramowania, phishingu, podejrzanych skryptów i innych zagrożeń.",
        points: [
          "Wykrywanie złośliwego oprogramowania i wirusów",
          "Rozpoznawanie stron phishingowych",
          "Analiza podejrzanych skryptów",
        ],
      },
      intelligence: {
        title: "Globalna wiedza o zagrożeniach",
        body: "Stale aktualizowana baza tysięcy znanych złośliwych stron, zainfekowanych domen i zagrożeń z całego świata.",
        points: [
          "Bieżące źródła informacji o zagrożeniach",
          "Współpraca z dostawcami zabezpieczeń",
          "Wymiana wiedzy o zagrożeniach w społeczności",
        ],
      },
      ai: {
        title: "AI i uczenie maszynowe",
        body: "Sztuczna inteligencja wytrenowana na milionach próbek wykrywa nowe, wcześniej nieznane zagrożenia i wzorce ataków.",
        points: ["Zaawansowane wykrywanie zagrożeń", "Analiza behawioralna", "Wykrywanie zagrożeń typu zero-day"],
      },
    },
  },

  cta: {
    title: "Chcesz pełnej ochrony?",
    body: "Dołącz do tysięcy firm, które już chronią się przed zagrożeniami dzięki Antiginx.",
    start: "Zacznij za darmo",
    expert: "Porozmawiaj z ekspertem",
  },

  footer: {
    tagline: "Zaawansowany skaner bezpieczeństwa stron oparty na AI, który chroni użytkowników przed zagrożeniami w sieci.",
    columns: {
      product: "Produkt",
      company: "Firma",
      support: "Wsparcie",
      legal: "Informacje prawne",
    },
    links: {
      features: "Funkcje",
      api: "API",
      docs: "Dokumentacja",
      pricing: "Cennik",
      about: "O nas",
      blog: "Blog",
      careers: "Kariera",
      help: "Pomoc",
      contact: "Kontakt",
      status: "Status usług",
      privacy: "Prywatność",
      terms: "Regulamin",
      cookies: "Pliki cookie",
    },
    social: (network) => `Antiginx w serwisie ${network}`,
    copyright: (year) => `© ${year} Antiginx. Wszelkie prawa zastrzeżone.`,
  },

  threatMeter: {
    label: (level, verdict) => `Poziom zagrożenia: ${level}%. ${verdict}`,
    verdicts: {
      safe: "Bezpieczne",
      caution: "Ostrożnie",
      danger: "Niebezpieczne",
    },
    legend: {
      low: "0–29% Bezpieczne",
      medium: "30–69% Średnie",
      high: "70–100% Wysokie",
    },
  },
};

export default landing;
