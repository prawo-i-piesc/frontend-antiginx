import type { Messages } from "@/app/i18n/messages/en";

const pricing: Messages["pricing"] = {
  title: "Cennik",
  intro:
    "Do skanu strony nie potrzebujesz konta. Darmowe konto trzyma Twoje skany w jednym miejscu, a Pro daje dostęp do wszystkich testów, w tym premium, i skanuje Twoje domeny według harmonogramu.",

  plansHeading: "Plany",
  perMonth: "/miesiąc",
  plus: (plan) => `Wszystko z ${plan}, a do tego:`,

  plans: {
    free: {
      name: "Free",
      price: "$0",
      description: "Twoje skany w jednym miejscu.",
      features: [
        "Podstawowy zestaw testów",
        "Wybór testów do skanu",
        "Historia skanów i pulpit",
        "Wykresy poziomu zagrożenia w czasie",
        "Raport do pobrania",
      ],
      cta: "Załóż darmowe konto",
    },
    pro: {
      name: "Pro",
      price: "$10",
      description: "Dla stron, które warto sprawdzać regularnie.",
      features: ["Dostęp do wszystkich testów, w tym premium", "Skany według harmonogramu", "Wyższe limity skanów"],
      cta: "Wybierz Pro",
    },
    enterprise: {
      name: "Enterprise",
      price: "Indywidualnie",
      description: "Dla organizacji, którym zależy na prywatności.",
      features: [
        "Prywatna instancja tylko dla Twojej organizacji",
        "Kontrola nad czasem przechowywania wyników",
        "Limity dopasowane do organizacji",
      ],
      cta: "Napisz do nas",
      subject: "Antiginx Enterprise",
    },
  },

  art: {
    schedule: "Harmonogram",
    days: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
    premium: "Testy premium",
    unlocked: "odblokowane",
    instance: "Prywatna instancja",
    org: "twoja-firma",
    retention: "przechowywanie wyników",
    retentionValue: "30 dni",
    limits: "limity skanów",
    limitsValue: "dopasowane",
  },

  faq: {
    title: "Pytania",
    docs: "Dokumentacja",
    items: [
      {
        question: "Czy do skanu potrzebuję konta?",
        answer:
          "Nie. Skaner na stronie głównej działa bez rejestracji: wpisujesz adres, wynik otwiera się od razu i możesz go pobrać jako raport. Konto przydaje się, gdy chcesz wracać do wyników.",
      },
      {
        question: "Czym Pro różni się od darmowego konta?",
        answer:
          "Pro daje dostęp do wszystkich testów, w tym premium, skanuje wybrane domeny według harmonogramu i ma wyższe limity skanów.",
      },
      {
        question: "Czy mogę skanować dowolną stronę?",
        answer: "Skanuj tylko strony, do których masz prawo: swoje albo te, na których skanowanie masz zgodę.",
      },
      {
        question: "Co dzieje się z wynikami moich skanów?",
        answer:
          "Skany z konta trafiają do historii w Twoim pulpicie. W planie Enterprise działają na prywatnej instancji tylko dla Twojej organizacji, a czas przechowywania wyników ustalamy indywidualnie.",
      },
    ],
  },

  cta: {
    note: "Skaner na stronie głównej działa bez konta.",
    scanner: "Wypróbuj skaner",
  },
};

export default pricing;
