import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const characters = (count: number) => `${count} ${pluralPl(count, "znak", "znaki", "znaków")}`;

const profile: Messages["profile"] = {
  page: {
    description: "Zarządzaj danymi osobowymi i bezpieczeństwem konta",
  },

  fields: {
    password: "Hasło",
    totp: "Sześciocyfrowy kod",
    recoveryCode: "Kod odzyskiwania",
  },

  preferences: {
    title: "Preferencje",
    description: "Wybierz język aplikacji.",
    language: "Język interfejsu",
    languageHint: "Zapisany w tej przeglądarce.",
    changed: "Język interfejsu: polski",
  },

  details: {
    title: "Profil",
    description: "Podstawowe dane konta.",

    username: {
      title: "Nazwa użytkownika",
      changeContext: "nazwę użytkownika",
      cancelContext: "zmianę nazwy użytkownika",
      field: "Nowa nazwa użytkownika",
      hint: (min) => `Co najmniej ${characters(min)}.`,
      tooShort: (min) => `Wpisz co najmniej ${characters(min)}.`,
      save: "Zapisz nazwę użytkownika",
      saved: "Zmieniono nazwę użytkownika",
    },

    email: {
      title: "Adres e-mail",
      changeContext: "adres e-mail",
      cancelContext: "zmianę adresu e-mail",
      field: "Nowy adres e-mail",
      hint: "Tego adresu używasz do logowania.",
      invalid: "To nie wygląda na adres e-mail.",
      save: "Zapisz adres e-mail",
      saved: "Zmieniono adres e-mail",
    },

    unconfirmed: {
      title: "Adres niepotwierdzony",
      detail: "Bez potwierdzenia nie wyślemy wiadomości o koncie – także linku do zresetowania hasła.",
      send: "Wyślij potwierdzenie",
      sent: "Wysłano potwierdzenie",
      checkAddress: (email) => `Sprawdź skrzynkę ${email}.`,
      checkInbox: "Sprawdź skrzynkę odbiorczą.",
    },
  },

  plan: {
    title: "Plan",
    description: "Subskrypcja i płatności.",
    names: { free: "Free", pro: "Pro" },
    freeDetail: "Korzystasz z darmowego planu.",
    active: "Subskrypcja Pro jest aktywna.",
    renews: (date) => `Odnawia się ${date}.`,
    endsOn: (date) => `Anulowana. Pro działa do ${date}.`,
    pastDue: "Ostatnia płatność nie przeszła. Zaktualizuj kartę, żeby zachować Pro.",
    unpaid: "Subskrypcja jest nieopłacona. Opłać zaległą fakturę, żeby odzyskać Pro.",
    paused: "Subskrypcja jest wstrzymana.",
    ended: "Subskrypcja Pro wygasła.",
    unavailable: "Płatności nie są dostępne na tym serwerze.",
    loadError: "Nie udało się wczytać planu. Odśwież stronę, żeby spróbować ponownie.",
    upgrade: "Przejdź na Pro",
    manage: "Zarządzaj subskrypcją",
    comparePlans: "Porównaj plany",
    manageHint: "Anulowanie, zmianę karty i faktury obsługuje Stripe.",
    welcome: "Witaj w Pro",
    welcomeHint: "Subskrypcja jest aktywna.",
    processing: "Płatność wysłana",
    processingHint: "Pro włączy się, gdy tylko Stripe potwierdzi płatność.",
    cancelled: "Płatność anulowana",
    cancelledHint: "Nic nie zostało pobrane.",
  },

  connected: {
    title: "Połączone konta",
    description: "Loguj się za pomocą konta, które już masz, zamiast hasła.",
    methods: "Sposoby logowania:",
    password: "Hasło",
    noMethods: "brak",
    unavailable: "Jeszcze niedostępne.",
    linked: "Połączone. Możesz się nim logować.",
    onlyWayIn: "Połączone – na razie to jedyny sposób logowania. Dodaj inny, zanim odłączysz to konto.",
    notLinked: "Niepołączone.",
    connect: "Połącz",
    disconnect: "Odłącz",
    disconnected: (provider) => `Odłączono konto ${provider}`,
  },

  password: {
    title: "Hasło",
    description: "Dzięki niemu wiemy, że to ty.",
    rowTitle: "Hasło",
    hidden: "Ustawione",
    changeContext: "hasło",
    cancelContext: "zmianę hasła",
    current: "Obecne hasło",
    next: "Nowe hasło",
    confirm: "Powtórz nowe hasło",
    currentRequired: "Wpisz obecne hasło.",
    mismatch: "Hasła muszą być takie same.",
    submit: "Zmień hasło",
    updated: "Zmieniono hasło",
    updatedHint: "Użyj go przy następnym logowaniu.",
  },

  twoFactor: {
    title: "Uwierzytelnianie dwuskładnikowe",
    description: "Drugi krok przy logowaniu albo klucz dostępu zamiast hasła.",
    on: "Włączone",
    off: "Wyłączone",

    app: {
      title: "Aplikacja uwierzytelniająca",
      detail: "Kody generuje aplikacja w telefonie.",
      turnOff: "Wyłącz",
      turnOffContext: "aplikację uwierzytelniającą",
    },

    notSetUp: {
      title: "Nie skonfigurowano",
      detail: "Każdy, kto zna hasło, może zalogować się na to konto.",
      setUp: "Skonfiguruj",
      setUpContext: "uwierzytelnianie dwuskładnikowe",
    },

    codes: {
      title: "Kody odzyskiwania",
      noneLeft: "Nie został żaden – wygeneruj nowe, aby nie stracić dostępu do konta.",
      left: (left, total) =>
        `${pluralPl(left, "Został", "Zostały", "Zostało")} ${left} z ${total} ${pluralPl(total, "kodu", "kodów", "kodów")}.`,
      runningLow: (left, total) =>
        `${pluralPl(left, "Został", "Zostały", "Zostało")} ${left} z ${total} ${pluralPl(total, "kodu", "kodów", "kodów")} – kończą się.`,
      regenerate: "Nowe kody",
      regenerateContext: "odzyskiwania",
    },

    enroll: {
      title: "Włącz uwierzytelnianie dwuskładnikowe",
      description: "Aby zacząć, potwierdź hasło.",
    },

    verify: {
      title: "Zeskanuj kod",
      description: "Dodaj klucz do aplikacji uwierzytelniającej i wpisz kod, który pokaże.",
      qr: "Kod QR z kluczem dla aplikacji uwierzytelniającej. Jeśli nie możesz go zeskanować, wpisz klucz ręcznie.",
      manualKey: "Nie możesz zeskanować? Wpisz ten klucz",
      copyKey: "Kopiuj klucz",
      keyCopied: "Skopiowano klucz",
      keyCopyFailed: "Nie udało się skopiować. Zaznacz klucz i skopiuj go ręcznie.",
      turnOn: "Włącz",
    },

    recovery: {
      title: "Kody odzyskiwania",
      description: "Wyświetlane tylko raz. Każdy kod działa jednorazowo.",
      warning:
        "Zapisz je teraz w bezpiecznym miejscu. Dzięki nim odzyskasz dostęp, jeśli stracisz aplikację uwierzytelniającą – i widzisz je tylko ten jeden raz.",
      list: "Kody odzyskiwania",
      copyAll: "Kopiuj wszystkie",
      copyAllContext: "kody",
      copied: "Skopiowano kody odzyskiwania",
      copyFailed: "Nie udało się skopiować. Zaznacz kody i skopiuj je ręcznie.",
      saved: "Mam je zapisane",
    },

    disable: {
      title: "Wyłącz uwierzytelnianie dwuskładnikowe",
      description: "Konto będzie chronione tylko hasłem.",
      submit: "Wyłącz",
    },

    regenerate: {
      title: "Nowe kody odzyskiwania",
      description: "Obecne kody przestaną działać.",
      submit: "Wygeneruj",
    },

    turnedOn: "Włączono uwierzytelnianie dwuskładnikowe",
    reloadFailed: "Zapisano. Jeśli karta nadal pokazuje „Wyłączone”, odśwież stronę.",
    turnedOff: "Wyłączono uwierzytelnianie dwuskładnikowe",
    regenerated: "Wygenerowano nowe kody odzyskiwania",
  },

  passkeys: {
    title: "Klucze dostępu",
    unsupported: "Ta przeglądarka nie obsługuje kluczy dostępu.",
    pitch: "Loguj się za pomocą Face ID, Touch ID lub klucza sprzętowego zamiast hasła.",
    count: (count) => `Masz ${count} ${pluralPl(count, "klucz", "klucze", "kluczy")}.`,
    manage: "Zarządzaj",
    manageContext: "kluczami dostępu",
    add: "Dodaj klucz dostępu",

    dialog: {
      title: "Klucze dostępu",
      description: "Każdy jest powiązany z urządzeniem lub menedżerem haseł.",
    },
    passwordlessOnly: "To konto nie ma hasła, więc do zalogowania wystarczy klucz dostępu.",

    mode: {
      legend: "Sposób logowania",
      secondFactor: {
        title: "Hasło, potem klucz dostępu",
        detail: "Potrzebne jest jedno i drugie. Po utracie urządzenia nadal masz hasło.",
        changed: "Klucz dostępu jest teraz drugim krokiem po haśle",
      },
      passwordless: {
        title: "Tylko klucz dostępu",
        detail: "Logowanie bez hasła. Utrata wszystkich kluczy dostępu oznacza utratę konta.",
        changed: "Do zalogowania wystarczy teraz klucz dostępu",
      },
    },

    list: "Zapisane klucze",
    empty: "Nie masz jeszcze kluczy dostępu.",
    usage: (added, lastUsed) =>
      `Dodano ${added} · ${lastUsed ? `ostatnio użyto ${lastUsed}` : "jeszcze nieużywany"}`,
    remove: (name) => `Usuń klucz dostępu: ${name}`,
    removed: (name) => `Usunięto klucz dostępu „${name}”`,

    addNew: "Dodaj nowy klucz dostępu",
    name: "Nazwa klucza dostępu",
    nameHint: "Coś, po czym go później rozpoznasz, np. urządzenie, na którym jest zapisany.",
    create: "Utwórz klucz dostępu",
    waiting: "Oczekiwanie na urządzenie…",
    added: "Dodano klucz dostępu",

    dismissed: "Okno klucza dostępu zostało zamknięte. Spróbuj ponownie, kiedy zechcesz.",
    notCreated: "Nie utworzono klucza dostępu.",
    deviceFailed: "To urządzenie nie może tu utworzyć klucza dostępu.",

    deviceNames: {
      fallback: "Klucz dostępu",
      android: "Telefon z Androidem",
      windows: "Komputer z Windows",
    },
  },

  deleteAccount: {
    title: "Usuń konto",
    description: "Usuwa konto i wszystko, co na nim przeskanowano.",
    rowTitle: "Tego nie można cofnąć",
    rowDetail: "Razem z kontem znikną skany, ich wyniki i wszystkie metody logowania.",
    open: "Usuń konto",

    dialog: {
      title: "Usuń konto",
      phraseStep: "Przeczytaj, zanim potwierdzisz.",
      passwordStep: "Potwierdź, że to ty.",
      secondFactorStep: "Jeszcze jeden krok.",
    },
    warning:
      "Usunięcie konta skasuje skany i ich wyniki, kody odzyskiwania oraz wszystkie połączone konta. Niczego nie da się potem przywrócić.",
    endsSubscription: "Subskrypcja Pro skończy się od razu i nie pobierzemy już kolejnych opłat.",
    typePhrase: "Aby potwierdzić, wpisz",
    phrase: "Chcę usunąć moje konto",
    confirmation: "Potwierdzenie",
    passwordRequired: "Wpisz hasło.",
    totpRequired: "Wpisz sześć cyfr z aplikacji.",
    recoveryRequired: "Wpisz jeden z kodów odzyskiwania.",
    submit: "Usuń trwale",
    useRecoveryCode: "Użyj kodu odzyskiwania",
    useApp: "Użyj aplikacji uwierzytelniającej",
    deleted: "Usunięto konto",
    deletedHint: "Wszystkie powiązane z nim dane zostały usunięte.",
  },
};

export default profile;
