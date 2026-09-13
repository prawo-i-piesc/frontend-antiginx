import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirects unauthenticated visitors away from /admin so they get the login
 * screen instead of an admin shell that fails every request.
 *
 * This is a navigation concern, not an authorisation boundary: the cookie is
 * only checked for presence, never parsed or trusted. Every /admin endpoint
 * must independently verify the bearer token and the admin role server-side.
 *
 * The cookie is httpOnly and set by the backend, so it is invisible to client
 * code but still reaches middleware, which runs on the server.
 */

const SESSION_COOKIE = "ag_session";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
