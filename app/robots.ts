import type { MetadataRoute } from "next";

import { siteOrigin } from "@/app/lib/siteOrigin";

/** Search engines get the public pages; the app behind sign-in and the API stay out. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/confirm-email",
        "/welcome",
      ],
    },
    sitemap: `${await siteOrigin()}/sitemap.xml`,
  };
}
