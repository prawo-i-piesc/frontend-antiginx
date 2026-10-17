import { pluralEn } from "@/app/i18n/plural";

/** Sign in, sign up, the second factor, password reset and email confirmation. */
const auth = {
  /** Fields and messages more than one screen uses. */
  fields: {
    email: "Email address",
    emailPlaceholder: "you@email.com",
    password: "Password",
    showPassword: "Show password",
    newPasswordPlaceholder: "Choose a strong password",
    passwordsMismatch: "Both passwords have to match.",
    totpCode: "Six-digit code",
    totpRequired: "Enter the six digits from your app.",
    recoveryCode: "Recovery code",
    recoveryCodeHint: "Each recovery code works once.",
    recoveryCodeRequired: "Enter one of your recovery codes.",
    useRecoveryCode: "Use a recovery code instead",
    useAuthenticator: "Use your authenticator app instead",
  },

  backToSignIn: "Back to sign in",
  signedIn: "Signed in",
  welcomeBack: (name: string) => `Welcome back, ${name}.`,
  continueWith: (provider: string) => `Continue with ${provider}`,

  login: {
    title: "Sign in to Antiginx",
    subtitle: "Welcome back. Enter your details to continue.",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    submit: "Sign in",
    submitting: "Signing in…",
    passkey: "Sign in with a passkey",
    passkeyUnavailable: "Your device could not offer a passkey here.",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
  },

  register: {
    title: "Create your account",
    subtitle: "Start scanning your sites in a couple of minutes.",
    name: "Full name",
    namePlaceholder: "Jan Kowalski",
    confirmPassword: "Confirm password",
    confirmPlaceholder: "Repeat your password",
    terms: "I accept the terms of service and the privacy policy.",
    termsRequired: "Accept the terms to create an account.",
    submit: "Create account",
    submitting: "Creating account…",
    created: "Account created",
    confirmToFinish: "Confirm your email to finish.",
    signInToContinue: "Sign in to continue.",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
  },

  mfa: {
    title: "Two-step verification",
    passkeyPrompt: "Confirm with the passkey on this device.",
    totpPrompt: "Enter the code from your authenticator app.",
    recoveryPrompt: "Enter one of the recovery codes you saved.",
    passkey: "Confirm with your passkey",
    submit: "Verify and sign in",
    submitting: "Verifying…",
    noPasskeyUsed: "No passkey was used.",
    deviceFailed: "Your device could not confirm this. Try another way.",
  },

  link: {
    title: (provider: string) => `Connect ${provider} to your account`,
    accountExists: (email: string) => `An account already uses ${email}.`,
    passwordPrompt: (email: string) =>
      `An account already uses ${email}. Confirm its password to join them.`,
    codePrompt: "One more step — the code from your authenticator app.",
    noPassword: (provider: string) =>
      `That account has no password to confirm with. Sign in the way you normally do, then connect ${provider} from your profile.`,
    passwordPlaceholder: "Password for this account",
    confirm: "Confirm and connect",
    verify: "Verify and connect",
    connecting: "Connecting…",
    connected: (provider: string) => `${provider} connected`,
    connectedDetail: "You can sign in with it from now on.",
    expired: "That sign-in attempt expired. Start again.",
    cancel: "Cancel and sign in normally",
  },

  forgotPassword: {
    title: "Reset your password",
    subtitle: "Enter your email address and we will send you a reset link.",
    emailRequired: "Enter the email address you signed up with.",
    submit: "Send reset link",
    submitting: "Sending…",
    sentTitle: "Check your inbox",
    sentSubtitle: "If an account exists for that address, a reset link is on its way.",
    /** Around the address, which is emphasised: "We sent the link to ann@example.com. It …" */
    sentTo: {
      before: "We sent the link to ",
      after: ". It stays valid for 30 minutes.",
    },
    /** Around a button that brings the form back. */
    retry: {
      before: "Nothing arrived? Check your spam folder, then ",
      action: "try another address",
      after: ".",
    },
  },

  resetPassword: {
    incompleteTitle: "This link is incomplete",
    incompleteSubtitle: "The reset link is missing its token. Request a new one to continue.",
    requestNew: "Request a new link",
    expiryNote: "Reset links expire after 30 minutes and can only be used once.",
    title: "Choose a new password",
    subtitle: "Signing in on your other devices will be required again.",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    confirmPlaceholder: "Repeat your new password",
    submit: "Update password",
    submitting: "Updating…",
    updated: "Password updated",
    updatedDetail: "Sign in with your new password.",
  },

  verifyEmail: {
    missingToken: "This link is missing its token.",
    workingTitle: "Confirming your address",
    workingSubtitle: "This takes a second.",
    working: "Checking the link…",
    doneTitle: "Address confirmed",
    doneSubtitle: "Your email address is verified.",
    doneDetail:
      "Signing in with a provider on this address will now connect to this account instead of asking for your password.",
    toDashboard: "Go to the dashboard",
    failedTitle: "That link did not work",
    failedSubtitle: "Confirmation links expire and can only be used once.",
    sendNew: "Send a new one from your profile",
  },

  confirmEmail: {
    title: "Confirm your email",
    subtitle: (email: string) => `We sent a link to ${email}.`,
    detail:
      "Open it and you are in. The link is good for a limited time, and confirming also lets us reach you if you ever need to reset your password.",
    recheck: "I have confirmed it",
    checking: "Checking…",
    resend: "Send the link again",
    sending: "Sending…",
    signOut: "Sign out",
    sent: "Confirmation sent",
    sentDetail: (email: string) => `Check ${email}.`,
    confirmed: "Address confirmed",
    stillWaiting: "Still waiting on that link.",
    stillWaitingDetail: "Open the one we sent, or send yourself a new one.",
  },

  welcome: {
    title: "Almost there",
    subtitle: "Pick the name you want to be shown as. You can change it later.",
    name: "Display name",
    nameHint: (min: number) => pluralEn(min, "At least 1 character.", `At least ${min} characters.`),
    submitting: "Saving…",
    saved: "Welcome aboard",
    keep: (name: string) => `Keep ${name} and continue`,
  },
};

export default auth;
