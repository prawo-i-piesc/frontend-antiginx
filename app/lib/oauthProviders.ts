/**
 * Identity providers the app knows about.
 *
 * `available` reflects what the backend has registered — only Google so far
 * (E3 part 1). Anything not available is left out of the sign-in screen and
 * shown as "coming soon" in the profile, rather than offering a button that
 * bounces back with an error.
 */

export type OAuthProvider = "google" | "github";

export interface ProviderInfo {
  id: OAuthProvider;
  label: string;
  icon: string;
  available: boolean;
}

export const OAUTH_PROVIDERS: ProviderInfo[] = [
  { id: "google", label: "Google", icon: "ri-google-fill", available: true },
  { id: "github", label: "GitHub", icon: "ri-github-fill", available: false },
];

export const AVAILABLE_PROVIDERS = OAUTH_PROVIDERS.filter((provider) => provider.available);
