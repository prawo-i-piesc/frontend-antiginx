import type { Messages } from "@/app/i18n/messages/en";

const legal: Messages["legal"] = {
  updated: (date) => `Ostatnia aktualizacja: ${date}`,
  toFill: (what) => `do uzupełnienia: ${what}`,
  fields: {
    name: "pełna nazwa usługodawcy",
    address: "adres",
    hosting: "dostawca hostingu i kraj",
  },
  links: {
    terms: "Regulamin",
    privacy: "Polityka prywatności",
    security: "Bezpieczeństwo",
    contact: "Kontakt",
  },

  privacy: {
    title: "Polityka prywatności",
    intro: "Ta polityka wyjaśnia, jakie dane osobowe przetwarza Antiginx, w jakim celu i jakie prawa Ci przysługują.",
    sections: [
      {
        heading: "Administrator",
        body: [
          "Administratorem Twoich danych osobowych jest {name}, {address}.",
          "We wszystkich sprawach dotyczących danych napisz na {email}.",
        ],
      },
      {
        heading: "Jakie dane przetwarzamy",
        body: [
          {
            list: [
              "Konto: adres e-mail, imię i nazwisko, jeśli je podasz, oraz hasło, przechowywane wyłącznie w postaci skrótu.",
              "Logowanie przez Google lub GitHub: identyfikator konta i adres e-mail przekazane przez dostawcę, jeśli z niego korzystasz.",
              "Zabezpieczenia konta: konfiguracja aplikacji uwierzytelniającej, kody odzyskiwania i klucze dostępu.",
              "Sesje: adres IP i przeglądarka każdej zalogowanej sesji.",
              "Skany: adresy skanowanych stron i wyniki. Z kontem trafiają do Twojej historii; bez konta nie są z Tobą powiązane.",
              "Logi serwera: techniczne zapisy zapytań, które mogą zawierać adres IP.",
              "Wiadomości: treść korespondencji i Twój adres e-mail.",
            ],
          },
        ],
      },
      {
        heading: "Cele i podstawy prawne",
        body: [
          {
            list: [
              "Świadczenie usługi i prowadzenie konta na podstawie umowy zawieranej przy rejestracji (art. 6 ust. 1 lit. b RODO).",
              "Wysyłka wiadomości potrzebnych do działania usługi, np. potwierdzenia adresu albo resetu hasła (art. 6 ust. 1 lit. b RODO).",
              "Zapewnienie bezpieczeństwa kont i usługi oraz zapobieganie nadużyciom, jako nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).",
              "Odpowiadanie na wiadomości, jako nasz prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).",
              "Wypełnianie obowiązków prawnych, np. księgowych po wprowadzeniu płatnych planów (art. 6 ust. 1 lit. c RODO).",
            ],
          },
        ],
      },
      {
        heading: "Komu przekazujemy dane",
        body: [
          {
            list: [
              "Dostawcy hostingu, na którego serwerach działa usługa: {hosting}.",
              "Firmie Resend, która wysyła nasze wiadomości e-mail. Ma siedzibę w Stanach Zjednoczonych; przekazanie danych odbywa się z zabezpieczeniami przewidzianymi w rozdziale V RODO.",
              "Google lub GitHub, tylko jeśli logujesz się za ich pośrednictwem.",
            ],
          },
          "Nie sprzedajemy danych osobowych, a w serwisie nie ma reklam ani narzędzi analitycznych.",
        ],
      },
      {
        heading: "Jak długo przechowujemy dane",
        body: [
          {
            list: [
              "Dane konta: do czasu jego usunięcia. Usunięcie konta usuwa też historię skanów.",
              "Zalogowane sesje: do wylogowania, najdłużej 30 dni.",
              "Skany wykonane bez konta: przechowujemy je bez powiązania z jakąkolwiek osobą.",
              "Logi serwera: tylko tak długo, jak wymaga tego utrzymanie i zabezpieczenie usługi.",
              "Wiadomości: do załatwienia sprawy albo do przedawnienia związanych z nią roszczeń.",
            ],
          },
        ],
      },
      {
        heading: "Twoje prawa",
        body: [
          "Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia, a także do sprzeciwu wobec przetwarzania opartego na naszym prawnie uzasadnionym interesie. Imię, nazwisko i adres e-mail zmienisz, a konto usuniesz samodzielnie w ustawieniach profilu.",
          "Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.",
        ],
      },
      {
        heading: "Pliki cookie",
        body: [
          "Serwis używa wyłącznie plików cookie niezbędnych do działania:",
          {
            list: [
              "ag_session utrzymuje zalogowanie, do 30 dni.",
              "ag_oauth kończy logowanie przez Google lub GitHub, przez 10 minut.",
              "ag_locale zapamiętuje wybrany język, przez rok.",
            ],
          },
          "Wybrany motyw jest zapisywany w pamięci przeglądarki (localStorage). Nie używamy plików cookie analitycznych ani reklamowych, dlatego nie prosimy o zgodę na cookies.",
        ],
      },
      {
        heading: "Skanowane strony",
        body: [
          "Skan odczytuje to, co skanowana strona udostępnia publicznie: odpowiedź HTTP, certyfikat, rekordy DNS i dane rejestracyjne domeny. Nazwy i wersje wykrytego oprogramowania wysyła do bazy podatności NVD (NIST), aby sprawdzić znane podatności. Nie trafiają tam żadne dane o Tobie.",
        ],
      },
      {
        heading: "Zmiany polityki",
        body: [
          "Zmiany publikujemy na tej stronie, z nową datą na górze. O istotnych zmianach powiadomimy posiadaczy kont e-mailem.",
        ],
      },
    ],
  },

  terms: {
    title: "Regulamin",
    intro: "Regulamin określa zasady korzystania z Antiginx.",
    sections: [
      {
        heading: "Postanowienia ogólne",
        body: [
          "Antiginx to skaner bezpieczeństwa stron internetowych („Usługa”) świadczony drogą elektroniczną przez {name}, {address} („Usługodawca”).",
          "Z Usługodawcą skontaktujesz się pod adresem {email}.",
        ],
      },
      {
        heading: "Wymagania techniczne",
        body: [
          "Do korzystania z Usługi potrzebne jest urządzenie z dostępem do internetu i aktualna przeglądarka z włączoną obsługą JavaScriptu. Do założenia konta potrzebny jest też adres e-mail.",
        ],
      },
      {
        heading: "Zakres Usługi",
        body: [
          {
            list: [
              "Skanowanie strony bez zakładania konta.",
              "Darmowe konto z wyborem testów, historią skanów, pulpitem i wykresami.",
              "Płatne plany opisane w cenniku. Ich warunki, w tym zasady płatności i prawo odstąpienia od umowy, zostaną dodane do Regulaminu przed udostępnieniem płatnych planów.",
            ],
          },
        ],
      },
      {
        heading: "Konto",
        body: [
          {
            list: [
              "Umowa z Usługodawcą zostaje zawarta z chwilą założenia konta i akceptacji Regulaminu; rejestracja przez Google lub GitHub oznacza jego akceptację.",
              "Nie udostępniaj danych logowania innym osobom; odpowiadasz za działania wykonane z Twojego konta.",
              "Konto możesz w każdej chwili usunąć w ustawieniach profilu, co oznacza rozwiązanie umowy.",
              "Usługodawca może zawiesić lub usunąć konto naruszające Regulamin, informując o przyczynie e-mailem.",
            ],
          },
        ],
      },
      {
        heading: "Zasady korzystania ze skanera",
        body: [
          "Skanuj wyłącznie strony, do których masz prawo: własne albo te, których właściciel się na to zgodził. Nie wolno używać Usługi do:",
          {
            list: [
              "skanowania stron bez takiego prawa;",
              "atakowania, przeciążania lub zakłócania działania jakiejkolwiek strony albo samej Usługi;",
              "obchodzenia limitów lub zabezpieczeń Usługi ani masowego, zautomatyzowanego skanowania bez zgody Usługodawcy.",
            ],
          },
          "Odpowiadasz za uruchamiane przez siebie skany. Usługodawca może blokować skany naruszające te zasady.",
        ],
      },
      {
        heading: "Wyniki skanów",
        body: [
          "Wyniki opisują stronę w chwili skanu i mają charakter informacyjny. Skan nie gwarantuje, że strona jest bezpieczna, i nie zastępuje audytu bezpieczeństwa; podatność dopasowana po wersji oprogramowania to wskazówka do sprawdzenia, a nie dowód.",
        ],
      },
      {
        heading: "Odpowiedzialność",
        body: [
          "Usługodawca dba o dostępność Usługi, ale nie gwarantuje jej nieprzerwanego działania i może ją czasowo wstrzymać na potrzeby prac technicznych. W granicach dopuszczalnych przez prawo Usługodawca nie odpowiada za decyzje podjęte na podstawie wyników skanów. Regulamin nie ogranicza praw, które przysługują konsumentom na mocy bezwzględnie obowiązujących przepisów.",
        ],
      },
      {
        heading: "Reklamacje",
        body: ["Reklamacje zgłaszaj na adres {email}, opisując problem. Usługodawca odpowie w ciągu 14 dni."],
      },
      {
        heading: "Postanowienia końcowe",
        body: [
          "Usługodawca może zmienić Regulamin z ważnych przyczyn, takich jak zmiany Usługi lub przepisów. O zmianach poinformuje posiadaczy kont e-mailem co najmniej 14 dni przed ich wejściem w życie; jeśli ich nie akceptujesz, możesz usunąć konto.",
          "W sprawach nieuregulowanych stosuje się prawo polskie. Dane osobowe są przetwarzane zgodnie z polityką prywatności.",
        ],
      },
    ],
  },

  security: {
    title: "Bezpieczeństwo",
    intro: "Dla właścicieli stron skanowanych przez Antiginx i dla osób, które znalazły problem z bezpieczeństwem w samym Antiginx.",
    sections: [
      {
        heading: "Antiginx na Twojej stronie",
        body: [
          "Osoba uruchamiająca skan potwierdza, że ma prawo skanować daną domenę. Skan wysyła do strony kilka zapytań:",
          {
            list: [
              "pobiera stronę pod podanym adresem;",
              "nawiązuje połączenie TLS, aby odczytać certyfikat;",
              "pobiera plik /sitemap.xml;",
              "wysyła jeszcze jedno zapytanie, wyglądające jak zapytanie zwykłej przeglądarki, aby sprawdzić, czy przed stroną działa CDN lub ochrona przed botami.",
            ],
          },
          "Sprawdza też rekordy DNS i dane rejestracyjne domeny, co nie angażuje Twojego serwera.",
          "Większość zapytań przedstawia się nagłówkiem User-Agent AntiGinx/1.0. Sprawdzenie ochrony przed botami oraz skany w trybie omijania tej ochrony używają nagłówków zwykłej przeglądarki.",
        ],
      },
      {
        heading: "Zgłoś nadużycie",
        body: [
          "Jeśli uważasz, że ktoś skanował Twoją stronę bez prawa do tego, napisz na {email}, podając domenę i, jeśli możesz, czas skanu. Sprawdzimy zgłoszenie.",
        ],
      },
      {
        heading: "Zgłoś podatność w Antiginx",
        body: [
          "Jeśli znajdziesz problem z bezpieczeństwem w Antiginx, napisz na {email}, opisując go i podając kroki, które pozwolą go odtworzyć. Potwierdzimy otrzymanie zgłoszenia i będziemy Cię informować o postępach.",
          "Podczas testów nie sięgaj po dane innych użytkowników, nie zakłócaj działania Usługi i nie publikuj problemu przed jego naprawieniem. Nie podejmiemy kroków prawnych wobec osób, które zgłaszają problemy w dobrej wierze i przestrzegają tych zasad.",
        ],
      },
    ],
  },
};

export default legal;
