/**
 * Passkeys (WebAuthn), per ISSUE-01-BACKEND-SPEC.md section 5.5.
 *
 * The browser API speaks ArrayBuffer and JSON cannot carry those, so options
 * and results are converted on the way through. Newer engines do it themselves
 * via parseCreationOptionsFromJSON/toJSON; the manual path below covers the
 * ones that do not, rather than silently failing on them.
 */

import { apiErrorFromResponse } from "@/app/lib/authErrors";
import { authorizedFetch, sessionFromResponse, setSession, type Session, type SessionResponse } from "@/app/lib/session";

export interface PasskeyCredential {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
}

/** True when this browser can do passkeys at all. */
export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function";
}

function fromBase64Url(value: string): ArrayBuffer {
  const normalised = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type JsonOptions = Record<string, unknown>;

function decodeCreationOptions(options: JsonOptions): PublicKeyCredentialCreationOptions {
  const parse = (
    PublicKeyCredential as unknown as {
      parseCreationOptionsFromJSON?: (value: JsonOptions) => PublicKeyCredentialCreationOptions;
    }
  ).parseCreationOptionsFromJSON;

  if (typeof parse === "function") return parse(options);

  const user = options.user as { id: string } & Record<string, unknown>;
  const exclude = (options.excludeCredentials ?? []) as { id: string }[];

  return {
    ...options,
    challenge: fromBase64Url(options.challenge as string),
    user: { ...user, id: fromBase64Url(user.id) },
    excludeCredentials: exclude.map((entry) => ({
      ...entry,
      id: fromBase64Url(entry.id),
      type: "public-key" as const,
    })),
  } as unknown as PublicKeyCredentialCreationOptions;
}

function decodeRequestOptions(options: JsonOptions): PublicKeyCredentialRequestOptions {
  const parse = (
    PublicKeyCredential as unknown as {
      parseRequestOptionsFromJSON?: (value: JsonOptions) => PublicKeyCredentialRequestOptions;
    }
  ).parseRequestOptionsFromJSON;

  if (typeof parse === "function") return parse(options);

  const allow = (options.allowCredentials ?? []) as { id: string }[];

  return {
    ...options,
    challenge: fromBase64Url(options.challenge as string),
    allowCredentials: allow.map((entry) => ({
      ...entry,
      id: fromBase64Url(entry.id),
      type: "public-key" as const,
    })),
  } as unknown as PublicKeyCredentialRequestOptions;
}

function encodeAssertion(credential: PublicKeyCredential): unknown {
  const toJSON = (credential as unknown as { toJSON?: () => unknown }).toJSON;
  if (typeof toJSON === "function") return toJSON.call(credential);

  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: toBase64Url(response.clientDataJSON),
      authenticatorData: toBase64Url(response.authenticatorData),
      signature: toBase64Url(response.signature),
      userHandle: response.userHandle ? toBase64Url(response.userHandle) : null,
    },
  };
}

async function assertAgainst(
  optionsPath: string,
  body: unknown,
): Promise<{ session: string; assertion: unknown }> {
  const optionsResponse = await fetch(optionsPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!optionsResponse.ok) throw await apiErrorFromResponse(optionsResponse);

  const payload = (await optionsResponse.json()) as {
    publicKey: JsonOptions;
    webauthn_session: string;
  };

  const credential = (await navigator.credentials.get({
    publicKey: decodeRequestOptions(payload.publicKey),
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("cancelled");

  return { session: payload.webauthn_session, assertion: encodeAssertion(credential) };
}

async function readSession(response: Response): Promise<Session> {
  if (!response.ok) throw await apiErrorFromResponse(response);
  const session = await sessionFromResponse((await response.json()) as SessionResponse);
  setSession(session);
  return session;
}

/** Passkey instead of a password. Only accounts in passwordless mode may. */
export async function signInWithPasskey(email?: string): Promise<Session> {
  const { session, assertion } = await assertAgainst("/api/auth/webauthn/login/options", {
    email: email ?? "",
  });

  return readSession(
    await fetch("/api/auth/webauthn/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webauthn_session: session, credential: assertion }),
      credentials: "same-origin",
      cache: "no-store",
    }),
  );
}

/** Passkey as the second step, after the password was already accepted. */
export async function confirmWithPasskey(mfaToken: string): Promise<Session> {
  const { session, assertion } = await assertAgainst("/api/auth/mfa/webauthn/options", {
    mfa_token: mfaToken,
  });

  return readSession(
    await fetch("/api/auth/mfa/webauthn/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mfa_token: mfaToken,
        webauthn_session: session,
        credential: assertion,
      }),
      credentials: "same-origin",
      cache: "no-store",
    }),
  );
}

export type PasskeyMode = "second_factor" | "passwordless";

export async function setPasskeyMode(mode: PasskeyMode): Promise<void> {
  const response = await authorizedFetch("/api/auth/webauthn/mode", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  if (!response.ok) throw await apiErrorFromResponse(response);
}

function encodeCredential(credential: PublicKeyCredential): unknown {
  const toJSON = (credential as unknown as { toJSON?: () => unknown }).toJSON;
  if (typeof toJSON === "function") return toJSON.call(credential);

  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: toBase64Url(response.clientDataJSON),
      attestationObject: toBase64Url(response.attestationObject),
      transports: response.getTransports?.() ?? [],
    },
  };
}

/**
 * Runs the whole registration ceremony.
 *
 * The fetch and the credentials call stay in one chain started by the click
 * that triggered it — Safari refuses the prompt once the user gesture has been
 * spent elsewhere.
 */
export async function registerPasskey(name: string): Promise<PasskeyCredential> {
  const optionsResponse = await authorizedFetch("/api/auth/webauthn/register/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!optionsResponse.ok) throw await apiErrorFromResponse(optionsResponse);

  const payload = (await optionsResponse.json()) as { publicKey: JsonOptions };
  const credential = (await navigator.credentials.create({
    publicKey: decodeCreationOptions(payload.publicKey),
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("cancelled");

  const verifyResponse = await authorizedFetch("/api/auth/webauthn/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: encodeCredential(credential), name }),
  });
  if (!verifyResponse.ok) throw await apiErrorFromResponse(verifyResponse);

  return (await verifyResponse.json()) as PasskeyCredential;
}

export async function listPasskeys(): Promise<PasskeyCredential[]> {
  const response = await authorizedFetch("/api/auth/webauthn/credentials");
  if (!response.ok) throw await apiErrorFromResponse(response);
  return (await response.json()) as PasskeyCredential[];
}

export async function deletePasskey(id: string): Promise<void> {
  const response = await authorizedFetch(`/api/auth/webauthn/credentials/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw await apiErrorFromResponse(response);
}
