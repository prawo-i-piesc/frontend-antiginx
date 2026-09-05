/**
 * Identity providers the app knows about.
 *
 * `available` reflects what the backend can register. A provider still needs
 * its client id and secret set on the instance — without them the backend
 * leaves it out of its registry and the button bounces back with an error.
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
  { id: "github", label: "GitHub", icon: "ri-github-fill", available: true },
];

export const AVAILABLE_PROVIDERS = OAUTH_PROVIDERS.filter((provider) => provider.available);
