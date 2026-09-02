import "server-only";

import { cookies } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

const sessionCookieName = "__session";
const expiresIn = 5 * 24 * 60 * 60 * 1000;

export async function createFirebaseSession(idToken: string) {
  const auth = getFirebaseAdminAuth();
  const token = await auth.verifyIdToken(idToken, true);
  if (token.email_verified !== true) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn,
  });
  const store = await cookies();
  store.set(sessionCookieName, sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getFirebaseSession() {
  const store = await cookies();
  const value = store.get(sessionCookieName)?.value;
  if (!value) return null;
  try {
    return await getFirebaseAdminAuth().verifySessionCookie(value, true);
  } catch {
    return null;
  }
}

export async function clearFirebaseSession() {
  const store = await cookies();
  store.set(sessionCookieName, "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
