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
const STRIPPED_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

// undici transparently decompresses the response body, so the encoding and
// length advertised by the backend no longer describe what we forward.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "transfer-encoding",
]);

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
  const target = buildTargetUrl(request, path);

  if (!target) {
    console.error("BACKEND_URL is not set or the request path was rejected");
    return Response.json({ error: "Backend is not configured" }, { status: 502 });
  }

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

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
    return Response.json({ error: "Backend is unreachable" }, { status: 502 });
  }

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

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
