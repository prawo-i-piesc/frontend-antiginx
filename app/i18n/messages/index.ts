import type { Locale } from "@/app/i18n/config";
import en, { type Messages } from "@/app/i18n/messages/en";
import pl from "@/app/i18n/messages/pl";

export type { Messages };

export const MESSAGES: Record<Locale, Messages> = { pl, en };
