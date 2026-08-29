/**
 * Error codes returned by the auth API (ISSUE-01-BACKEND-SPEC.md, section 3)
 * and the copy shown for each. The backend's own `error` string is written for
 * logs; everything a user reads is defined here.
 */

export type AuthErrorCode =
  | "VALIDATION_FAILED"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "MFA_INVALID_CODE"
  | "MFA_TOKEN_EXPIRED"
  | "MFA_ALREADY_ENABLED"
  | "MFA_NOT_ENABLED"
  | "RECOVERY_CODE_INVALID"
  | "STEP_UP_REQUIRED"
  | "SESSION_EXPIRED"
  | "SESSION_REUSE_DETECTED"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "PASSWORD_TOO_WEAK"
  | "PASSWORD_SAME_AS_OLD"
  | "OAUTH_STATE_INVALID"
  | "OAUTH_EMAIL_UNVERIFIED"
  | "OAUTH_ACCOUNT_CONFLICT"
  | "OAUTH_PROVIDER_ERROR"
  | "PROVIDER_ALREADY_LINKED"
  | "LAST_LOGIN_METHOD"
  | "WEBAUTHN_CHALLENGE_INVALID"
  | "WEBAUTHN_VERIFICATION_FAILED"
  | "CREDENTIAL_NOT_FOUND"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "INTERNAL";

const MESSAGES: Record<AuthErrorCode, string> = {
  VALIDATION_FAILED: "Some fields need fixing. Check the highlighted ones and try again.",
  EMAIL_TAKEN: "An account with this email already exists. Sign in instead?",
  INVALID_CREDENTIALS: "Incorrect email or password.",
  ACCOUNT_LOCKED: "Too many failed attempts. Your account is locked for a few minutes.",
  MFA_INVALID_CODE: "That code is not valid. Check your authenticator app and try again.",
  MFA_TOKEN_EXPIRED: "This verification step expired. Sign in again to get a new code prompt.",
  MFA_ALREADY_ENABLED: "Two-factor authentication is already set up on this account.",
  MFA_NOT_ENABLED: "Two-factor authentication is not set up on this account.",
  RECOVERY_CODE_INVALID: "That recovery code is not valid or has already been used.",
  STEP_UP_REQUIRED: "Confirm your password to continue.",
  SESSION_EXPIRED: "Your session expired. Sign in again to continue.",
  SESSION_REUSE_DETECTED: "You were signed out for security reasons. Sign in again.",
  TOKEN_INVALID: "This reset link is not valid. Request a new one.",
  TOKEN_EXPIRED: "This reset link has expired. Request a new one.",
  PASSWORD_TOO_WEAK: "Choose a stronger password — at least 12 characters, and not a common one.",
  PASSWORD_SAME_AS_OLD: "Your new password has to be different from the current one.",
  OAUTH_STATE_INVALID: "That sign-in attempt could not be verified. Start again.",
  OAUTH_EMAIL_UNVERIFIED: "Your provider has not verified this email address. Verify it there first.",
  OAUTH_ACCOUNT_CONFLICT: "This email already belongs to an account. Sign in with your password, then link the provider from your profile.",
  OAUTH_PROVIDER_ERROR: "The sign-in provider did not respond. Try again in a moment.",
  PROVIDER_ALREADY_LINKED: "This provider account is already linked to another AntiGinx account.",
  LAST_LOGIN_METHOD: "This is your only way to sign in. Add another method before removing it.",
  WEBAUTHN_CHALLENGE_INVALID: "This passkey request expired. Try again.",
  WEBAUTHN_VERIFICATION_FAILED: "That passkey could not be verified.",
  CREDENTIAL_NOT_FOUND: "We could not find that credential.",
  RATE_LIMITED: "Too many attempts. Wait a moment before trying again.",
  FORBIDDEN: "You do not have access to that.",
  INTERNAL: "Something went wrong on our side. Try again in a moment.",
};

const FALLBACK = "Something went wrong. Try again in a moment.";

export function messageForCode(code: string | null | undefined, fallback = FALLBACK): string {
  if (!code) return fallback;
  return MESSAGES[code as AuthErrorCode] ?? fallback;
}

/**
 * `message` is always safe to render: known codes resolve through the table
 * above, unknown ones fall back, and the backend's own string is never shown.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fields: Record<string, string>;
  readonly retryAfter: number | null;

  constructor(init: {
    status: number;
    code?: string | null;
    fields?: Record<string, string> | null;
    retryAfter?: number | null;
    message?: string;
  }) {
    super(init.message ?? messageForCode(init.code));
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code ?? null;
    this.fields = init.fields ?? {};
    this.retryAfter = init.retryAfter ?? null;
  }

  is(code: AuthErrorCode): boolean {
    return this.code === code;
  }
}

/** Builds an ApiError from a failed response, tolerating non-JSON bodies. */
export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  let body: Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    // A gateway, or a route that does not exist yet, answers with HTML or text.
  }

  const code = typeof body.code === "string" ? body.code : null;
  const fields =
    body.fields && typeof body.fields === "object"
      ? (body.fields as Record<string, string>)
      : null;

  const retryAfterHeader = response.headers.get("Retry-After");
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : null;

  return new ApiError({
    status: response.status,
    code,
    fields,
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
    message: messageForCode(code, statusFallback(response.status)),
  });
}

function statusFallback(status: number): string {
  if (status === 401) return "Your session expired. Sign in again to continue.";
  if (status === 403) return "You do not have access to that.";
  if (status === 404) return "That is not available yet.";
  if (status === 429) return "Too many attempts. Wait a moment before trying again.";
  if (status >= 500) return "Something went wrong on our side. Try again in a moment.";
  return FALLBACK;
}
