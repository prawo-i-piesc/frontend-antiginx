import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Redirects unauthenticated visitors away from /admin so they get the login
 * screen instead of an admin shell that fails every request.
 *
 * This is a navigation concern, not an authorisation boundary: the cookie is
 * only checked for presence and is trivially forged. Every /admin endpoint
 * must independently verify the bearer token and the admin role server-side.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth.token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
