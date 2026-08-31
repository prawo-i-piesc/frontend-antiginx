/**
 * Auth endpoints, typed against ISSUE-01-BACKEND-SPEC.md section 5.
 *
 * Every call uses a same-origin /api path so the browser sends and receives
 * the session cookie without cross-origin setup; app/api/[...path]/route.ts
 * forwards both directions.
 */

import { ApiError, apiErrorFromResponse, type AuthErrorCode } from "@/app/lib/authErrors";
import type { OAuthProvider } from "@/app/lib/oauthProviders";
import {
  authorizedFetch,
  clearSession,
  setSession,
  sessionFromResponse,
  type Session,
  type SessionResponse,
  type SessionUser,
} from "@/app/lib/session";

export type MfaMethod = "totp" | "webauthn" | "recovery_code";

/**
 * `created` covers the pre-E1 backend, whose register endpoint answers with a
 * message and no token; it goes once registration signs the user in.
 */
export type AuthResult =
  | { kind: "session"; session: Session }
  | { kind: "mfa"; mfaToken: string; methods: MfaMethod[]; expiresIn: number }
  | { kind: "created" };

/** Signing in always ends in a session or a second-factor step, never `created`. */
export type LoginResult = Exclude<AuthResult, { kind: "created" }>;

interface MfaChallengeResponse {
  mfa_required?: boolean;
  mfa_token?: string;
  methods?: MfaMethod[];
  expires_in?: number;
}

/** Rejects absolute and protocol-relative targets, which would be open redirects. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

async function postJson(path: string, body?: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });
}

/**
 * Until the backend sends `code`, the status has to carry the meaning. Safe
 * only here: on these three endpoints a 401 is a rejected credential, not the
 * expired session the generic fallback assumes.
 */
async function readAuthError(
  response: Response,
  unauthorizedCode: AuthErrorCode,
): Promise<ApiError> {
  const error = await apiErrorFromResponse(response);
  if (error.code) return error;

  const inferred: AuthErrorCode | undefined = {
    400: "VALIDATION_FAILED" as const,
    401: unauthorizedCode,
    409: "EMAIL_TAKEN" as const,
  }[response.status];

  return inferred
    ? new ApiError({ status: response.status, code: inferred, fields: error.fields })
    : error;
}

async function readAuthResult(
  response: Response,
  unauthorizedCode: AuthErrorCode = "INVALID_CREDENTIALS",
): Promise<AuthResult> {
  if (!response.ok) throw await readAuthError(response, unauthorizedCode);

  const payload = (await response.json()) as SessionResponse & MfaChallengeResponse;

  if (payload.mfa_required) {
    if (!payload.mfa_token) throw new ApiError({ status: 500, code: "INTERNAL" });
    return {
      kind: "mfa",
      mfaToken: payload.mfa_token,
      methods: payload.methods ?? ["totp"],
      expiresIn: payload.expires_in ?? 300,
    };
  }

  // The proxy has already taken the token out of the body, so a session is
  // recognised by the profile that comes with it. Register on an older backend
  // answers with a message and nothing else.
  if (!payload.user) return { kind: "created" };

  const session = await sessionFromResponse(payload);
  setSession(session);
  return { kind: "session", session };
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  return readAuthResult(await postJson("/api/auth/register", payload));
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const result = await readAuthResult(await postJson("/api/auth/login", payload));
  if (result.kind === "created") throw new ApiError({ status: 500, code: "INTERNAL" });
  return result;
}

export async function verifyMfa(payload: {
  mfaToken: string;
  method: Exclude<MfaMethod, "webauthn">;
  code: string;
}): Promise<LoginResult> {
  const result = await readAuthResult(
    await postJson("/api/auth/mfa/verify", {
      mfa_token: payload.mfaToken,
      method: payload.method,
      code: payload.code,
    }),
    "MFA_INVALID_CODE",
  );
  if (result.kind === "created") throw new ApiError({ status: 500, code: "INTERNAL" });
  return result;
}

export async function logout(options: { allDevices?: boolean } = {}): Promise<void> {
  try {
    await authorizedFetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all_devices: Boolean(options.allDevices) }),
    });
  } catch {
    // Someone who clicked sign out ends up signed out in front of them,
    // whatever the network did — and the caller still gets to redirect.
  } finally {
    clearSession();
  }
}

export async function getMe(): Promise<SessionUser> {
  const response = await authorizedFetch("/api/auth/me");
  if (!response.ok) throw await apiErrorFromResponse(response);
  return (await response.json()) as SessionUser;
}

/** Answers 202 whether or not the address is registered, so success proves nothing. */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await postJson("/api/auth/password/forgot", { email });
  if (!response.ok) throw await apiErrorFromResponse(response);
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const response = await postJson("/api/auth/password/reset", {
    token: payload.token,
    new_password: payload.newPassword,
  });
  if (!response.ok) throw await apiErrorFromResponse(response);
}

/** Omit `currentPassword` for an OAuth-only account setting its first password. */
export async function changePassword(payload: {
  currentPassword?: string;
  newPassword: string;
}): Promise<void> {
  const response = await authorizedFetch("/api/auth/password/change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
    }),
  });

  if (!response.ok) throw await apiErrorFromResponse(response);

  // The backend rotates the session, since a password change kills every other
  // one; the proxy has already stored the new token.
  const rotated = (await response.json().catch(() => null)) as SessionResponse | null;
  if (rotated?.expires_in) {
    setSession(await sessionFromResponse(rotated));
  }
}

export function oauthStartUrl(provider: OAuthProvider, next = "/dashboard"): string {
  return `/api/auth/oauth/${provider}/start?next=${encodeURIComponent(safeNextPath(next))}`;
}

/**
 * Starts linking a provider to the signed-in account.
 *
 * Returns where to send the browser: the provider needs a top-level redirect,
 * and the backend has just set its state cookie for the trip.
 */
export async function linkProviderUrl(
  provider: OAuthProvider,
  next = "/dashboard/profile",
): Promise<string> {
  const response = await authorizedFetch(
    `/api/auth/oauth/${provider}/link?next=${encodeURIComponent(safeNextPath(next))}`,
    { method: "POST" },
  );

  if (!response.ok) throw await apiErrorFromResponse(response);

  const { redirect_url } = (await response.json()) as { redirect_url?: string };
  if (!redirect_url) throw new ApiError({ status: 500, code: "INTERNAL" });
  return redirect_url;
}

export async function unlinkProvider(provider: OAuthProvider): Promise<void> {
  const response = await authorizedFetch(`/api/auth/oauth/${provider}`, { method: "DELETE" });
  if (!response.ok) throw await apiErrorFromResponse(response);
}
