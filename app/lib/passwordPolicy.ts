/**
 * Password rules for the sign-up, reset and change screens.
 *
 * Only the rules the backend actually enforces (auth.ValidatePassword: at
 * least 12 characters and not on the common-password list) can block a
 * submission — rejecting a password the API would accept is a bug. The rest
 * are shown as advice, which follows current guidance: length and a blocklist
 * do the work, and composition rules mostly push people toward "Password1!".
 */

export const MIN_PASSWORD_LENGTH = 12;

/** Short list of the passwords attackers try first; the backend holds the full one. */
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd", "qwerty", "qwerty123",
  "qwertyuiop", "123456", "1234567", "12345678", "123456789", "1234567890",
  "111111", "123123", "abc123", "iloveyou", "admin", "administrator",
  "welcome", "welcome1", "letmein", "monkey", "dragon", "sunshine",
  "princess", "football", "baseball", "master", "shadow", "superman",
  "trustno1", "zaq12wsx", "qazwsx", "asdfghjkl", "zxcvbnm",
  "antiginx", "antiginx123", "haslo", "haslo123", "zaq1@WSX",
]);

export interface PasswordContext {
  name?: string;
  email?: string;
}

export interface PasswordRule {
  id: string;
  label: string;
  /** Two or three words, for listing several rules on one line. */
  short: string;
  test: (password: string, context: PasswordContext) => boolean;
}

/** "Password123!" and "password" are the same guess, so both are checked. */
function isCommon(password: string): boolean {
  const lowered = password.toLowerCase();
  const base = lowered.replace(/[^a-z]/g, "");
  return COMMON_PASSWORDS.has(lowered) || (base.length >= 4 && COMMON_PASSWORDS.has(base));
}

function containsPersonalDetail(password: string, context: PasswordContext): boolean {
  const lowered = password.toLowerCase();
  const candidates = [
    ...(context.name ?? "").split(/\s+/),
    (context.email ?? "").split("@")[0] ?? "",
  ];

  return candidates.some((candidate) => {
    const value = candidate.trim().toLowerCase();
    return value.length >= 3 && lowered.includes(value);
  });
}

/** Enforced by the backend; failing one of these blocks the form. */
export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    short: "more characters",
    test: (password) => password.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "obvious",
    label: "Too common, or contains your name or email",
    short: "something less obvious",
    test: (password, context) =>
      password.length > 0 && !isCommon(password) && !containsPersonalDetail(password, context),
  },
];

/** Advice only — these never stop a submission. */
export const PASSWORD_SUGGESTIONS: PasswordRule[] = [
  {
    id: "case",
    label: "An uppercase and a lowercase letter",
    short: "mixed case",
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: "digit",
    label: "A number",
    short: "a number",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "A symbol, such as ! ? # or -",
    short: "a symbol",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export interface PasswordRuleResult {
  id: string;
  label: string;
  short: string;
  met: boolean;
}

export interface PasswordEvaluation {
  required: PasswordRuleResult[];
  suggested: PasswordRuleResult[];
  /** True once every required rule passes; suggestions are ignored here. */
  satisfied: boolean;
  /** How many required rules still fail, for a one-line summary. */
  remaining: number;
}

export function evaluatePassword(
  password: string,
  context: PasswordContext = {},
): PasswordEvaluation {
  const evaluate = (rules: PasswordRule[]) =>
    rules.map((rule) => ({
      id: rule.id,
      label: rule.label,
      short: rule.short,
      met: rule.test(password, context),
    }));

  const required = evaluate(PASSWORD_RULES);
  const remaining = required.filter((result) => !result.met).length;

  return {
    required,
    suggested: evaluate(PASSWORD_SUGGESTIONS),
    satisfied: remaining === 0,
    remaining,
  };
}
