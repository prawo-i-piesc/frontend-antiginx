import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // The development badge would sit on the account at the foot of the sidebar.
  devIndicators: { position: "bottom-right" },

  async redirects() {
    return [
      // The raw table dump this route showed was replaced by the users and
      // scans views; old bookmarks land on the first of them.
      { source: "/admin/database", destination: "/admin/users", permanent: true },
    ];
  },
};

export default nextConfig;
