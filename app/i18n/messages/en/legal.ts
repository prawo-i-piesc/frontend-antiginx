/**
 * The legal pages: privacy policy, terms of service and security. They
 * describe what the code does (cookies, what is stored, who data goes to), so
 * keep them in step with it.
 *
 * Paragraphs may hold {name}, {address}, {email} and {hosting}, filled in from
 * app/config (OPERATOR, CONTACT_EMAIL); an empty value shows as a "to fill in"
 * mark. A block is a paragraph, or a list as `{ list: [...] }`.
 */
type Block = string | { list: string[] };
type Page = { title: string; intro: string; sections: { heading: string; body: Block[] }[] };

const privacy: Page = {
  title: "Privacy policy",
  intro: "This policy explains what personal data Antiginx processes, why, and what rights you have.",
  sections: [
    {
      heading: "Controller",
      body: ["The controller of your personal data is {name}, {address}.", "For anything about your data, write to {email}."],
    },
    {
      heading: "What data we process",
      body: [
        {
          list: [
            "Account: your e-mail address, your name if you give it, and your password, stored only as a hash.",
            "Signing in with Google or GitHub: the account identifier and e-mail address the provider passes on, if you use it.",
            "Account security: the setup of your authenticator app, your recovery codes and your passkeys.",
            "Sessions: the IP address and browser of each signed-in session.",
            "Scans: the addresses you scan and their results. With an account they go to your history; without one they are not linked to you.",
            "Server logs: technical records of requests, which may include an IP address.",
            "Messages: what you write to us, and your e-mail address.",
          ],
        },
      ],
    },
    {
      heading: "Why, and on what legal basis",
      body: [
        {
          list: [
            "To provide the service and run your account, under the agreement made when you sign up (Art. 6(1)(b) GDPR).",
            "To send the e-mails the service needs, such as confirming your address or resetting your password (Art. 6(1)(b) GDPR).",
            "To keep accounts and the service secure and to prevent abuse, as our legitimate interest (Art. 6(1)(f) GDPR).",
            "To answer your messages, as our legitimate interest (Art. 6(1)(f) GDPR).",
            "To meet legal obligations, such as accounting once there are paid plans (Art. 6(1)(c) GDPR).",
          ],
        },
      ],
    },
    {
      heading: "Who receives the data",
      body: [
        {
          list: [
            "The hosting provider the service runs on: {hosting}.",
            "Resend, which sends our e-mails. It is based in the United States; the transfer relies on the safeguards of Chapter V of the GDPR.",
            "Google or GitHub, only if you sign in with them.",
          ],
        },
        "We do not sell personal data, and the site has no advertising or analytics.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        {
          list: [
            "Account data: until you delete your account. Deleting it also deletes your scan history.",
            "Signed-in sessions: until you sign out, and 30 days at most.",
            "Scans made without an account: kept without being linked to anyone.",
            "Server logs: only as long as running and securing the service needs.",
            "Messages: until the matter is settled, or for as long as claims about it can be made.",
          ],
        },
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You can ask us for access to your data, to correct or delete it, to restrict its processing or to receive it in a portable form, and you can object to processing based on our legitimate interest. You can change your name and e-mail address, and delete your account, yourself in your profile settings.",
        "You can also complain to the supervisory authority: the President of the Personal Data Protection Office (UODO), ul. Stawki 2, 00-193 Warsaw, Poland.",
      ],
    },
    {
      heading: "Cookies",
      body: [
        "The site uses only the cookies it needs to work:",
        {
          list: [
            "ag_session keeps you signed in, for up to 30 days.",
            "ag_oauth completes signing in with Google or GitHub, for 10 minutes.",
            "ag_locale remembers the language you chose, for a year.",
          ],
        },
        "Your choice of theme is kept in your browser’s local storage. There are no analytics or advertising cookies, so the site does not ask for consent to cookies.",
      ],
    },
    {
      heading: "Sites you scan",
      body: [
        "A scan reads what the scanned site makes public: its HTTP response, certificate, DNS records and domain registration data. It sends the names and versions of the software it detects to the National Vulnerability Database (NIST) to look up known vulnerabilities. Nothing about you is sent there.",
      ],
    },
    {
      heading: "Changes",
      body: [
        "Changes to this policy are published on this page, with a new date at the top. We will tell account holders about significant changes by e-mail.",
      ],
    },
  ],
};

const terms: Page = {
  title: "Terms of service",
  intro: "These terms set out the rules for using Antiginx.",
  sections: [
    {
      heading: "General",
      body: [
        "Antiginx is a website security scanner (the “service”) provided electronically by {name}, {address} (the “provider”).",
        "You can reach the provider at {email}.",
      ],
    },
    {
      heading: "Technical requirements",
      body: [
        "To use the service you need a device with internet access and an up-to-date web browser with JavaScript enabled. An account also needs an e-mail address.",
      ],
    },
    {
      heading: "What the service offers",
      body: [
        {
          list: [
            "Scanning a website without an account.",
            "A free account, with your choice of tests, scan history, a dashboard and charts.",
            "Paid plans, as described on the pricing page. Their terms, including payment and the right of withdrawal, will be added to these terms before paid plans become available.",
          ],
        },
      ],
    },
    {
      heading: "Your account",
      body: [
        {
          list: [
            "You make an agreement with the provider when you create an account and accept these terms; signing up with Google or GitHub counts as accepting them.",
            "Keep your sign-in details to yourself; you are responsible for what is done from your account.",
            "You can delete your account at any time in your profile settings, which ends the agreement.",
            "The provider may suspend or delete an account that breaks these terms, telling you why by e-mail.",
          ],
        },
      ],
    },
    {
      heading: "Using the scanner",
      body: [
        "Scan only websites you have the right to scan: your own, or ones whose owner has allowed it. You must not use the service to:",
        {
          list: [
            "scan websites without that right;",
            "attack, overload or disrupt any website or the service itself;",
            "get around the service’s limits or security, or scan in bulk by automated means without the provider’s consent.",
          ],
        },
        "You are responsible for the scans you run. The provider may block scans that break these rules.",
      ],
    },
    {
      heading: "Scan results",
      body: [
        "Results describe a site as it was at the time of the scan and are for information. A scan does not guarantee that a site is secure and does not replace a security audit; a vulnerability matched by software version is a lead to check, not proof.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "The provider works to keep the service available but does not guarantee it runs without interruption, and may pause it for maintenance. To the extent the law allows, the provider is not liable for decisions made on the basis of scan results. Nothing in these terms limits the rights consumers have under mandatory law.",
      ],
    },
    {
      heading: "Complaints",
      body: ["Send complaints to {email}, describing the problem. The provider will reply within 14 days."],
    },
    {
      heading: "Final provisions",
      body: [
        "The provider may change these terms for valid reasons, such as changes to the service or to the law. Account holders will be told about changes by e-mail at least 14 days before they take effect, and can delete their account if they do not accept them.",
        "These terms are governed by Polish law. Personal data is processed as described in the privacy policy.",
      ],
    },
  ],
};

const security: Page = {
  title: "Security",
  intro: "For owners of websites scanned with Antiginx, and for anyone who has found a security problem in Antiginx itself.",
  sections: [
    {
      heading: "Antiginx on your website",
      body: [
        "Whoever runs a scan confirms they have the right to scan the domain. A scan sends your site a handful of requests:",
        {
          list: [
            "it fetches the page at the address given;",
            "it opens a TLS connection to read the certificate;",
            "it fetches /sitemap.xml;",
            "it sends one more request, like an ordinary browser’s, to check for a CDN or bot protection in front of the site.",
          ],
        },
        "It also looks up the domain’s DNS records and registration data, which does not involve your server.",
        "Most requests identify themselves with the User-Agent header AntiGinx/1.0. The bot protection check, and scans run in a mode that gets past bot protection, use the headers of an ordinary browser.",
      ],
    },
    {
      heading: "Report misuse",
      body: [
        "If you believe someone scanned your website without the right to, write to {email} with the domain and, if you can, the time of the scan. We will look into it.",
      ],
    },
    {
      heading: "Report a vulnerability in Antiginx",
      body: [
        "If you find a security problem in Antiginx, write to {email} with a description and the steps to reproduce it. We will confirm we have received it and keep you informed.",
        "While testing, do not access other users’ data, do not disrupt the service, and do not publish the problem before it is fixed. We will not take legal action against anyone who reports a problem in good faith and keeps to these rules.",
      ],
    },
  ],
};

const legal = {
  updated: (date: string) => `Last updated: ${date}`,
  /** Shown in place of operator details not filled in yet. */
  toFill: (what: string) => `to fill in: ${what}`,
  fields: {
    name: "provider’s full name",
    address: "postal address",
    hosting: "hosting provider and country",
  },
  links: {
    terms: "Terms of service",
    privacy: "Privacy policy",
    security: "Security",
    contact: "Contact",
  },
  privacy,
  terms,
  security,
};

export default legal;
