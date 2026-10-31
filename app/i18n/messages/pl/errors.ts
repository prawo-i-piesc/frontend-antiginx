import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const errors: Messages["errors"] = {
  fallback: "Coś poszło nie tak. Spróbuj ponownie za chwilę.",

  codes: {
    VALIDATION_FAILED: "Niektóre pola wymagają poprawy. Sprawdź zaznaczone i spróbuj ponownie.",
    EMAIL_TAKEN: "Konto z tym adresem e-mail już istnieje. Może chcesz się zalogować?",
    INVALID_CREDENTIALS: "Nieprawidłowy adres e-mail lub hasło.",
    ACCOUNT_LOCKED: "Zbyt wiele nieudanych prób. Konto jest zablokowane na kilka minut.",
    MFA_INVALID_CODE: "Ten kod jest nieprawidłowy. Sprawdź aplikację uwierzytelniającą i spróbuj ponownie.",
    MFA_TOKEN_EXPIRED: "Czas na weryfikację minął. Zaloguj się ponownie, aby dostać nowy kod.",
    MFA_ALREADY_ENABLED: "Uwierzytelnianie dwuskładnikowe jest już włączone na tym koncie.",
    MFA_NOT_ENABLED: "Uwierzytelnianie dwuskładnikowe nie jest włączone na tym koncie.",
    RECOVERY_CODE_INVALID: "Ten kod odzyskiwania jest nieprawidłowy albo został już użyty.",
    STEP_UP_REQUIRED: "Potwierdź hasło, aby kontynuować.",
    SESSION_EXPIRED: "Sesja wygasła. Zaloguj się ponownie, aby kontynuować.",
    SESSION_REUSE_DETECTED: "Wylogowaliśmy cię ze względów bezpieczeństwa. Zaloguj się ponownie.",
    TOKEN_INVALID: "Ten link do zresetowania hasła jest nieprawidłowy. Poproś o nowy.",
    TOKEN_EXPIRED: "Ten link do zresetowania hasła wygasł. Poproś o nowy.",
    PASSWORD_TOO_WEAK: "Wybierz silniejsze hasło – co najmniej 12 znaków i nie z listy popularnych.",
    PASSWORD_SAME_AS_OLD: "Nowe hasło musi się różnić od obecnego.",
    OAUTH_STATE_INVALID: "Nie udało się zweryfikować tej próby logowania. Zacznij od nowa.",
    OAUTH_EMAIL_UNVERIFIED: "Dostawca nie zweryfikował tego adresu e-mail. Najpierw potwierdź go u dostawcy.",
    OAUTH_ACCOUNT_CONFLICT:
      "To konto nie ma hasła, którym można by je potwierdzić. Zaloguj się przez dostawcę, którego już używa.",
    OAUTH_PROVIDER_ERROR: "Dostawca logowania nie odpowiada. Spróbuj ponownie za chwilę.",
    OAUTH_NOT_AVAILABLE:
      "Logowanie przez Google lub GitHub nie jest jeszcze dostępne. Użyj adresu e-mail i hasła.",
    PROVIDER_ALREADY_LINKED: "To konto dostawcy jest już połączone z innym kontem Antiginx.",
    LAST_LOGIN_METHOD: "To jedyny sposób logowania na tym koncie. Zanim go usuniesz, dodaj inny.",
    WEBAUTHN_CHALLENGE_INVALID: "To żądanie klucza dostępu wygasło. Spróbuj ponownie.",
    WEBAUTHN_VERIFICATION_FAILED: "Nie udało się zweryfikować klucza dostępu.",
    CREDENTIAL_NOT_FOUND: "Nie znaleźliśmy tego klucza dostępu.",
    PASSKEY_PASSWORD_REQUIRED:
      "Na tym koncie najpierw logujesz się hasłem, a potem potwierdzasz kluczem dostępu.",
    BILLING_DISABLED: "Płatności nie są jeszcze dostępne.",
    BILLING_UNAVAILABLE: "Nie udało się połączyć z operatorem płatności. Spróbuj ponownie za chwilę.",
    ALREADY_SUBSCRIBED: "Masz już aktywny plan Pro.",
    NO_BILLING_ACCOUNT: "Na tym koncie nie było jeszcze żadnych płatności.",
    USER_NOT_FOUND: "To konto już nie istnieje.",
    SCAN_NOT_FOUND: "Ten skan już nie istnieje.",
    ADMIN_SELF_ACTION:
      "Własnej roli ani konta nie zmienisz w panelu administratora. Zrób to w swoim profilu.",
    LAST_ADMIN: "To ostatni administrator. Najpierw nadaj tę rolę komuś innemu.",
    RATE_LIMITED: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.",
    FORBIDDEN: "Nie masz do tego dostępu.",
    INTERNAL: "Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę.",
  },

  status: {
    unauthorized: "Sesja wygasła. Zaloguj się ponownie, aby kontynuować.",
    forbidden: "Nie masz do tego dostępu.",
    notFound: "Ta funkcja nie jest jeszcze dostępna.",
    rateLimited: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.",
    server: "Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę.",
  },

  fields: {
    required: {
      email: "Wpisz adres e-mail.",
      password: "Wpisz hasło.",
      new_password: "Wpisz hasło.",
      current_password: "Wpisz obecne hasło.",
      full_name: "Wpisz imię i nazwisko.",
      code: "Wpisz kod.",
    },
    requiredOther: "To pole jest wymagane.",
    invalidEmail: "To nie wygląda na adres e-mail.",
    invalid: "Sprawdź tę wartość.",
    min: (count) => `Wpisz co najmniej ${count} ${pluralPl(count, "znak", "znaki", "znaków")}.`,
    tooShort: "Ta wartość jest za krótka.",
    max: (count) => `Wpisz najwyżej ${count} ${pluralPl(count, "znak", "znaki", "znaków")}.`,
    tooLong: "Ta wartość jest za długa.",
  },
};

export default errors;
