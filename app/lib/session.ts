/**
 * Client-side session store.
 *
 * The access token lives in module memory only — never in localStorage,
 * sessionStorage or a readable cookie. What survives a reload is the httpOnly
 * `ag_session` cookie the backend sets, which this module exchanges for a
 * fresh access token through POST /api/auth/refresh.
 *
 * Contract: ISSUE-01-BACKEND-SPEC.md, sections 2 and 6.
 */

import { ApiError, apiErrorFromResponse } from "@/app/lib/authErrors";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at?: string;
  auth?: {
    password_set: boolean;
    email_verified: boolean;
    providers: string[];
    mfa: {
      totp_enabled: boolean;
      webauthn_enabled: boolean;
      recovery_codes_remaining: number;
    };
  };
}

export interface Session {
  accessToken: string;
  /** Epoch milliseconds at which the access token stops being accepted. */
  expiresAt: number;
  user: SessionUser;
}

export interface SessionResponse {
  access_token?: string;
  /** Legacy field name, still returned until the backend ships stage E1. */
  token?: string;
  token_type?: string;
  expires_in?: number;
  user?: SessionUser;
}

const DEFAULT_TTL_SECONDS = 900;
const REFRESH_MARGIN_MS = 60_000;

let current: Session | null = null;
let refreshInFlight: Promise<Session | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Whether the backend actually serves POST /api/auth/refresh. null until the
 * first attempt tells us. Everything below that mentions the fallback exists
 * only while this can be false, and goes once stage E1 ships.
 */
let refreshEndpointAvailable: boolean | null = null;

const FALLBACK_KEY = "ag.session.fallback";

const listeners = new Set<(session: Session | null) => void>();

export function getSession(): Session | null {
  return current;
}

export function subscribeToSession(listener: (session: Session | null) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener(current);
}

function cancelScheduledRefresh(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleRefresh(): void {
  cancelScheduledRefresh();
  if (!current || typeof window === "undefined") return;

  const delay = Math.max(current.expiresAt - Date.now() - REFRESH_MARGIN_MS, 5_000);
  refreshTimer = setTimeout(() => {
    void refreshSession();
  }, delay);
}

export function setSession(session: Session): void {
  current = session;
  persistFallbackSession(session);
  scheduleRefresh();
  emit();
}

/** Replaces the profile on the live session, after it changes server-side. */
export function setSessionUser(user: SessionUser): void {
  if (!current) return;
  current = { ...current, user };
  emit();
}

export function clearSession(): void {
  current = null;
  cancelScheduledRefresh();
  forgetFallbackSession();
  emit();
}

/**
 * Turns an auth response into a Session.
 *
 * The `token` branch and the profile fallback cover the pre-E1 backend; both
 * go once /auth/login returns `access_token` and `user`.
 */
export async function sessionFromResponse(payload: SessionResponse): Promise<Session> {
  const accessToken = payload.access_token ?? payload.token;
  if (!accessToken) {
    throw new ApiError({ status: 500, code: "INTERNAL" });
  }

  const expiresIn = payload.expires_in ?? DEFAULT_TTL_SECONDS;

  // /auth/login returns a trimmed profile without the `auth` block that the
  // security screens read, so it is topped up from /auth/me. Drops out on its
  // own once login returns the same shape.
  const user = payload.user?.auth ? payload.user : await fetchProfile(accessToken);

  return { accessToken, expiresAt: Date.now() + expiresIn * 1000, user };
}

async function fetchProfile(accessToken: string): Promise<SessionUser> {
  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) throw await apiErrorFromResponse(response);
  return (await response.json()) as SessionUser;
}

/**
 * Exchanges the session cookie for a fresh access token.
 *
 * Single-flight, so the scheduled timer, a 401 retry and two components
 * mounting at once share one request — the backend must never see the same
 * refresh token twice in parallel or its reuse detection fires.
 */
export function refreshSession(): Promise<Session | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function performRefresh(): Promise<Session | null> {
  let response: Response;
  try {
    response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return current;
  }

  // Only an outright rejection means the session is gone; a gateway error or a
  // backend restart is transient and must not sign the user out.
  if (response.status >= 500) return current;

  // The endpoint is not deployed yet. That says nothing about the session in
  // hand, so keep it — treating this as a rejection is what was signing people
  // out mid-visit and on every reload.
  if (response.status === 404 || response.status === 405 || response.status === 501) {
    refreshEndpointAvailable = false;
    return current;
  }

  refreshEndpointAvailable = true;

  if (!response.ok) {
    clearSession();
    return null;
  }

  try {
    const session = await sessionFromResponse((await response.json()) as SessionResponse);
    setSession(session);
    return session;
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Restores the session on page load.
 *
 * The cookie is the real mechanism; the stored copy is only reached when the
 * backend has no refresh endpoint to exchange that cookie at.
 */
export async function bootstrapSession(): Promise<Session | null> {
  const refreshed = await refreshSession();
  if (refreshed) return refreshed;
  if (refreshEndpointAvailable === false) return await restoreFallbackSession();
  return null;
}

/**
 * Temporary bridge until the backend ships POST /api/auth/refresh (stage E1).
 *
 * Without a refresh endpoint there is nothing to rebuild a session from after
 * a reload, and the app signs the user out on every F5. Until then the access
 * token is kept in sessionStorage — it dies with the tab, unlike the
 * localStorage copy this replaced — and only while the endpoint is missing.
 * The moment refresh answers, this path stops being reached and the whole
 * block can be deleted.
 */
function persistFallbackSession(session: Session): void {
  if (refreshEndpointAvailable !== false || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FALLBACK_KEY, JSON.stringify(session));
  } catch {
    // Private mode; the user simply signs in again after a reload.
  }
}

function forgetFallbackSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(FALLBACK_KEY);
  } catch {
    // As above.
  }
}

async function restoreFallbackSession(): Promise<Session | null> {
  if (typeof window === "undefined") return null;

  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(FALLBACK_KEY);
  } catch {
    return null;
  }
  if (!stored) return null;

  let session: Session;
  try {
    session = JSON.parse(stored) as Session;
  } catch {
    forgetFallbackSession();
    return null;
  }

  if (!session.accessToken || session.expiresAt - Date.now() <= 0) {
    forgetFallbackSession();
    return null;
  }

  // The stored profile can be stale — /auth/login returns a trimmed one, and
  // the account may have changed since. Reading it back settles that and
  // proves the token is still accepted, which the stored copy cannot.
  try {
    const user = await fetchProfile(session.accessToken);
    const restored = { ...session, user };
    setSession(restored);
    return restored;
  } catch {
    forgetFallbackSession();
    return null;
  }
}

export async function ensureSession(): Promise<Session | null> {
  if (current && current.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return current;
  }
  return refreshSession();
}

/**
 * fetch() for endpoints behind RequireAuth. Retries once through a refresh on
 * a 401, which happens when the token expires earlier than advertised.
 */
export async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await ensureSession();

  const response = await fetch(path, withAuth(init, session?.accessToken));
  if (response.status !== 401 || !session) return response;

  const refreshed = await refreshSession();
  if (!refreshed) return response;

  return fetch(path, withAuth(init, refreshed.accessToken));
}

function withAuth(init: RequestInit, accessToken: string | undefined): RequestInit {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...init, headers, credentials: "same-origin", cache: "no-store" };
}

/**
 * Drops the token older builds kept in localStorage, sessionStorage and a
 * readable cookie, so a returning user stops carrying it on disk.
 */
export function purgeLegacyTokenStorage(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem("auth.token");
    window.sessionStorage.removeItem("auth.token");
  } catch {
    // Storage throws in private mode; nothing to recover.
  }

  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `auth.token=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  } catch {
    // document.cookie is unavailable in some embedded contexts.
  }
}
