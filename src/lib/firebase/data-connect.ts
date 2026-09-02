import "server-only";

import type { AuthClaims, OperationOptions } from "firebase-admin/data-connect";
import { getFirebaseDataConnect } from "@/lib/firebase/admin";

export type FirebaseActor = {
  uid: string;
  email?: string;
  emailVerified?: boolean;
};

function actorOptions(actor: FirebaseActor): OperationOptions {
  const authClaims: AuthClaims = {
    sub: actor.uid,
    uid: actor.uid,
    email: actor.email,
    email_verified: actor.emailVerified ?? true,
  };
  return { impersonate: { authClaims } };
}

const publicOptions: OperationOptions = {
  impersonate: { unauthenticated: true },
};

export async function executePublicQuery<Data, Variables = never>(
  operation: string,
  variables?: Variables,
) {
  const dataConnect = getFirebaseDataConnect();
  return variables === undefined
    ? dataConnect.executeQuery<Data>(operation, publicOptions)
    : dataConnect.executeQuery<Data, Variables>(operation, variables, publicOptions);
}

export async function executeUserQuery<Data, Variables = never>(
  operation: string,
  actor: FirebaseActor,
  variables?: Variables,
) {
  const dataConnect = getFirebaseDataConnect();
  const options = actorOptions(actor);
  return variables === undefined
    ? dataConnect.executeQuery<Data>(operation, options)
    : dataConnect.executeQuery<Data, Variables>(operation, variables, options);
}

export async function executeUserMutation<Data, Variables = never>(
  operation: string,
  actor: FirebaseActor,
  variables?: Variables,
) {
  const dataConnect = getFirebaseDataConnect();
  const options = actorOptions(actor);
  return variables === undefined
    ? dataConnect.executeMutation<Data>(operation, options)
    : dataConnect.executeMutation<Data, Variables>(operation, variables, options);
}
