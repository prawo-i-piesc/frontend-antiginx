import { pluralEn } from "@/app/i18n/plural";

/** The profile page: account details, plan, sign-in methods, password, two-factor, passkeys, deletion. */
const profile = {
  page: {
    description: "Manage your personal information and account security",
  },

  /** Fields the confirmation steps of several dialogs share. */
  fields: {
    password: "Your password",
    totp: "Six-digit code",
    recoveryCode: "Recovery code",
  },

  preferences: {
    title: "Preferences",
    description: "Choose the language the app uses.",
    language: "Interface language",
    languageHint: "Saved in this browser.",
    /** Shown in the language just picked, so it reads naturally after the switch. */
    changed: "Interface language: English",
  },

  details: {
    title: "Profile",
    description: "Who you are inside the app.",

    username: {
      title: "Username",
      // "…Context" strings are read after a button's visible label, for a
      // screen reader listing buttons out of context: "Change username".
      changeContext: "username",
      cancelContext: "username change",
      field: "New username",
      hint: (min: number) => `At least ${min} ${pluralEn(min, "character", "characters")}.`,
      tooShort: (min: number) => `Use at least ${min} ${pluralEn(min, "character", "characters")}.`,
      save: "Save username",
      saved: "Username updated",
    },

    email: {
      title: "Email address",
      changeContext: "email address",
      cancelContext: "email address change",
      field: "New email",
      hint: "You sign in with this address.",
      invalid: "That does not look like an email address.",
      save: "Save email",
      saved: "Email updated",
    },

    unconfirmed: {
      title: "Address not confirmed",
      detail: "Until it is, we cannot reach you about your account — including a password reset.",
      send: "Send confirmation",
      sent: "Confirmation sent",
      checkAddress: (email: string) => `Check ${email}.`,
      checkInbox: "Check your inbox.",
    },
  },

  plan: {
    title: "Plan",
    description: "Your subscription and payments.",
    names: { free: "Free", pro: "Pro" },
    freeDetail: "You are on the free plan.",
    active: "Your Pro subscription is active.",
    renews: (date: string) => `Renews on ${date}.`,
    endsOn: (date: string) => `Cancelled. Pro stays on until ${date}.`,
    pastDue: "The last payment did not go through. Update your card to keep Pro.",
    unpaid: "The subscription is unpaid. Pay the open invoice to get Pro back.",
    paused: "The subscription is paused.",
    ended: "Your Pro subscription has ended.",
    unavailable: "Payments are not available on this server.",
    loadError: "Could not load your plan. Reload the page to try again.",
    upgrade: "Upgrade to Pro",
    manage: "Manage subscription",
    manageHint: "Cancelling, changing your card and invoices are handled on Stripe.",
    welcome: "Welcome to Pro",
    welcomeHint: "Your subscription is active.",
    processing: "Payment sent",
    processingHint: "Pro turns on as soon as Stripe confirms the payment.",
    cancelled: "Payment cancelled",
    cancelledHint: "Nothing was charged.",
  },

  connected: {
    title: "Connected accounts",
    description: "Sign in with an account you already have, instead of a password.",
    methods: "You can sign in with:",
    password: "Password",
    noMethods: "nothing yet",
    unavailable: "Not available yet.",
    linked: "Connected. You can sign in with it.",
    onlyWayIn: "Connected — and currently your only way to sign in. Add another before disconnecting it.",
    notLinked: "Not connected.",
    connect: "Connect",
    disconnect: "Disconnect",
    disconnected: (provider: string) => `${provider} disconnected`,
  },

  password: {
    title: "Password",
    description: "How you prove it is you.",
    rowTitle: "Password",
    /** Read instead of the row of dots that stands in for the password. */
    hidden: "Set",
    changeContext: "password",
    cancelContext: "password change",
    current: "Current password",
    next: "New password",
    confirm: "Confirm new password",
    currentRequired: "Enter your current password.",
    mismatch: "Both passwords have to match.",
    submit: "Update password",
    updated: "Password updated",
    updatedHint: "Use it the next time you sign in.",
  },

  twoFactor: {
    title: "Two-factor authentication",
    description: "A second step at sign-in, or a passkey instead of a password.",
    on: "On",
    off: "Off",

    app: {
      title: "Authenticator app",
      detail: "Codes come from the app on your phone.",
      turnOff: "Turn off",
      turnOffContext: "authenticator app",
    },

    notSetUp: {
      title: "Not set up",
      detail: "Anyone with your password can sign in as you.",
      setUp: "Set up",
      setUpContext: "two-factor authentication",
    },

    codes: {
      title: "Recovery codes",
      noneLeft: "None left — generate a new set to keep a way back in.",
      left: (left: number, total: number) => `${left} of ${total} unused.`,
      runningLow: (left: number, total: number) => `${left} of ${total} unused — running low.`,
      regenerate: "New codes",
      regenerateContext: "for account recovery",
    },

    enroll: {
      title: "Set up two-factor authentication",
      description: "Confirm your password to begin.",
    },

    verify: {
      title: "Scan the code",
      description: "Add the key to your authenticator app, then enter the code it shows.",
      qr: "QR code with the key for your authenticator app. If you cannot scan it, type the key in by hand.",
      manualKey: "Cannot scan? Enter this key",
      copyKey: "Copy key",
      keyCopied: "Key copied",
      keyCopyFailed: "Copying failed. Select the key and copy it manually.",
      turnOn: "Turn on",
    },

    recovery: {
      title: "Your recovery codes",
      description: "Shown once. Each one signs you in a single time.",
      warning:
        "Save these somewhere safe now. They are your way back in if you lose your authenticator app, and this is the only time they are shown.",
      list: "Recovery codes",
      copyAll: "Copy all",
      copyAllContext: "codes",
      copied: "Recovery codes copied",
      copyFailed: "Copying failed. Select the codes and copy them manually.",
      saved: "I saved them",
    },

    disable: {
      title: "Turn off two-factor authentication",
      description: "Your account will be protected by its password alone.",
      submit: "Turn off",
    },

    regenerate: {
      title: "New recovery codes",
      description: "The codes you have now stop working.",
      submit: "Generate",
    },

    turnedOn: "Two-factor authentication is on",
    reloadFailed: "Saved. Refresh the page if the card still shows it as off.",
    turnedOff: "Two-factor authentication is off",
    regenerated: "New recovery codes generated",
  },

  passkeys: {
    title: "Passkeys",
    unsupported: "This browser cannot use passkeys.",
    pitch: "Sign in with Face ID, Touch ID or a security key instead of a password.",
    count: (count: number) => `${count} saved.`,
    manage: "Manage",
    manageContext: "passkeys",
    add: "Add passkey",

    dialog: {
      title: "Passkeys",
      description: "Each one is tied to a device or a password manager.",
    },
    passwordlessOnly: "This account has no password, so a passkey signs you in on its own.",

    mode: {
      legend: "How signing in works",
      secondFactor: {
        title: "Password, then passkey",
        detail: "Both are needed. Losing the device still leaves your password.",
        changed: "Passkeys now confirm your password",
      },
      passwordless: {
        title: "Passkey only",
        detail: "No password at sign-in. Lose every passkey and you lose the account.",
        changed: "Passkeys now sign you in on their own",
      },
    },

    list: "Your passkeys",
    empty: "No passkeys yet.",
    usage: (added: string, lastUsed: string | null) =>
      `Added ${added} · ${lastUsed ? `last used ${lastUsed}` : "never used"}`,
    remove: (name: string) => `Remove passkey: ${name}`,
    removed: (name: string) => `${name} removed`,

    addNew: "Add new passkey",
    name: "Name this passkey",
    nameHint: "Something you will recognise later, like the device it lives on.",
    create: "Create passkey",
    waiting: "Waiting for your device…",
    added: "Passkey added",

    dismissed: "The prompt was dismissed. Try again when you are ready.",
    notCreated: "No passkey was created.",
    deviceFailed: "Your device could not create a passkey here.",

    /** Suggested names for a new passkey; "iPhone" and "Mac" are product names and need none. */
    deviceNames: {
      fallback: "Passkey",
      android: "Android phone",
      windows: "Windows PC",
    },
  },

  deleteAccount: {
    title: "Delete account",
    description: "Removes the account and everything scanned under it.",
    rowTitle: "This cannot be undone",
    rowDetail: "Your scans, their results and every sign-in method go with the account.",
    open: "Delete account",

    dialog: {
      title: "Delete your account",
      phraseStep: "Read this before confirming.",
      passwordStep: "Confirm it is you.",
      secondFactorStep: "One more step.",
    },
    warning:
      "Deleting removes your scans and their results, your recovery codes and every connected account. Nothing here can be restored afterwards.",
    endsSubscription: "Your Pro subscription ends at once, and you will not be charged again.",
    typePhrase: "To confirm, type",
    /** Typed by hand to confirm, in the language of the interface. */
    phrase: "I want to delete my account",
    confirmation: "Confirmation",
    passwordRequired: "Enter your password.",
    totpRequired: "Enter the six digits from your app.",
    recoveryRequired: "Enter one of your recovery codes.",
    submit: "Delete permanently",
    useRecoveryCode: "Use a recovery code instead",
    useApp: "Use your authenticator app instead",
    deleted: "Account deleted",
    deletedHint: "Everything tied to it is gone.",
  },
};

export default profile;
