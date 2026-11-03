/**
 * The tests the engine can run, and the two names each goes by: the id a scan
 * asks for and the name its result comes back under, which is the only thing
 * tying the two together. Categories follow CategorizedTests in the backend
 * (internal/handlers/scan_handler.go) and names the engine's own, so a test
 * added there is added here too. Until then it shows up as a row of its own
 * under whatever name the engine gave it.
 */
const CATALOG: readonly { category: string; tests: readonly (readonly [id: string, engineName: string])[] }[] = [
  {
    category: "SSL/TLS & Encryption",
    tests: [
      ["https", "HTTPS Protocol Verification"],
      ["hsts", "HSTS Header Analysis"],
      ["ssl-cert", "SSL Certificate Security Analysis"],
    ],
  },
  {
    category: "Security Headers",
    tests: [
      ["csp", "Content Security Policy Analysis"],
      ["xframe", "X-Frame-Options & CSP Frame Protection Analysis"],
      ["permissions-policy", "Permissions-Policy Header Analysis"],
      ["x-content-type-options", "X-Content-Type-Options Header Analysis"],
      ["referrer-policy", "Referrer-Policy Header Analysis"],
      ["cross-origin-x", "Cross-Origin Security Headers Analysis"],
    ],
  },
  {
    category: "Privacy & Session Management",
    tests: [
      ["cookie-sec", "Cookie Security Analysis"],
      ["cache-control", "Cache-Control Analysis"],
    ],
  },
  {
    category: "Reconnaissance & Server Information",
    tests: [
      ["serv-h-a", "Server Technology Disclosure Analysis"],
      ["sitemap", "Sitemap Security Analysis"],
      ["robots-txt", "Robots.txt Security Analysis"],
      ["bot-protection", "Bot Protection Block Assessment"],
    ],
  },
  {
    category: "Vulnerabilities & Code Analysis",
    tests: [
      ["js-obf", "JavaScript Obfuscation Detection"],
      ["phishing-url", "Phishing URL Analysis"],
      ["dns-reputation", "DNS and Domain Registration Analysis"],
      ["urlhaus", "URLhaus Malicious URL Lookup"],
      ["favicon-origin", "Favicon Origin Analysis"],
      ["dir-listing", "Directory Listing Detection"],
      ["sensitive-files", "Sensitive File Exposure"],
    ],
  },
];

const ENTRIES = CATALOG.flatMap(({ category, tests }) =>
  tests.map(([id, engineName]) => ({ id, engineName, category })),
);

const ID_BY_ENGINE_NAME = new Map(ENTRIES.map(({ id, engineName }) => [engineName, id]));
const CATEGORY_BY_ID = new Map(ENTRIES.map(({ id, category }) => [id, category]));
const ORDER_BY_ID = new Map(ENTRIES.map(({ id }, index) => [id, index]));

export function testIdOf(engineName: string): string | undefined {
  return ID_BY_ENGINE_NAME.get(engineName);
}

export function categoryOf(testId: string): string | null {
  return CATEGORY_BY_ID.get(testId) ?? null;
}

/** Where the test comes in the catalogue; tests it does not know go last. */
export function catalogOrder(testId: string | null): number {
  return (testId === null ? undefined : ORDER_BY_ID.get(testId)) ?? Number.MAX_SAFE_INTEGER;
}
