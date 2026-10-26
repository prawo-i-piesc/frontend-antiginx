import { CONTACT_EMAIL } from "@/app/config/constants";
import { LEGAL_UPDATED } from "@/app/config/legal";
import { siteOrigin } from "@/app/lib/siteOrigin";

/**
 * security.txt (RFC 9116): where to report a vulnerability. It must not be
 * trusted past its expiry, which is set a year after the legal pages last
 * changed; bump LEGAL_UPDATED at least yearly.
 */
export async function GET() {
  const origin = await siteOrigin();
  const expires = new Date(LEGAL_UPDATED);
  expires.setFullYear(expires.getFullYear() + 1);

  const body = [
    `Contact: mailto:${CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: pl, en",
    `Policy: ${origin}/security`,
    `Canonical: ${origin}/.well-known/security.txt`,
  ].join("\n");

  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
