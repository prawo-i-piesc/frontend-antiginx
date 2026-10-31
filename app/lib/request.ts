import { apiErrorFromResponse } from "@/app/lib/authErrors";
import { authorizedFetch } from "@/app/lib/session";

/** An authorized call to the API: the parsed body, or the API's error thrown as an ApiError. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await authorizedFetch(path, init);
  if (!response.ok) throw await apiErrorFromResponse(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** A query string from the parameters that have a value, or "" when none do. */
export function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}
