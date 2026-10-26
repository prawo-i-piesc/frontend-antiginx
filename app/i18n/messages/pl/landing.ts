import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

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
      lead: "Zobacz to, czego strona",
      highlight: "Ci nie pokazuje.",
    },
    subtitle:
      "Nagłówki, certyfikat, ciasteczka, DNS i ślady phishingu: wszystko, co przeglądarka chowa przed Tobą, sprawdzone w jednym skanie.",
    tryIt: "Wypróbuj za darmo",
    learnMore: "Jak to działa",
    xray: {
      label:
        "Ilustracja: skaner przechodzi po przykładowym sklepie internetowym i przypina do strony znalezione problemy: ujawnione wersje oprogramowania, brakujące nagłówki bezpieczeństwa, flagi ciasteczek, certyfikat i domenę.",
      pause: "Zatrzymaj prześwietlanie",
      resume: "Wznów prześwietlanie",
      validFor: (days) => `ważny jeszcze ${days} dni`,
      registered: "rejestracja",
      registeredAgo: (days) => `rejestracja ${days} ${pluralPl(days, "dzień", "dni", "dni")} temu`,
      findings: {
        server: "Ujawniona wersja nginx",
        hsts: "Brak nagłówka HSTS",
        tls: "TLS 1.3, ważny certyfikat",
        domain: "Domena z 2009 roku",
        cdn: "Strona za Cloudflare",
        csp: "Brak Content Security Policy",
        cookieHttpOnly: "Ciasteczko bez HttpOnly",
        apache: "Ujawniona wersja Apache",
        framing: "Brak ochrony przed ramkami",
        oldTls: "Przestarzały TLS 1.0",
        sameSite: "Ciasteczko bez SameSite",
        certExpiry: "Certyfikat wygasa za 9 dni",
        youngDomain: "Domena sprzed kilku dni",
        contentType: "Brak X-Content-Type-Options",
        obfuscatedJs: "Zaciemniony JavaScript",
        sitemapAdmin: "Panel admina w sitemap.xml",
      },
    },
  },

  scanner: {
    title: "Wypróbuj za darmo",
    intro: {
      before: "Wpisz adres i zobacz, jak wypada strona, ",
      emphasis: "bez zakładania konta",
      after: ".",
      result: "Wynik otworzy się tutaj.",
    },
    inputLabel: "Adres strony do przeskanowania",
    run: "URUCHOM",
    runContext: "skanowanie",
    scanning: "SKANOWANIE…",
    started: (url) => `Trwa skanowanie ${url}…`,
    disclaimer: "Uruchamiając skanowanie, potwierdzasz, że masz prawo analizować tę domenę.",
  },

  checks: {
    title: "Co sprawdza skan",
    body: "Od certyfikatu TLS po wiek domeny: co sprawdzają testy, obszar po obszarze.",
    more: "i więcej",
    growing: "Lista stale rośnie: nowe testy dochodzą regularnie.",
    fullList: "Pełna lista w dokumentacji",
    art: {
      lookalike: "rn udaje m",
      registeredAgo: (days) => `zarejestrowana ${days} dni temu`,
      cve: "znane podatności",
      exposed: "wypisane w sitemap.xml",
    },
    groups: {
      encryption: {
        title: "Szyfrowanie",
        body: "Czy połączenie idzie przez TLS, czy strona zabrania przeglądarkom wracać do zwykłego HTTP i jak mocny jest jej certyfikat.",
      },
      headers: {
        title: "Nagłówki bezpieczeństwa",
        body: "Polityki, które blokują wstrzyknięte skrypty, osadzanie strony w cudzych ramkach, dostęp do kamery czy mikrofonu i wyciek adresu strony do innych serwisów.",
      },
      cookies: {
        title: "Ciasteczka i sesja",
        body: "Czy każde ciasteczko ma flagi HttpOnly, Secure i SameSite, które chronią sesję przed skryptami i podsłuchem.",
      },
      exposure: {
        title: "Ujawnione informacje",
        body: "Wersje oprogramowania zdradzane w nagłówkach, sprawdzane w bazie podatności NIST, ścieżki, które mapa witryny podsuwa wyszukiwarkom, i CDN albo WAF stojący przed stroną.",
      },
      phishing: {
        title: "Oznaki phishingu",
        body: "Domeny podszywające się pod znane marki, wiek i dane rejestracji domeny, favikona pożyczona z innej strony i celowo zaciemniony JavaScript.",
      },
    },
  },

  how: {
    title: "Jak działa skan",
    body: "Silnik dzieli skan na trzy tory i uruchamia je równolegle, więc nawet gdy strona zablokuje skaner, testy adresu i domeny i tak dają wynik.",
    lanes: {
      address: { tag: "adres", note: "wystarczy im sam adres i DNS" },
      response: { tag: "strona", note: "czytają odpowiedź strony" },
      own: { tag: "połączenie", note: "otwierają własne: certyfikat, mapa witryny" },
    },
    terminal: {
      title: "antiginx · skan",
      label:
        "Przykładowy skan shop.example: testy adresu, DNS i certyfikatu przechodzą; strona nie wysyła nagłówka HSTS, zdradza wersję nginx i ustawia ciasteczko bez SameSite. Poziom zagrożenia 38%, ostrożnie.",
      queued: "zadanie w kolejce silnika",
      fetch: "GET / → 200",
      cookie: "brak SameSite",
      more: "…i kolejne testy",
      done: "gotowe",
      threat: "poziom zagrożenia",
      replay: "Odtwórz ponownie",
    },
    steps: {
      submit: {
        title: "Wpisujesz adres",
        body: "Tutaj, żeby szybko sprawdzić stronę, albo w pulpicie, gdzie wybierasz, które testy uruchomić.",
      },
      run: {
        title: "Silnik uruchamia testy",
        body: "Trzema torami naraz. Tor strony czeka na jej odpowiedź, pozostałe dwa ruszają od razu:",
      },
      result: {
        title: "Dostajesz wynik",
        body: "Każdy test zwraca werdykt, poziom zagrożenia i szczegóły, z których powstaje ogólny poziom zagrożenia. Całość pobierzesz jako raport.",
      },
    },
  },

  account: {
    title: "Więcej po zalogowaniu",
    body: "Skaner powyżej to szybki test. W pulpicie dostajesz:",
    items: {
      pick: "Wybór testów do każdego skanu",
      schedule: "Skany uruchamiane według harmonogramu",
      history: "Historię skanów i podsumowanie w pulpicie",
      charts: "Wykresy poziomu zagrożenia domen w czasie",
      security: "Konto chronione 2FA i kluczami dostępu",
    },
    more: "I wiele więcej",
    moreContext: "zobacz cennik",
    register: "Załóż konto",
    dashboard: "Przejdź do pulpitu",
    pricing: "Zobacz cennik",
    mock: {
      dashboard: "Pulpit",
      chart: "Poziom zagrożenia · shop.example",
      recent: "Ostatnie skany",
      today: "dziś",
      yesterday: "wczoraj",
      daysAgo: (days) => `${days} dni temu`,
      schedule: "Harmonogram",
      weekly: "Co tydzień · pon. 06:00",
    },
  },

  footer: {
    tagline: "Skaner bezpieczeństwa stron internetowych.",
    nav: "Stopka",
    legalNav: "Informacje prawne",
    links: {
      pricing: "Cennik",
      docs: "Dokumentacja",
      github: "GitHub",
    },
    license: "Licencja MIT",
    copyright: (year) => `© ${year} Antiginx`,
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
