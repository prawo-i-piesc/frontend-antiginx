/**
 * The Pro plan. Payment and subscription management both happen on Stripe's
 * own pages: these calls only fetch the address to send the browser to, and
 * read back what the backend last heard from Stripe.
 */

import { apiErrorFromResponse } from "@/app/lib/authErrors";
import { authorizedFetch } from "@/app/lib/session";

export type Plan = "free" | "pro";

export interface BillingStatus {
  /** False where the server has no Stripe keys: nothing can be bought there. */
  enabled: boolean;
  plan: Plan;
  /** Stripe's subscription status, or "none" before the first payment. */
  status: string;
  current_period_end: string | null;
  /** When a cancelled subscription runs out; null while it renews. */
  cancel_at: string | null;
  /** Whether Stripe's customer portal has anything to show. */
  manageable: boolean;
}

async function request<T>(path: string, method: "GET" | "POST"): Promise<T> {
  const response = await authorizedFetch(path, { method });
  if (!response.ok) throw await apiErrorFromResponse(response);
  return (await response.json()) as T;
}

export function getBilling(): Promise<BillingStatus> {
  return request<BillingStatus>("/api/billing", "GET");
}

/** Asks the backend to re-read the subscription from Stripe, after a payment. */
export function syncBilling(): Promise<BillingStatus> {
  return request<BillingStatus>("/api/billing/sync", "POST");
}

/** The Stripe Checkout page for the Pro plan. */
export async function checkoutUrl(): Promise<string> {
  return (await request<{ url: string }>("/api/billing/checkout", "POST")).url;
}

/** Stripe's customer portal: cancelling, changing the card, invoices. */
export async function portalUrl(): Promise<string> {
  return (await request<{ url: string }>("/api/billing/portal", "POST")).url;
}
