import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

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
