import { pluralEn } from "@/app/i18n/plural";

/**
 * What a user reads when the API turns a request down (app/lib/authErrors.ts).
 * The backend's own `error` string is written for logs and never shown.
 */
const errors = {
  fallback: "Something went wrong. Try again in a moment.",

  /** By error code (ISSUE-01-BACKEND-SPEC.md, section 3). */
  codes: {
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
    OAUTH_ACCOUNT_CONFLICT:
      "That account has no password to confirm with. Sign in with the provider it already uses.",
    OAUTH_PROVIDER_ERROR: "The sign-in provider did not respond. Try again in a moment.",
    OAUTH_NOT_AVAILABLE:
      "Signing in with Google or GitHub is not available yet. Use your email and password.",
    PROVIDER_ALREADY_LINKED: "This provider account is already linked to another Antiginx account.",
    LAST_LOGIN_METHOD: "This is your only way to sign in. Add another method before removing it.",
    WEBAUTHN_CHALLENGE_INVALID: "This passkey request expired. Try again.",
    WEBAUTHN_VERIFICATION_FAILED: "That passkey could not be verified.",
    CREDENTIAL_NOT_FOUND: "We could not find that credential.",
    PASSKEY_PASSWORD_REQUIRED:
      "This account signs in with a password first, then confirms with the passkey.",
    RATE_LIMITED: "Too many attempts. Wait a moment before trying again.",
    FORBIDDEN: "You do not have access to that.",
    INTERNAL: "Something went wrong on our side. Try again in a moment.",
  },

  /** For a response without a code the table knows, by HTTP status. */
  status: {
    unauthorized: "Your session expired. Sign in again to continue.",
    forbidden: "You do not have access to that.",
    notFound: "That is not available yet.",
    rateLimited: "Too many attempts. Wait a moment before trying again.",
    server: "Something went wrong on our side. Try again in a moment.",
  },

  /** Validator reasons from the `fields` map ("required", "invalid", "min:12"), shown under the input. */
  fields: {
    /** By the backend's field name. */
    required: {
      email: "Enter your email address.",
      password: "Enter your password.",
      new_password: "Enter your password.",
      current_password: "Enter your current password.",
      full_name: "Enter your name.",
      code: "Enter your code.",
    },
    requiredOther: "This field is required.",
    invalidEmail: "That does not look like an email address.",
    invalid: "Check this value.",
    min: (count: number) =>
      pluralEn(count, "Use at least 1 character.", `Use at least ${count} characters.`),
    tooShort: "This value is too short.",
    max: (count: number) =>
      pluralEn(count, "Use at most 1 character.", `Use at most ${count} characters.`),
    tooLong: "This value is too long.",
  },
};

export default errors;
