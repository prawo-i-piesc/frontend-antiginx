import { pluralEn } from "@/app/i18n/plural";

/** The strength meter under a new-password field (sign-up, reset, profile). */
const password = {
  hint: (min: number) => `At least ${min} characters. A passphrase works well.`,
  strength: "Password strength:",
  levels: {
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
  },

  /** The rules that block a submission, by id from app/lib/passwordPolicy.ts. */
  required: {
    length: (min: number) => `At least ${min} characters`,
    obvious: "Too common, or contains your name or email",
  },

  /** Advice, listed in `strongerWith`. */
  suggestions: {
    case: "mixed case",
    digit: "a number",
    symbol: "a symbol",
  },
  /** `items` is already a list in this language: "mixed case, a number and a symbol". */
  strongerWith: (items: string) => `Stronger with ${items}.`,
  allGood: "Good to go.",

  /** Announced to screen readers as the password changes. */
  status: {
    met: "Password meets every requirement.",
    remaining: (count: number) =>
      pluralEn(count, "1 requirement left.", `${count} requirements left.`),
  },
};

export default password;
