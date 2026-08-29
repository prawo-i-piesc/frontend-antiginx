"use client";

import { oauthStartUrl, type OAuthProvider } from "@/app/lib/authApi";

const PROVIDERS: { id: OAuthProvider; label: string; icon: string }[] = [
  { id: "google", label: "Continue with Google", icon: "ri-google-fill" },
  { id: "github", label: "Continue with GitHub", icon: "ri-github-fill" },
];

export function OAuthButtons({ next = "/dashboard", disabled }: { next?: string; disabled?: boolean }) {
  return (
    <div className="space-y-3">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={disabled}
          // A navigation, not a fetch: the provider needs a top-level redirect
          // and the backend needs to set its state cookie on the way out.
          onClick={() => {
            window.location.href = oauthStartUrl(provider.id, next);
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 py-3 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className={`${provider.icon} text-lg`} aria-hidden="true" />
          {provider.label}
        </button>
      ))}
    </div>
  );
}

export default OAuthButtons;
