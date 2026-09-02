import "server-only";

import { firebaseConnector, requireFirebaseAdminEnv } from "@/lib/env";
import { getFirebaseAdminAccessToken } from "@/lib/firebase/admin";

export type FirebaseActor = {
  uid: string;
  email?: string;
  emailVerified: boolean;
};

type Impersonation =
  | { unauthenticated: true }
  | { authClaims: Record<string, unknown> };

type GraphqlError = {
  message?: string;
};

type GraphqlResponse<Data> = {
  data?: Data;
  errors?: GraphqlError[];
};

function actorImpersonation(actor: FirebaseActor): Impersonation {
  return {
    authClaims: {
      sub: actor.uid,
      uid: actor.uid,
      email: actor.email,
      email_verified: actor.emailVerified,
    },
  };
}

function operationUrl(kind: "impersonateQuery" | "impersonateMutation") {
  const { projectId } = requireFirebaseAdminEnv();
  const parts = [
    projectId,
    firebaseConnector.location,
    firebaseConnector.serviceId,
    firebaseConnector.connector,
  ].map(encodeURIComponent);
  return (
    "https://firebasedataconnect.googleapis.com/v1/projects/" +
    parts[0] +
    "/locations/" +
    parts[1] +
    "/services/" +
    parts[2] +
    "/connectors/" +
    parts[3] +
    ":" +
    kind
  );
}

async function executeOperation<Data, Variables>(
  kind: "impersonateQuery" | "impersonateMutation",
  operation: string,
  variables: Variables | undefined,
  impersonate: Impersonation,
) {
  const accessToken = await getFirebaseAdminAccessToken();
  const response = await fetch(operationUrl(kind), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: operation,
      ...(variables === undefined ? {} : { variables }),
      extensions: { impersonate },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphqlResponse<Data> & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      "Firebase SQL Connect returned HTTP " +
        response.status +
        ": " +
        (payload.error?.message || "request failed"),
    );
  }

  if (payload.errors?.length) {
    throw new Error(
      payload.errors.map((error) => error.message || "GraphQL error").join("; "),
    );
  }

  if (payload.data === undefined) {
    throw new Error("Firebase SQL Connect response did not contain data.");
  }

  return { data: payload.data };
}

export async function executePublicQuery<Data, Variables = never>(
  operation: string,
  variables?: Variables,
) {
  return executeOperation<Data, Variables>(
    "impersonateQuery",
    operation,
    variables,
    { unauthenticated: true },
  );
}

export async function executeUserQuery<Data, Variables = never>(
  operation: string,
  actor: FirebaseActor,
  variables?: Variables,
) {
  return executeOperation<Data, Variables>(
    "impersonateQuery",
    operation,
    variables,
    actorImpersonation(actor),
  );
}

export async function executeUserMutation<Data, Variables = never>(
  operation: string,
  actor: FirebaseActor,
  variables?: Variables,
) {
  return executeOperation<Data, Variables>(
    "impersonateMutation",
    operation,
    variables,
    actorImpersonation(actor),
  );
}
