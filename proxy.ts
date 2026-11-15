import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Runs before every page is rendered.
 *
 * It sets the page's Content-Security-Policy with a nonce of its own: Next.js
 * reads the policy from the request, puts the nonce on the scripts it renders,
 * and the browser runs only those, and what they load. The pages are rendered
 * for each request anyway (the language comes from a cookie), so a nonce costs
 * nothing. The headers that are the same on every response are set in
 * next.config.ts.
 *
 * It also sends visitors without a session from /admin to the login screen,
 * instead of an admin shell that fails every request. That is a navigation
 * concern, not an authorisation boundary: the cookie is only checked for
 * presence, never parsed or trusted. Every /admin endpoint verifies the token
 * and the admin role on the server. The cookie is httpOnly and set by the
 * backend, so client code cannot see it, but it reaches the proxy.
 */

const SESSION_COOKIE = "ag_session";

function contentSecurityPolicy(nonce: string, request: NextRequest): string {
  // Deployed, TLS ends at the ingress, which says so in X-Forwarded-Proto.
  const secure =
    request.headers.get("x-forwarded-proto") === "https" || request.nextUrl.protocol === "https:";

  return [
    "default-src 'self'",
    // 'strict-dynamic' lets the scripts Next.js renders load its other chunks.
    // React needs eval in development only, for its error overlay.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    // React renders style attributes (measured heights, motion, charts), which
    // cannot carry a nonce. Injected CSS cannot run script.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // The live scan's WebSocket is on this origin too.
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(secure ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && !request.cookies.get(SESSION_COOKIE)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const nonce = btoa(crypto.randomUUID());
  const policy = contentSecurityPolicy(nonce, request);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: not the API, which the backend answers, nor files that
      // run no script.
      source: "/((?!api/|_next/static|_next/image|.*\\.(?:ico|png|svg|jpg|jpeg|webp|txt|xml|woff2?)$).*)",
      // A prefetch renders nothing that runs.
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
