/**
 * Client-side session state.
 *
 * There is deliberately no token here. The proxy in app/api/[...path] moves
 * every access token it sees into the httpOnly `ag_access` cookie and puts it
 * back as an Authorization header on the way to the backend, so page script
 * holds nothing worth stealing. What is kept is when the token expires, so the
 * refresh can be scheduled, and who is signed in.
 *
 * Contract: ISSUE-01-BACKEND-SPEC.md, sections 2 and 6.
 */

import { apiErrorFromResponse } from "@/app/lib/authErrors";

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
    passkey_mode?: "second_factor" | "passwordless";
    mfa: {
      totp_enabled: boolean;
      webauthn_enabled: boolean;
      recovery_codes_remaining: number;
    };
  };
}

export interface Session {
  /** Epoch milliseconds at which the access token stops being accepted. */
  expiresAt: number;
  user: SessionUser;
}

/**
 * What reaches the client after the proxy has removed the token fields.
 */
export interface SessionResponse {
  token_type?: string;
  expires_in?: number;
  user?: SessionUser;
}

const DEFAULT_TTL_SECONDS = 900;
const REFRESH_MARGIN_MS = 60_000;

let current: Session | null = null;
let refreshInFlight: Promise<Session | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;


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
  emit();
}

export async function sessionFromResponse(payload: SessionResponse): Promise<Session> {
  const expiresIn = payload.expires_in ?? DEFAULT_TTL_SECONDS;

  // /auth/login and /auth/refresh return a trimmed profile without the `auth`
  // block the security screens read, so it is topped up from /auth/me.
  const user = payload.user?.auth ? payload.user : await fetchProfile();

  return { expiresAt: Date.now() + expiresIn * 1000, user };
}

async function fetchProfile(): Promise<SessionUser> {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
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

  // A route that is missing says nothing about the session in hand, so the
  // current one is kept rather than torn down.
  if (response.status === 404 || response.status === 405 || response.status === 501) {
    return current;
  }

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

/** Restores the session on page load by exchanging the httpOnly cookie. */
export async function bootstrapSession(): Promise<Session | null> {
  return refreshSession();
}

export async function ensureSession(): Promise<Session | null> {
  if (current && current.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return current;
  }
  return refreshSession();
}

/**
 * fetch() for endpoints behind RequireAuth.
 *
 * The proxy attaches the bearer token from the cookie, so all this adds is a
 * fresh token when the current one is close to expiry, and one retry through a
 * refresh when the backend rejects it anyway.
 */
export async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await ensureSession();
  const request: RequestInit = { ...init, credentials: "same-origin", cache: "no-store" };

  const response = await fetch(path, request);
  if (response.status !== 401 || !session) return response;

  const refreshed = await refreshSession();
  if (!refreshed) return response;

  return fetch(path, request);
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
