import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDataConnect } from "firebase-admin/data-connect";
import { firebaseConnector, requireFirebaseAdminEnv } from "@/lib/env";

function getFirebaseAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const { projectId, adminClientEmail, adminPrivateKey } = requireFirebaseAdminEnv();
  return initializeApp({
    projectId,
    credential: cert({
      projectId,
      clientEmail: adminClientEmail,
      privateKey: adminPrivateKey,
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseDataConnect() {
  return getDataConnect(firebaseConnector, getFirebaseAdminApp());
}

export async function getFirebaseAdminAccessToken() {
  const credential = getFirebaseAdminApp().options.credential;
  if (!credential) {
    throw new Error("Firebase Admin credential is unavailable.");
  }
  const token = await credential.getAccessToken();
  if (!token.access_token) {
    throw new Error("Firebase Admin access token is unavailable.");
  }
  return token.access_token;
}
