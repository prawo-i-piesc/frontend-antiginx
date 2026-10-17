import type { Messages } from "@/app/i18n/messages/en";

const pricing: Messages["pricing"] = {
  title: {
    lead: "Prosty,",
    highlight: "przejrzysty",
    tail: "cennik",
  },
  intro: "Wybierz plan dopasowany do potrzeb. Zawsze wiesz, ile zapłacisz.",

  plansHeading: "Plany",
  mostPopular: "Najpopularniejszy",
  perMonth: "/miesiąc",

  plans: {
    free: {
      name: "Free",
      description: "Idealny do użytku osobistego i testów",
      features: [
        "10 skanów dziennie",
        "Podstawowe wykrywanie zagrożeń",
        "Pomoc przez e-mail",
        "Dostęp do społeczności",
        "Podstawowe raporty",
      ],
      cta: "Zacznij teraz",
    },
    pro: {
      name: "Pro",
      description: "Najlepszy dla profesjonalistów i małych zespołów",
      features: [
        "Nielimitowane skany",
        "Zaawansowane wykrywanie zagrożeń",
        "Priorytetowa pomoc 24/7",
        "Dostęp do API",
        "Szczegółowe statystyki",
        "Własne alerty",
        "Eksport raportów (PDF/CSV)",
      ],
      cta: "Rozpocznij okres próbny",
    },
    enterprise: {
      name: "Enterprise",
      description: "Dla dużych organizacji o nietypowych potrzebach",
      features: [
        "Wszystko, co w planie Pro",
        "Dedykowany opiekun klienta",
        "Integracje na zamówienie",
        "Gwarancja SLA",
        "Wdrożenie on-premise",
        "Zaawansowane funkcje bezpieczeństwa",
        "Szkolenia i wdrożenie na miarę",
      ],
      cta: "Skontaktuj się z nami",
      price: "Wycena",
      period: "indywidualna",
    },
  },

  faq: {
    title: {
      lead: "Najczęściej zadawane",
      highlight: "pytania",
    },
    items: [
      {
        question: "Czy mogę później zmienić plan?",
        answer:
          "Tak, w każdej chwili możesz przejść na wyższy lub niższy plan. Zmiana obowiązuje od następnego okresu rozliczeniowego.",
      },
      {
        question: "Jakie metody płatności akceptujecie?",
        answer: "Akceptujemy wszystkie popularne karty płatnicze (Visa, Mastercard, American Express) oraz PayPal.",
      },
      {
        question: "Co się stanie po zakończeniu okresu próbnego?",
        answer:
          "Po zakończeniu okresu próbnego automatycznie przejdziesz na plan Free, chyba że wykupisz plan płatny.",
      },
      {
        question: "Czy mogę zrezygnować w dowolnym momencie?",
        answer: "Oczywiście. Subskrypcję możesz anulować w każdej chwili, bez kar i dodatkowych opłat.",
      },
    ],
  },

  cta: {
    title: {
      lead: "Zacznij",
      highlight: "już dziś",
    },
    body: "Zabezpiecz strony w darmowym planie. Karta płatnicza nie jest wymagana.",
    trial: "Rozpocznij okres próbny",
    scanner: "Wypróbuj skaner",
  },
};

export default pricing;
