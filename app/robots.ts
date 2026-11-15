import type { MetadataRoute } from "next";

import { siteOrigin } from "@/app/lib/siteOrigin";

/**
 * Crawlers may go anywhere; the sitemap lists the public pages. Pages behind
 * sign-in and the API are kept out of search results by an X-Robots-Tag
 * header (next.config.ts), not by Disallow rules here: robots.txt is public,
 * so naming the login, admin and API paths would only point at them, and a
 * disallowed page can still be indexed from links to it.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${await siteOrigin()}/sitemap.xml`,
  };
}
