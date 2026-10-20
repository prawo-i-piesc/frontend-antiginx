/**
 * The public landing page: site header and footer (shared with the pricing
 * page), hero, free scanner and the sections describing what a scan does.
 * Also the threat meter.
 *
 * Everything here has to hold for the product as it is: the tests the engine
 * runs, what an account adds, what the scanner does not do.
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
    /** One sentence; `highlight` is shown in colour. */
    title: {
      lead: "See what a website",
      highlight: "doesn’t show you.",
    },
    subtitle:
      "Headers, certificate, cookies, DNS and the traces of phishing: everything your browser keeps out of sight, checked in a single scan.",
    tryIt: "Try it for free",
    learnMore: "How it works",
    /** The illustration of a scan next to the scanner. */
    xray: {
      label:
        "Illustration: the scanner X-raying an example online shop, revealing its HTTP headers, TLS certificate, cookies and DNS records.",
      pause: "Pause the X-ray",
      resume: "Resume the X-ray",
      validFor: (days: number) => `valid for ${days} more days`,
      registered: "registered",
      findings: {
        server: "nginx version exposed",
        hsts: "No HSTS header",
        tls: "TLS 1.3, valid certificate",
        domain: "Domain registered in 2009",
      },
    },
  },

  scanner: {
    title: "Try it for free",
    /** `emphasis` is shown in bold between the two halves. */
    intro: {
      before: "Enter an address and see how the site does, ",
      emphasis: "no account needed",
      after: ". The result opens right here.",
    },
    inputLabel: "Website address to scan",
    run: "RUN",
    /** Read after the visible "RUN", so the button makes sense on its own. */
    runContext: "scan",
    scanning: "SCANNING…",
    started: (url: string) => `Scanning ${url}…`,
    disclaimer: "By scanning, you confirm that you have the right to analyze this domain.",
  },

  checks: {
    title: "What a scan checks",
    body: "From the TLS certificate to the age of the domain: what the tests look at, area by area.",
    /** Read in place of the "…" that ends each area's list of tests. */
    more: "and more",
    growing: "The list keeps growing: new tests are added regularly.",
    fullList: "Full list in the documentation",
    /** Words in the small illustration above each area. */
    art: {
      lookalike: "rn passes for m",
      registeredAgo: (days: number) => `registered ${days} days ago`,
      cve: "known vulnerabilities",
      exposed: "listed in sitemap.xml",
    },
    groups: {
      encryption: {
        title: "Encryption",
        body: "Whether the connection uses TLS, whether the site tells browsers never to fall back to plain HTTP, and how strong its certificate is.",
      },
      headers: {
        title: "Security headers",
        body: "The policies that stop injected scripts, framing by other sites, access to the camera or microphone, and the page address leaking to third parties.",
      },
      cookies: {
        title: "Cookies and sessions",
        body: "Whether every cookie carries the HttpOnly, Secure and SameSite flags that keep a session away from scripts and eavesdroppers.",
      },
      exposure: {
        title: "Exposed information",
        body: "Software versions the headers give away, looked up in the NIST vulnerability database, paths the sitemap hands to search engines, and the CDN or WAF in front of the site.",
      },
      phishing: {
        title: "Signs of phishing",
        body: "Domains that imitate well-known brands, the domain’s age and registration details, a favicon borrowed from another site, and deliberately obfuscated JavaScript.",
      },
    },
  },

  how: {
    title: "How a scan works",
    body: "The engine splits a scan into three tracks and runs them side by side, so even when a site blocks the scanner, the address and domain tests still report.",
    /** The engine's three tracks: a short tag, shown in the terminal, and what it means. */
    lanes: {
      address: { tag: "address", note: "need only the address and the DNS" },
      response: { tag: "page", note: "read the page’s response" },
      own: { tag: "connection", note: "open their own: certificate, sitemap" },
    },
    /** The made-up scan the terminal plays back. */
    terminal: {
      title: "antiginx · scan",
      label:
        "Example scan of shop.example: the address, DNS and certificate tests pass; the page sends no HSTS header, gives away its nginx version and sets a cookie without SameSite. Threat level 38%, caution.",
      queued: "queued for the engine",
      fetch: "GET / → 200",
      cookie: "no SameSite",
      more: "…and more tests",
      done: "done",
      threat: "threat level",
      replay: "Replay",
    },
    steps: {
      submit: {
        title: "You enter an address",
        body: "Here for a quick check, or in your dashboard, where you choose which tests to run.",
      },
      run: {
        title: "The engine runs the tests",
        body: "On three tracks at once. The page track waits for the site to answer; the other two start right away:",
      },
      result: {
        title: "You get the result",
        body: "Each test returns a verdict, a threat level and details, which add up to an overall threat level. You can download it all as a report.",
      },
    },
  },

  account: {
    title: "Get more with an account",
    body: "The scanner above is a quick check. Your dashboard gives you:",
    items: {
      pick: "Your choice of tests for every scan",
      schedule: "Scans that run on a schedule",
      history: "Scan history and a dashboard summary",
      charts: "Charts of each domain’s threat level over time",
      security: "An account protected by 2FA and passkeys",
    },
    /** Last tile, a link to the pricing page. */
    more: "And much more",
    moreContext: "see pricing",
    register: "Create an account",
    dashboard: "Go to your dashboard",
    pricing: "See pricing",
    /** The made-up dashboard next to the list. */
    mock: {
      dashboard: "Dashboard",
      chart: "Threat level · shop.example",
      recent: "Recent scans",
      today: "today",
      yesterday: "yesterday",
      daysAgo: (days: number) => `${days} days ago`,
      schedule: "Schedule",
      weekly: "Weekly · Mon 06:00",
    },
  },

  footer: {
    tagline: "Website security scanner.",
    nav: "Footer",
    links: {
      pricing: "Pricing",
      docs: "Documentation",
      github: "GitHub",
    },
    license: "MIT licence",
    copyright: (year: number) => `© ${year} Antiginx`,
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
