import { NextRequest } from "next/server";

/**
 * Reverse proxy from the frontend origin to the backend API.
 *
 * The browser only ever calls same-origin /api paths, so the backend address
 * stays server-side and is resolved per request from BACKEND_URL. That keeps
 * the image environment-agnostic and lets the backend stay on a cluster-local
 * address (a Kubernetes Service name, a compose service name) that a browser
 * could never resolve.
 *
 * If path-based routing is later added to the ingress, /api never reaches this
 * handler and it becomes dead weight rather than a breaking change.
 */

export const dynamic = "force-dynamic";

// Hop-by-hop headers are connection-scoped and must not be forwarded (RFC 9110
// §7.6.1). Content-Length is dropped because fetch recomputes it for the body
// it actually sends.
//
// Origin is dropped for a different reason: the browser never talks to the
// backend directly, so this hop is server-to-server and CORS does not apply to
// it. Forwarding the browser's Origin makes the backend's CORS middleware
// judge a request it was never meant to see, and reject it. The same-origin
// check that Origin exists for happens here instead, in isCrossSiteRequest.
const STRIPPED_REQUEST_HEADERS = new Set([
  // The cookie is the only source of the bearer token, so a header the client
  // supplied is dropped rather than trusted.
  "authorization",
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "origin",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Where the access token lives.
 *
 * The browser never holds it: auth responses are intercepted here, the token
 * is moved into an httpOnly cookie, and it is put back as an Authorization
 * header on the way out. Script on the page — including anything injected into
 * it — has nothing to read or send anywhere.
 */
const ACCESS_COOKIE = "ag_access";

// A browser can put whatever it likes in these, so on their own they prove
// nothing. They become evidence only once a proxy we control has overwritten
// them, which is exactly what TRUST_PROXY_HEADERS asserts: set it where an
// ingress sits in front of this app, leave it unset anywhere the browser can
// reach us directly. Trusting them by mistake would let anyone forge their own
// address and walk past the per-IP rate limits.
const FORWARDING_HEADERS = new Set([
  "forwarded",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip",
]);

function forwardingHeadersAreTrusted(): boolean {
  return process.env.TRUST_PROXY_HEADERS === "true";
}

/** Local development hosts, the only place a cookie may travel unencrypted. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * Whether the session cookie gets the Secure flag.
 *
 * Deriving this from the request protocol alone fails in the wrong direction:
 * an ingress that terminates TLS speaks plain http to this app, so the cookie
 * would go out without Secure on exactly the deployment that needs it most.
 * Anything that is not a local dev host is therefore treated as secure, and
 * COOKIE_SECURE — same name and meaning as the backend's — overrides both ways.
 */
function cookieIsSecure(request: NextRequest): boolean {
  const override = process.env.COOKIE_SECURE;
  if (override === "true") return true;
  if (override === "false") return false;

  const trusted = forwardingHeadersAreTrusted();

  const forwardedProto = trusted ? request.headers.get("x-forwarded-proto") : null;
  if (forwardedProto) return forwardedProto === "https";

  if (new URL(request.url).protocol === "https:") return true;

  // Next normalises request.url to whatever it bound to, so the host the
  // browser actually asked for has to come from the header.
  const host =
    (trusted ? request.headers.get("x-forwarded-host") : null) ??
    request.headers.get("host") ??
    new URL(request.url).host;

  return !LOCAL_HOSTS.has(host.replace(/:\d+$/, ""));
}

function accessCookie(value: string, maxAgeSeconds: number, secure: boolean): string {
  const parts = [
    `${ACCESS_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(maxAgeSeconds, 0)}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/**
 * Moves a freshly minted access token out of the response body and into the
 * cookie. Only auth routes ever carry one, so nothing else is buffered.
 */
async function captureAccessToken(
  response: Response,
  headers: Headers,
  secure: boolean,
): Promise<string | null> {
  if (!response.headers.get("content-type")?.includes("application/json")) return null;

  const raw = await response.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return raw;
  }

  const token = body.access_token ?? body.token;
  if (typeof token !== "string") return raw;

  const expiresIn = typeof body.expires_in === "number" ? body.expires_in : 900;
  headers.append("set-cookie", accessCookie(token, expiresIn, secure));

  delete body.access_token;
  delete body.token;
  return JSON.stringify(body);
}

/**
 * Rejects the cross-site writes that SameSite=Lax cookies do not already stop.
 *
 * Host cannot be forged by a page in a browser — it comes from the URL being
 * requested — so comparing it against Origin is a self-contained same-origin
 * test that needs no configuration.
 */
function isCrossSiteRequest(request: NextRequest): boolean {
  if (!UNSAFE_METHODS.has(request.method)) return false;

  // Browsers that send this state the relationship outright.
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return true;

  const origin = request.headers.get("origin");
  // A request without Origin is not a browser doing a cross-site write, which
  // is the only thing this check defends against.
  if (!origin) return false;

  const forwardedHost = forwardingHeadersAreTrusted()
    ? request.headers.get("x-forwarded-host")
    : null;
  const host = forwardedHost ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

// undici transparently decompresses the response body, so the encoding and
// length advertised by the backend no longer describe what we forward.
//
// set-cookie is handled separately: Headers.forEach folds repeated set-cookie
// headers into a single comma-joined value, which produces one malformed
// cookie instead of several valid ones. getSetCookie() keeps them apart.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "set-cookie",
  "transfer-encoding",
]);

/**
 * The OAuth endpoints are entered by a top-level navigation, so a failure has
 * no fetch caller to hand the error to and the browser just renders whatever
 * the backend returned. These paths get bounced back to the sign-in screen
 * with a code instead, which is the same channel the OAuth callback uses for
 * its own failures.
 */
function isOAuthNavigation(segments: string[]): boolean {
  return segments[0] === "auth" && segments[1] === "oauth";
}

function buildTargetUrl(request: NextRequest, segments: string[]): URL | null {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return null;
  }

  // Next resolves dot segments before routing, but the check is kept so a
  // future change to the matcher cannot turn this into an SSRF primitive.
  if (segments.some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  const path = segments.map(encodeURIComponent).join("/");
  const target = new URL(`${backendUrl.replace(/\/+$/, "")}/api/${path}`);
  target.search = new URL(request.url).search;

  return target;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;

  if (isCrossSiteRequest(request)) {
    return Response.json(
      { error: "Cross-site request rejected", code: "FORBIDDEN" },
      { status: 403 },
    );
  }

  const target = buildTargetUrl(request, path);

  if (!target) {
    console.error("BACKEND_URL is not set or the request path was rejected");
    return Response.json(
      { error: "Backend is not configured", code: "INTERNAL" },
      { status: 502 },
    );
  }

  const trustForwarding = forwardingHeadersAreTrusted();
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const name = key.toLowerCase();
    if (STRIPPED_REQUEST_HEADERS.has(name)) return;
    // Passing an unverified chain on would hand the backend a client-chosen
    // address to rate-limit and to store against the session.
    if (!trustForwarding && FORWARDING_HEADERS.has(name)) return;
    headers.set(key, value);
  });

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by undici when the body is a stream rather than a buffer.
      ...(hasBody ? { duplex: "half" } : {}),
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    console.error(`Backend request to ${target.pathname} failed`, error);
    return Response.json(
      { error: "Backend is unreachable", code: "INTERNAL" },
      { status: 502 },
    );
  }

  if (isOAuthNavigation(path) && response.status >= 400) {
    const code = response.status === 404 ? "OAUTH_NOT_AVAILABLE" : "OAUTH_PROVIDER_ERROR";
    // Relative, so the browser resolves it against the address it actually
    // used; deriving an absolute origin here would guess wrong behind an
    // ingress that rewrites the host.
    return new Response(null, {
      status: 303,
      headers: { Location: `/login?error=${code}` },
    });
  }

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  // The session cookie the backend sets on login/refresh reaches the browser
  // through here, so each Set-Cookie has to survive as its own header.
  for (const cookie of response.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  const secure = cookieIsSecure(request);

  if (path[0] === "auth" && path[1] === "logout") {
    responseHeaders.append("set-cookie", accessCookie("", 0, secure));
  }

  // Only auth routes mint tokens, so only those responses are buffered.
  if (path[0] === "auth" && response.ok) {
    const body = await captureAccessToken(response, responseHeaders, secure);
    if (body !== null) {
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
};
