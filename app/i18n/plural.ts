/**
 * Plural forms for the dictionaries.
 *
 * Polish has three forms for whole numbers — 1 skan, 2 skany, 5 skanów — and
 * which one applies depends on the last digits, not on "one or more", so a
 * `count === 1 ? … : …` check gets 22, 25 and 112 wrong. Intl.PluralRules
 * knows the rules for both languages.
 */

const polish = new Intl.PluralRules("pl");
const english = new Intl.PluralRules("en");

/** `one` for 1, `few` for 2–4, 22–24…, `many` for 0, 5–21, 25…; fractions take `few`. */
export function pluralPl(count: number, one: string, few: string, many: string): string {
  switch (polish.select(count)) {
    case "one":
      return one;
    case "many":
      return many;
    default:
      return few;
  }
}

export function pluralEn(count: number, one: string, other: string): string {
  return english.select(count) === "one" ? one : other;
}
