import type { MetadataRoute } from "next";

import { LEGAL_UPDATED } from "@/app/config/legal";
import { siteOrigin } from "@/app/lib/siteOrigin";

/** The public pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();
  return [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${origin}/terms`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/privacy`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/security`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];
}
