import type { Messages } from "@/app/i18n/messages/en";
import { pluralPl } from "@/app/i18n/plural";

const admin: Messages["admin"] = {
  noAccess: {
    title: "Brak uprawnień administratora",
    description:
      "Twoje konto nie ma już roli administratora, więc panel niczego nie wczyta. Jeśli to pomyłka, poproś o nią innego administratora.",
    back: "Przejdź do swojego pulpitu",
  },

  loadError: "Nie udało się wczytać tej listy.",
  you: "ty",

  roles: { admin: "admin", user: "użytkownik" },

  users: {
    title: "Użytkownicy",
    description: "Wszystkie konta na platformie, od najnowszych.",
    search: "Szukaj po e-mailu lub nazwie",
    caption: "Konta, od najnowszych.",
    empty: "Nie ma jeszcze żadnych kont.",
    noMatches: (query) => `Żadne konto nie pasuje do „${query}”.`,
    clearSearch: "Wyczyść wyszukiwanie",
    columns: {
      id: "ID",
      email: "E-mail",
      name: "Nazwa",
      role: "Rola",
      verification: "Adres e-mail",
      totp: "TOTP",
      created: "Utworzono",
      actions: "Akcje",
    },
    verified: "potwierdzony",
    unverified: "niepotwierdzony",
    totpOn: "wł.",
    totpOff: "wył.",
    inspect: "Szczegóły",
    inspectContext: (email) => `konta ${email}`,
  },

  scans: {
    title: "Skany",
    description: "Skany darmowe i premium razem, od najnowszych.",
    caption: "Skany, od najnowszych.",
    search: "Szukaj po adresie celu",
    ownerFilter: (owner) => `Właściciel: ${owner}`,
    clearOwner: "Usuń filtr właściciela",
    typeFilter: "Typ skanu",
    statusFilter: "Status",
    allTypes: "Wszystkie",
    allStatuses: "Wszystkie statusy",
    types: { free: "darmowy", premium: "premium" },
    empty: "Nie ma jeszcze żadnych skanów.",
    noMatches: "Żaden skan nie pasuje do tych filtrów.",
    clearFilters: "Wyczyść filtry",
    columns: {
      id: "ID",
      target: "Cel",
      type: "Typ",
      status: "Status",
      owner: "Właściciel",
      created: "Utworzono",
      actions: "Akcje",
    },
    anonymous: "anonimowy",
    ownerGone: "usunięte konto",
    openOwner: (owner) => `Szczegóły konta ${owner}`,
    inspect: "Szczegóły",
    inspectContext: (url) => `skanu ${url}`,
    delete: (url) => `Usuń skan ${url}`,
    deleteTitle: "Usunąć ten skan?",
    deleteDescription: (url) =>
      `Skan ${url} zostanie usunięty razem ze wszystkimi wynikami. Tego nie da się cofnąć.`,
    deleteConfirm: "Usuń skan",
    deleted: "Usunięto skan",
  },

  inspector: {
    title: "Szczegóły konta",
    loadError: "Nie udało się wczytać tego konta.",
    sections: {
      identity: "Tożsamość",
      security: "Logowanie i bezpieczeństwo",
      activity: "Aktywność",
      actions: "Akcje",
    },
    fields: {
      id: "ID",
      email: "E-mail",
      name: "Nazwa",
      role: "Rola",
      created: "Utworzono",
      emailVerified: "E-mail potwierdzony",
      password: "Hasło",
      passkeyMode: "Tryb passkey",
      totp: "TOTP",
      passkeys: "Passkeye",
      recoveryCodes: "Pozostałe kody odzyskiwania",
      providers: "Połączeni dostawcy",
      sessions: "Aktywne sesje",
      premiumScans: "Skany premium",
    },
    passkeyModes: { second_factor: "drugi składnik", passwordless: "bez hasła" },
    yes: "tak",
    no: "nie",
    set: "ustawione",
    notSet: "nieustawione",
    on: "wł.",
    off: "wył.",
    none: "brak",
    showScans: "pokaż",
    showScansContext: "skany premium tego konta",
    selfNote: "To Twoje własne konto. Panel go nie zmienia: zrób to w swoim profilu.",
    profileLink: "Otwórz swój profil",

    makeAdmin: "Nadaj rolę administratora",
    removeAdmin: "Odbierz rolę administratora",
    logout: "Wyloguj ze wszystkich sesji",
    delete: "Usuń konto",

    grant: {
      title: "Nadać temu kontu rolę administratora?",
      description: (email) =>
        `${email} dostanie pełny dostęp do panelu administratora: do wszystkich kont i skanów na platformie.`,
      confirm: "Nadaj rolę",
      done: (email) => `${email} jest teraz administratorem`,
    },
    revoke: {
      title: "Odebrać rolę administratora?",
      description: (email) => `${email} straci dostęp do panelu administratora przy następnym żądaniu.`,
      confirm: "Odbierz rolę",
      done: (email) => `${email} nie jest już administratorem`,
    },
    signOut: {
      title: "Wylogować to konto ze wszystkich sesji?",
      description: (email) =>
        `Wszystkie sesje ${email} zostaną unieważnione. Strona, którą ma już otwartą, działa do wygaśnięcia tokenu dostępu, najwyżej kilka minut.`,
      confirm: "Wyloguj wszędzie",
      done: (email) => `${email} wylogowano ze wszystkich sesji`,
    },
    remove: {
      title: "Usunąć to konto?",
      description: (email) =>
        `Konto ${email} zostanie usunięte razem ze skanami premium, sesjami i metodami logowania, a aktywna subskrypcja Pro zostanie anulowana. Tego nie da się cofnąć.`,
      typeToConfirm: "Wpisz adres e-mail, aby potwierdzić",
      mismatch: "To nie jest adres e-mail tego konta.",
      confirm: "Usuń konto",
      done: (email) => `Usunięto konto ${email}`,
    },
  },

  scanInspector: {
    title: "Szczegóły skanu",
    loadError: "Nie udało się wczytać tego skanu.",
    sections: { scan: "Skan", results: "Wyniki" },
    fields: {
      id: "ID",
      target: "Cel",
      type: "Typ",
      status: "Status",
      owner: "Właściciel",
      created: "Utworzono",
      started: "Rozpoczęto",
      completed: "Zakończono",
      duration: "Czas trwania",
    },
    seconds: (shown) => `${shown} s`,
    summary: (total, failed) =>
      `${total} ${pluralPl(total, "test", "testy", "testów")}, ${failed} ${pluralPl(failed, "nieudany", "nieudane", "nieudanych")}`,
    columns: { result: "Wynik", test: "Test", severity: "Ważność" },
    noResults: "Brak wyników. Skan czeka w kolejce, trwa albo przerwał się przed końcem pierwszego testu.",
  },
};

export default admin;
