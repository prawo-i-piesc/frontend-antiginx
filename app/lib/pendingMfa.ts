import type { MfaMethod } from "@/app/lib/authApi";

/**
 * Carries the second-factor challenge from the sign-in screen to the code
 * screen. Module memory rather than a query parameter, because the token is a
 * credential and the address bar ends up in history and referrers. A hard
 * reload drops it, which correctly restarts the sign-in.
 */

interface PendingMfa {
  mfaToken: string;
  methods: MfaMethod[];
  email?: string;
  next: string;
}

let pending: PendingMfa | null = null;

export function setPendingMfa(challenge: PendingMfa): void {
  pending = challenge;
}

export function getPendingMfa(): PendingMfa | null {
  return pending;
}

export function clearPendingMfa(): void {
  pending = null;
}
