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
