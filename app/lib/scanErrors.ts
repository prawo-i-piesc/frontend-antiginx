import type { Messages } from "@/app/i18n/messages/en";
import { ApiRequestError } from "@/app/lib/api";

/** What to tell someone about a scan request that failed. The backend explains itself in English only. */
export function scanErrorMessage(messages: Messages["scan"]["errors"], error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.code === "NETWORK_ERROR") return messages.network;
    if (error.code === "PRO_REQUIRED") return messages.proRequired;
    if (error.status === 401 || error.status === 403) return messages.unauthorized;
    if (error.status === 404) return messages.notFound;
    if (error.status === 429) return messages.rateLimited;
    if (error.status && error.status >= 500) return messages.server;
    if (error.status && error.status >= 400) return messages.invalidRequest;
    return messages.unexpected;
  }

  if (error instanceof Error && /failed to fetch|network/i.test(error.message)) return messages.network;
  return messages.unexpected;
}
