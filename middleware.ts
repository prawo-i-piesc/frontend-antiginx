import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLE = "admin";

async function isAdminToken(
  token: string,
  backendUrl: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return false;

    const payload = (await res.json()) as { role?: string };
    return payload.role === ADMIN_ROLE;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth.token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    const deniedUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(deniedUrl);
  }

  const admin = await isAdminToken(token, backendUrl);
  if (!admin) {
    const deniedUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
