import { headers } from "next/headers";

/**
 * The site's public origin, read from the request: behind the ingress, its
 * forwarded host and scheme. There is deliberately no configured base URL
 * (see app/config/constants.ts), so absolute links (sitemap, link previews,
 * security.txt) are built from the address the visitor actually used.
 */
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000").split(",")[0].trim();
  const scheme = (h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")).split(",")[0].trim();
  return `${scheme}://${host}`;
}
