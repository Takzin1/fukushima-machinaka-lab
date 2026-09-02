import "server-only";

import { requireFirebaseAuthEnv } from "@/lib/env";

type IdentityResponse = {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  email: string;
  registered?: boolean;
};

type IdentityError = { error?: { message?: string } };

export class FirebaseIdentityError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

async function identityRequest<T>(method: string, body: object): Promise<T> {
  const { apiKey } = requireFirebaseAuthEnv();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as T & IdentityError;
  if (!response.ok) {
    throw new FirebaseIdentityError(payload.error?.message ?? "IDENTITY_REQUEST_FAILED");
  }
  return payload;
}

export function signUpWithPassword(email: string, password: string) {
  return identityRequest<IdentityResponse>("signUp", {
    email,
    password,
    returnSecureToken: true,
  });
}

export function signInWithPassword(email: string, password: string) {
  return identityRequest<IdentityResponse>("signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
}

export async function sendVerificationEmail(idToken: string, continueUrl: string) {
  await identityRequest("sendOobCode", {
    requestType: "VERIFY_EMAIL",
    idToken,
    continueUrl,
  });
}
