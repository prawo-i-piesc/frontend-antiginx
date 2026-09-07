/**
 * Two-factor endpoints from ISSUE-01-BACKEND-SPEC.md section 5.4.
 *
 * Enrolling, disabling and regenerating all re-check the password, so each of
 * those takes it rather than relying on the session alone.
 */

import { apiErrorFromResponse } from "@/app/lib/authErrors";
import { authorizedFetch } from "@/app/lib/session";

export interface TotpEnrollment {
  secret: string;
  otpauth_uri: string;
}

export interface RecoveryCodes {
  recovery_codes: string[];
  generated_at: string;
}

async function send(path: string, method: string, body?: unknown): Promise<Response> {
  const response = await authorizedFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) throw await apiErrorFromResponse(response);
  return response;
}

export async function enrollTotp(password: string): Promise<TotpEnrollment> {
  const response = await send("/api/auth/mfa/totp/enroll", "POST", { password });
  return (await response.json()) as TotpEnrollment;
}

export async function activateTotp(code: string): Promise<RecoveryCodes> {
  const response = await send("/api/auth/mfa/totp/activate", "POST", { code });
  return (await response.json()) as RecoveryCodes;
}

export async function disableTotp(password: string): Promise<void> {
  await send("/api/auth/mfa/totp", "DELETE", { password });
}

export async function regenerateRecoveryCodes(password: string): Promise<RecoveryCodes> {
  const response = await send("/api/auth/mfa/recovery-codes/regenerate", "POST", { password });
  return (await response.json()) as RecoveryCodes;
}
