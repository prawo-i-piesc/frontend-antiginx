import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const characters = (count: number) => `${count} ${pluralPl(count, "znak", "znaki", "znaków")}`;

const password: Messages["password"] = {
  hint: (min) => `Co najmniej ${characters(min)}. Dobrze sprawdza się kilka losowych słów.`,
  strength: "Siła hasła:",
  levels: {
    weak: "Słabe",
    fair: "Średnie",
    good: "Dobre",
    strong: "Silne",
  },

  required: {
    length: (min) => `Co najmniej ${characters(min)}`,
    obvious: "Zbyt popularne albo zawiera imię, nazwisko lub adres e-mail",
  },

  suggestions: {
    case: "litery różnej wielkości",
    digit: "cyfrę",
    symbol: "symbol",
  },
  strongerWith: (items) => `Aby wzmocnić hasło, dodaj ${items}.`,
  allGood: "Wszystko w porządku.",

  status: {
    met: "Hasło spełnia wszystkie wymagania.",
    remaining: (count) =>
      pluralPl(
        count,
        `Zostało ${count} wymaganie do spełnienia.`,
        `Zostały ${count} wymagania do spełnienia.`,
        `Zostało ${count} wymagań do spełnienia.`,
      ),
  },
};

export default password;
