import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const auth: Messages["auth"] = {
  fields: {
    email: "Adres e-mail",
    emailPlaceholder: "ty@example.com",
    password: "Hasło",
    showPassword: "Pokaż hasło",
    newPasswordPlaceholder: "Wymyśl silne hasło",
    passwordsMismatch: "Hasła muszą być takie same.",
    totpCode: "Sześciocyfrowy kod",
    totpRequired: "Wpisz sześć cyfr z aplikacji.",
    recoveryCode: "Kod odzyskiwania",
    recoveryCodeHint: "Każdy kod odzyskiwania działa tylko raz.",
    recoveryCodeRequired: "Wpisz jeden z kodów odzyskiwania.",
    useRecoveryCode: "Użyj kodu odzyskiwania",
    useAuthenticator: "Użyj aplikacji uwierzytelniającej",
  },

  backToSignIn: "Wróć do logowania",
  signedIn: "Zalogowano",
  welcomeBack: (name) => `Witaj ponownie, ${name}.`,
  continueWith: (provider) => `Kontynuuj z ${provider}`,

  login: {
    title: "Zaloguj się do Antiginx",
    subtitle: "Witaj ponownie. Wpisz dane, aby kontynuować.",
    passwordPlaceholder: "Wpisz hasło",
    forgotPassword: "Nie pamiętasz hasła?",
    submit: "Zaloguj się",
    submitting: "Logowanie…",
    passkey: "Zaloguj się kluczem dostępu",
    passkeyUnavailable: "To urządzenie nie udostępniło tu klucza dostępu.",
    noAccount: "Nie masz konta?",
    signUp: "Zarejestruj się",
  },

  register: {
    title: "Załóż konto",
    subtitle: "Zacznij skanować swoje strony w kilka minut.",
    name: "Imię i nazwisko",
    namePlaceholder: "Jan Kowalski",
    confirmPassword: "Powtórz hasło",
    confirmPlaceholder: "Wpisz hasło jeszcze raz",
    terms: { before: "Akceptuję ", terms: "regulamin", middle: " i ", privacy: "politykę prywatności", after: "." },
    oauthTerms: { before: "Rejestrując się przez Google lub GitHub, akceptujesz ", terms: "regulamin", middle: " i ", privacy: "politykę prywatności", after: "." },
    termsRequired: "Zaakceptuj regulamin, aby założyć konto.",
    submit: "Załóż konto",
    submitting: "Zakładanie konta…",
    created: "Konto założone",
    confirmToFinish: "Potwierdź adres e-mail, aby dokończyć.",
    signInToContinue: "Zaloguj się, aby kontynuować.",
    haveAccount: "Masz już konto?",
    signIn: "Zaloguj się",
  },

  mfa: {
    title: "Weryfikacja dwuetapowa",
    passkeyPrompt: "Potwierdź logowanie kluczem dostępu na tym urządzeniu.",
    totpPrompt: "Wpisz kod z aplikacji uwierzytelniającej.",
    recoveryPrompt: "Wpisz jeden z zapisanych kodów odzyskiwania.",
    passkey: "Potwierdź kluczem dostępu",
    submit: "Zweryfikuj i zaloguj się",
    submitting: "Weryfikowanie…",
    noPasskeyUsed: "Nie użyto klucza dostępu.",
    deviceFailed: "Nie udało się potwierdzić na tym urządzeniu. Wybierz inny sposób.",
  },

  link: {
    title: (provider) => `Połącz ${provider} z kontem`,
    accountExists: (email) => `Adres ${email} jest już przypisany do konta.`,
    passwordPrompt: (email) =>
      `Adres ${email} jest już przypisany do konta. Podaj jego hasło, aby je połączyć.`,
    codePrompt: "Jeszcze jeden krok – kod z aplikacji uwierzytelniającej.",
    noPassword: (provider) =>
      `To konto nie ma hasła, którym można by je potwierdzić. Zaloguj się tak jak zwykle, a potem połącz ${provider} w profilu.`,
    passwordPlaceholder: "Hasło do tego konta",
    confirm: "Potwierdź i połącz",
    verify: "Zweryfikuj i połącz",
    connecting: "Łączenie…",
    connected: (provider) => `Połączono konto ${provider}`,
    connectedDetail: "Od teraz możesz się nim logować.",
    expired: "Ta próba logowania wygasła. Zacznij od nowa.",
    cancel: "Anuluj i zaloguj się normalnie",
  },

  forgotPassword: {
    title: "Zresetuj hasło",
    subtitle: "Podaj adres e-mail, a wyślemy ci link do zresetowania hasła.",
    emailRequired: "Wpisz adres e-mail podany przy rejestracji.",
    submit: "Wyślij link",
    submitting: "Wysyłanie…",
    sentTitle: "Sprawdź skrzynkę",
    sentSubtitle: "Jeśli konto z tym adresem istnieje, link do zresetowania hasła jest już w drodze.",
    sentTo: {
      before: "Wysłaliśmy link na adres ",
      after: ". Będzie ważny przez 30 minut.",
    },
    retry: {
      before: "Nic nie dotarło? Sprawdź folder ze spamem, a potem ",
      action: "spróbuj innego adresu",
      after: ".",
    },
  },

  resetPassword: {
    incompleteTitle: "Ten link jest niekompletny",
    incompleteSubtitle: "W linku do zresetowania hasła brakuje tokenu. Poproś o nowy, aby kontynuować.",
    requestNew: "Poproś o nowy link",
    expiryNote: "Linki do zresetowania hasła wygasają po 30 minutach i działają tylko raz.",
    title: "Ustaw nowe hasło",
    subtitle: "Na pozostałych urządzeniach trzeba będzie zalogować się ponownie.",
    newPassword: "Nowe hasło",
    confirmPassword: "Powtórz nowe hasło",
    confirmPlaceholder: "Wpisz nowe hasło jeszcze raz",
    submit: "Zmień hasło",
    submitting: "Zapisywanie…",
    updated: "Hasło zmienione",
    updatedDetail: "Zaloguj się nowym hasłem.",
  },

  verifyEmail: {
    missingToken: "W tym linku brakuje tokenu.",
    workingTitle: "Potwierdzanie adresu",
    workingSubtitle: "To potrwa chwilę.",
    working: "Sprawdzanie linku…",
    doneTitle: "Adres potwierdzony",
    doneSubtitle: "Adres e-mail został zweryfikowany.",
    doneDetail:
      "Gdy zalogujesz się przez dostawcę z tym adresem, trafisz od razu do tego konta – bez podawania hasła.",
    toDashboard: "Przejdź do pulpitu",
    failedTitle: "Ten link nie zadziałał",
    failedSubtitle: "Linki potwierdzające wygasają i działają tylko raz.",
    sendNew: "Wyślij nowy link z profilu",
  },

  confirmEmail: {
    title: "Potwierdź adres e-mail",
    subtitle: (email) => `Wysłaliśmy link na adres ${email}.`,
    detail:
      "Otwórz go i gotowe. Link jest ważny przez ograniczony czas, a potwierdzony adres pozwoli nam się z tobą skontaktować, gdyby trzeba było zresetować hasło.",
    recheck: "Sprawdź potwierdzenie",
    checking: "Sprawdzanie…",
    resend: "Wyślij link ponownie",
    sending: "Wysyłanie…",
    signOut: "Wyloguj się",
    sent: "Wysłano link potwierdzający",
    sentDetail: (email) => `Sprawdź skrzynkę ${email}.`,
    confirmed: "Adres potwierdzony",
    stillWaiting: "Wciąż czekamy na potwierdzenie.",
    stillWaitingDetail: "Otwórz link, który wysłaliśmy, albo wyślij nowy.",
  },

  welcome: {
    title: "Prawie gotowe",
    subtitle: "Wybierz nazwę wyświetlaną w aplikacji. Możesz ją później zmienić.",
    name: "Nazwa wyświetlana",
    nameHint: (min) => `Co najmniej ${min} ${pluralPl(min, "znak", "znaki", "znaków")}.`,
    submitting: "Zapisywanie…",
    saved: "Witaj w Antiginx",
    keep: (name) => `Zostaw „${name}” i przejdź dalej`,
  },
};

export default auth;
