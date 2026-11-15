import type { NextConfig } from "next";

/**
 * Security headers on every response, pages, files and the API alike. The
 * Content-Security-Policy, which needs a nonce for each page, is set in
 * proxy.ts. These are what our own scanner looks for on other sites.
 */
const SECURITY_HEADERS = [
  // Browsers ignore it over plain HTTP, so local development is not affected.
  // Every subdomain of the deployed hosts is served over HTTPS by the ingress.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // For browsers that do not know CSP frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "browsing-topics=()",
      // Passkeys, and copying IDs and recovery codes.
      "publickey-credentials-get=(self)",
      "publickey-credentials-create=(self)",
      "clipboard-write=(self)",
    ].join(", "),
  },
  // Cross-origin isolation. Sign-in with Google or GitHub and Stripe's checkout
  // are full-page redirects, not popups, so a separate browsing context group
  // breaks nothing. Nothing is loaded from other origins (see proxy.ts), and
  // credentialless would still let an image from one load, without cookies.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
  // Mail does not link to these files: the logo travels inside each message.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",

  // X-Powered-By would name the framework to anyone fingerprinting the site.
  poweredByHeader: false,

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Out of search results, without naming these paths in robots.txt.
      {
        source:
          "/:area(api|dashboard|admin|login|register|forgot-password|reset-password|verify-email|confirm-email|welcome)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  // The development badge would sit on the account at the foot of the sidebar.
  devIndicators: { position: "bottom-right" },

  // In `next dev` nothing else routes /api/live, which a route handler cannot
  // serve: an upgrade needs a real proxy. A rewrite to an outside address is one.
  // Deployed, the ingress sends this prefix to the backend; a rewrite would be
  // fixed at build time, which is what BACKEND_URL exists to avoid.
  async rewrites() {
    const backend = process.env.BACKEND_URL?.replace(/\/+$/, "");
    if (process.env.NODE_ENV === "production" || !backend) return [];
    return {
      beforeFiles: [{ source: "/api/live/:path*", destination: `${backend}/api/live/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    return [
      // The raw table dump this route showed was replaced by the users and
      // scans views; old bookmarks land on the first of them.
      { source: "/admin/database", destination: "/admin/users", permanent: true },
    ];
  },
};

export default nextConfig;
