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

export function clearSession(): void {
  current = null;
  cancelScheduledRefresh();
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
  const user = payload.user ?? (await fetchProfile(accessToken));

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
