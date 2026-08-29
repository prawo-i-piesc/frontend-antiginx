/**
 * Password rules shared by the sign-up and reset screens, and mirrored by the
 * backend (ISSUE-01-BACKEND-SPEC.md, section 3). The backend stays the
 * authority; checking here only means the user finds out while typing.
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

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_PASSWORD_LENGTH} characters`,
    test: (password) => password.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "case",
    label: "An uppercase and a lowercase letter",
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: "digit",
    label: "A number",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "A symbol, such as ! ? # or -",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
  {
    id: "obvious",
    label: "Not a common password, your name or your email",
    test: (password, context) =>
      password.length > 0 && !isCommon(password) && !containsPersonalDetail(password, context),
  },
];

export interface PasswordRuleResult {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordEvaluation {
  results: PasswordRuleResult[];
  satisfied: boolean;
  /** How many rules still fail, for a one-line summary. */
  remaining: number;
}

export function evaluatePassword(
  password: string,
  context: PasswordContext = {},
): PasswordEvaluation {
  const results = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password, context),
  }));

  const remaining = results.filter((result) => !result.met).length;
  return { results, satisfied: remaining === 0, remaining };
}
