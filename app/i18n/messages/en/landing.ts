/**
 * The public landing page: site header and footer (shared with the pricing
 * page), hero, free scanner and the marketing sections. Also the threat meter.
 */
const landing = {
  header: {
    nav: "Main",
    features: "Features",
    docs: "Documentation",
    pricing: "Pricing",
    signIn: "Sign in",
    dashboard: "Dashboard",
  },

  hero: {
    /** One sentence in three styled parts; the line break falls before `tail`. */
    title: {
      lead: "Scan",
      highlight: "website security",
      tail: "before you visit",
    },
    subtitle:
      "The most advanced website security scanner powered by artificial intelligence and comprehensive threat analysis algorithms.",
    tryIt: "Try it out for free!",
    learnMore: "Learn more",
    stats: {
      accuracy: { value: "99.8%", label: "Accuracy" },
      scans: { value: "30.0+", label: "Scans" },
      threats: { value: "150+", label: "Threats blocked" },
      speed: { value: "<2s", label: "Scan time" },
    },
  },

  scanner: {
    title: "Try it out!",
    /** `emphasis` is shown in bold between the two halves. */
    intro: {
      before: "Check a website for potential threats before visiting ",
      emphasis: "for free",
      after: ".",
    },
    inputLabel: "Website address to scan",
    run: "RUN",
    /** Read after the visible "RUN", so the button makes sense on its own. */
    runContext: "scan",
    scanning: "SCANNING…",
    started: (url: string) => `Scanning ${url}…`,
    disclaimer: "By scanning, you confirm that you have the right to analyze this domain.",
  },

  security: {
    title: {
      lead: "Practical security",
      highlight: "you can rely on",
    },
    body: "We focus on sensible, well-tested security practices — secure connections, careful handling of data, and regular checks to keep things up to date.",
    points: {
      encryption: {
        title: "Encrypted connections",
        body: "All traffic is encrypted in transit (HTTPS/TLS).",
      },
      updates: {
        title: "Regular updates",
        body: "We run routine security checks and apply updates promptly.",
      },
      retention: {
        title: "Minimal data retention",
        body: "We keep only what’s necessary and avoid storing unnecessary user data.",
      },
    },
    highlights: {
      tls: { value: "TLS", label: "Encrypted connections" },
      reliability: { value: "99%+", label: "Designed for reliability" },
      monitoring: { value: "24/7", label: "Monitoring" },
      reviews: { value: "Checks", label: "Regular security reviews" },
    },
  },

  features: {
    title: {
      lead: "Comprehensive",
      tail: "security protection",
    },
    body: "We use the latest AI and machine learning technologies to detect malware, phishing, suspicious content and other security threats.",
    cards: {
      detection: {
        title: "Multi-threat detection",
        body: "Comprehensive scanning for malware, phishing, suspicious scripts, and other security threats in real time.",
        points: ["Malware and virus detection", "Phishing site identification", "Suspicious script analysis"],
      },
      intelligence: {
        title: "Global threat intelligence",
        body: "Constantly updated database containing thousands of known malicious sites, infected domains and security threats from around the world.",
        points: ["Real-time threat feeds", "Security vendor collaboration", "Community threat sharing"],
      },
      ai: {
        title: "AI & machine learning",
        body: "Artificial intelligence trained on millions of samples detecting new, previously unknown security threats and attack patterns.",
        points: ["Advanced threat detection", "Behavioral analysis", "Zero-day threat detection"],
      },
    },
  },

  cta: {
    title: "Ready for complete protection?",
    body: "Join thousands of companies that already protect themselves from security threats with Antiginx.",
    start: "Start for free",
    expert: "Talk to an expert",
  },

  footer: {
    tagline: "Advanced AI-powered website security scanner protecting users from online threats.",
    columns: {
      product: "Product",
      company: "Company",
      support: "Support",
      legal: "Legal",
    },
    links: {
      features: "Features",
      api: "API",
      docs: "Docs",
      pricing: "Pricing",
      about: "About",
      blog: "Blog",
      careers: "Careers",
      help: "Help",
      contact: "Contact",
      status: "Status",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
    },
    /** Name of an icon-only link to a social network profile. */
    social: (network: string) => `Antiginx on ${network}`,
    copyright: (year: number) => `© ${year} Antiginx. All rights reserved.`,
  },

  threatMeter: {
    /** Spoken in place of the gauge: "Threat level: 45%. Caution". */
    label: (level: number, verdict: string) => `Threat level: ${level}%. ${verdict}`,
    verdicts: {
      safe: "Safe",
      caution: "Caution",
      danger: "Dangerous",
    },
    legend: {
      low: "0–29% Safe",
      medium: "30–69% Medium",
      high: "70–100% High",
    },
  },
};

export default landing;
