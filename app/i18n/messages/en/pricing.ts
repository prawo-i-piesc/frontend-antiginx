/**
 * The public pricing page. Amounts stay in dollars in every language.
 *
 * Plans describe what each tier includes as the product is planned: the free
 * account has today's features, Pro adds the scheduled scans, higher limits
 * and every test, Enterprise a private instance. Payment happens on Stripe's
 * Checkout page, so nothing here promises payment methods, trials or billing
 * terms.
 */
const pricing = {
  title: "Pricing",
  intro:
    "Scanning a site needs no account. A free account keeps your scans in one place; Pro gives you every test, premium ones included, and scans your domains on a schedule.",

  plansHeading: "Plans",
  /** On the Pro card, for someone who already pays. */
  yourPlan: "Your plan",
  /** In place of the upgrade button on a server that takes no payments. */
  unavailable: "Payments are not available yet",
  perMonth: "/month",
  /** Shown over the extra features of the higher plans. */
  plus: (plan: string) => `Everything in ${plan}, plus:`,

  plans: {
    free: {
      name: "Free",
      price: "$0",
      description: "Your scans in one place.",
      features: [
        "Core set of tests",
        "Choosing which tests to run",
        "Scan history and dashboard",
        "Threat level charts over time",
        "Downloadable report",
      ],
      cta: "Create a free account",
    },
    pro: {
      name: "Pro",
      price: "$10",
      description: "For sites worth checking regularly.",
      features: ["Access to every test, premium ones included", "Scans on a schedule", "Higher scan limits"],
      cta: "Choose Pro",
    },
    enterprise: {
      name: "Enterprise",
      /** Shown in place of an amount. */
      price: "Custom",
      description: "For organisations that care about privacy.",
      features: [
        "A private instance just for your organisation",
        "Control over how long results are kept",
        "Limits tailored to your organisation",
      ],
      cta: "Get in touch",
      /** Subject of the e-mail the button starts. */
      subject: "Antiginx Enterprise",
    },
  },

  /** The small piece of the app above each plan, showing what it adds. */
  art: {
    schedule: "Schedule",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    premium: "Premium tests",
    unlocked: "unlocked",
    instance: "Private instance",
    org: "your-company",
    retention: "keep results",
    retentionValue: "30 days",
    limits: "scan limits",
    limitsValue: "tailored",
  },

  faq: {
    title: "Questions",
    docs: "Documentation",
    items: [
      {
        question: "Do I need an account to scan a site?",
        answer:
          "No. The scanner on the home page works without signing up: enter an address, the result opens right away, and you can download it as a report. An account helps when you want to come back to your results.",
      },
      {
        question: "How is Pro different from the free account?",
        answer:
          "Pro gives you access to every test, premium ones included, scans the domains you pick on a schedule, and comes with higher scan limits.",
      },
      {
        question: "Can I scan any site?",
        answer: "Only scan sites you have the right to: your own, or ones you have permission to scan.",
      },
      {
        question: "What happens to my scan results?",
        answer:
          "Scans from your account go to the history in your dashboard. On the Enterprise plan they run on a private instance just for your organisation, and how long results are kept is agreed one to one.",
      },
    ],
  },

  cta: {
    note: "The scanner on the home page works without an account.",
    scanner: "Try the scanner",
  },
};

export default pricing;
