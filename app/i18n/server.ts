import { cookies, headers } from "next/headers";
import type { Metadata } from "next";

import { LOCALE_COOKIE, isLocale, negotiateLocale, type Locale } from "@/app/i18n/config";
import { MESSAGES, type Messages } from "@/app/i18n/messages";

/**
 * Server-side half of the locale: an explicit choice saved in the cookie wins,
 * then whatever the browser asks for in Accept-Language.
 */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return negotiateLocale((await headers()).get("accept-language"));
}

export async function getMessages(): Promise<Messages> {
  return MESSAGES[await getLocale()];
}

/**
 * generateMetadata for a route that only needs its own title.
 *
 * Every page used to share the title "Antiginx", and Next's route announcer
 * only speaks when the title changes — so a screen reader heard nothing at all
 * when moving between pages.
 */
export function pageTitle(key: keyof Messages["meta"]["titles"]) {
  return async function generateMetadata(): Promise<Metadata> {
    const t = await getMessages();
    return {
      title: {
        default: t.meta.titles[key],
        // A plain string title would end the root layout's template here, and
        // the routes nested under this one would lose the "· Antiginx" suffix.
        template: t.meta.titleTemplate,
      },
    };
  };
}
