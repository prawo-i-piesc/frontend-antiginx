/**
 * Profile endpoints. Separate from authApi because these change the account
 * rather than the session, and they still live under /api/utils.
 */

import { apiErrorFromResponse } from "@/app/lib/authErrors";
import { authorizedFetch } from "@/app/lib/session";

/** Mirrors the binding on the backend's UpdateNameRequest. */
export const MIN_NAME_LENGTH = 6;

async function patch(path: string, body: unknown): Promise<void> {
  const response = await authorizedFetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw await apiErrorFromResponse(response);
}

export async function updateFullName(fullName: string): Promise<void> {
  await patch("/api/utils/profile/name", { full_name: fullName });
}

export async function updateEmail(email: string): Promise<void> {
  await patch("/api/utils/profile/email", { email });
}

export async function updatePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await patch("/api/utils/profile/password", {
    old_password: payload.currentPassword,
    new_password: payload.newPassword,
  });
}
