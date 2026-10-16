/** The public pricing page. Amounts stay in dollars in every language. */
const pricing = {
  /** One sentence in three styled parts. */
  title: {
    lead: "Simple,",
    highlight: "transparent",
    tail: "pricing",
  },
  intro: "Choose the perfect plan for your needs. Always know what you’ll pay.",

  plansHeading: "Plans",
  mostPopular: "Most popular",
  perMonth: "/month",

  plans: {
    free: {
      name: "Free",
      description: "Perfect for personal use and testing",
      features: ["10 scans per day", "Basic threat detection", "Email support", "Community access", "Basic reports"],
      cta: "Get started",
    },
    pro: {
      name: "Pro",
      description: "Best for professionals and small teams",
      features: [
        "Unlimited scans",
        "Advanced threat detection",
        "Priority support 24/7",
        "API access",
        "Detailed analytics",
        "Custom alerts",
        "Export reports (PDF/CSV)",
      ],
      cta: "Start free trial",
    },
    enterprise: {
      name: "Enterprise",
      description: "For large organizations with custom needs",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment",
        "Advanced security features",
        "Custom training & onboarding",
      ],
      cta: "Contact sales",
      /** Shown in place of an amount, with `period` after it in smaller type. */
      price: "Custom",
      period: "",
    },
  },

  faq: {
    title: {
      lead: "Frequently asked",
      highlight: "questions",
    },
    items: [
      {
        question: "Can I switch plans later?",
        answer:
          "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.",
      },
      {
        question: "What happens after my trial ends?",
        answer:
          "After your trial ends, you’ll automatically be moved to the Free plan unless you choose to subscribe to a paid plan.",
      },
      {
        question: "Can I cancel anytime?",
        answer: "Absolutely. You can cancel your subscription at any time with no penalties or fees.",
      },
    ],
  },

  cta: {
    title: {
      lead: "Ready to",
      highlight: "get started?",
    },
    body: "Start protecting your websites today with our free plan. No credit card required.",
    trial: "Start free trial",
    scanner: "Try the scanner",
  },
};

export default pricing;
