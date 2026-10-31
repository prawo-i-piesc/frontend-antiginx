import { activeMessages } from "@/app/i18n/active";

/**
 * Error codes returned by the auth API (ISSUE-01-BACKEND-SPEC.md, section 3)
 * and the copy shown for each. The backend's own `error` string is written for
 * logs; everything a user reads comes from the `errors` dictionary.
 *
 * The copy is looked up when a message is built — in a fetch callback or an
 * event handler, never during a render — so it comes out in the language the
 * interface is in at that moment.
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
  // Raised by the proxy, not the backend: the OAuth routes are not deployed yet.
  | "OAUTH_NOT_AVAILABLE"
  | "PROVIDER_ALREADY_LINKED"
  | "LAST_LOGIN_METHOD"
  | "WEBAUTHN_CHALLENGE_INVALID"
  | "WEBAUTHN_VERIFICATION_FAILED"
  | "CREDENTIAL_NOT_FOUND"
  | "PASSKEY_PASSWORD_REQUIRED"
  | "BILLING_DISABLED"
  | "BILLING_UNAVAILABLE"
  | "ALREADY_SUBSCRIBED"
  | "NO_BILLING_ACCOUNT"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "INTERNAL";

/**
 * Own keys only: the code can come from a query string, and "constructor"
 * must not find something on Object.prototype.
 */
function lookup<T>(table: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}

/**
 * Turns a validator reason from the `fields` map — "required", "invalid",
 * "min:12" — into something worth showing under an input.
 */
export function messageForFieldReason(field: string, reason: string): string {
  const copy = activeMessages().errors.fields;
  const [tag, param] = reason.split(":");
  const count = param ? Number.parseInt(param, 10) : Number.NaN;

  switch (tag) {
    case "required":
      return lookup(copy.required, field) ?? copy.requiredOther;
    case "invalid":
      return field === "email" ? copy.invalidEmail : copy.invalid;
    case "min":
      return Number.isFinite(count) ? copy.min(count) : copy.tooShort;
    case "max":
      return Number.isFinite(count) ? copy.max(count) : copy.tooLong;
    default:
      return copy.invalid;
  }
}

/**
 * Maps a whole `fields` map to display messages, renaming keys the form knows
 * under a different name.
 */
export function fieldMessages(
  fields: Record<string, string>,
  aliases: Record<string, string> = {},
): Record<string, string> {
  const messages: Record<string, string> = {};
  for (const [field, reason] of Object.entries(fields)) {
    messages[aliases[field] ?? field] = messageForFieldReason(field, reason);
  }
  return messages;
}

export function messageForCode(
  code: string | null | undefined,
  fallback?: string,
): string {
  const copy = activeMessages().errors;
  // Typed against the code list, so a code without copy fails the type check.
  const codes: Record<AuthErrorCode, string> = copy.codes;
  return (code ? lookup(codes, code) : undefined) ?? fallback ?? copy.fallback;
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
export async function apiErrorFromResponse(
  response: Response,
): Promise<ApiError> {
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
  const retryAfter = retryAfterHeader
    ? Number.parseInt(retryAfterHeader, 10)
    : null;

  return new ApiError({
    status: response.status,
    code,
    fields,
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : null,
    message: messageForCode(code, statusFallback(response.status)),
  });
}

function statusFallback(status: number): string {
  const copy = activeMessages().errors;
  if (status === 401) return copy.status.unauthorized;
  if (status === 403) return copy.status.forbidden;
  if (status === 404) return copy.status.notFound;
  if (status === 429) return copy.status.rateLimited;
  if (status >= 500) return copy.status.server;
  return copy.fallback;
}
