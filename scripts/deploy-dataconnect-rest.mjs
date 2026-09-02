import { readFileSync } from "node:fs";
import { randomUUID, sign } from "node:crypto";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fukushima-machinaka-lab";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const serviceName = "projects/" + projectId + "/locations/asia-northeast1/services/fukushima-machinaka-lab-service";
const connectorName = serviceName + "/connectors/app-connector";
const apiRoot = "https://firebasedataconnect.googleapis.com/v1/";

if (process.env.VERCEL_ENV !== "production") {
  console.log("Skipping Firebase SQL Connect deployment outside production.");
  process.exit(0);
}

if (!clientEmail || !privateKey) {
  throw new Error("Firebase Admin credentials are unavailable in the production build environment.");
}

function encode(value) {
  return Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = encode({ alg: "RS256", typ: "JWT" }) + "." + encode({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  });
  const assertion = unsigned + "." + sign("RSA-SHA256", Buffer.from(unsigned), privateKey).toString("base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error("OAuth token request failed with HTTP " + response.status + ".");
  }
  return payload.access_token;
}

async function requestJson(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: "Bearer " + token,
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let payload = {};
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = { message: text }; }
  }
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || "Unknown API error";
    throw new Error("Firebase SQL Connect API returned HTTP " + response.status + ": " + detail);
  }
  return payload;
}

async function waitForOperation(token, operation) {
  if (!operation?.name) throw new Error("Firebase SQL Connect did not return an operation name.");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const current = await requestJson(token, apiRoot + operation.name);
    if (current.done) {
      if (current.error) throw new Error("Connector deployment failed: " + (current.error.message || "unknown error"));
      return current.response;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error("Timed out waiting for the connector deployment.");
}

const queries = readFileSync("dataconnect/app-connector/queries.gql", "utf8");
const mutations = readFileSync("dataconnect/app-connector/mutations.gql", "utf8");
const seed = readFileSync("dataconnect/seed_data.gql", "utf8");
const token = await getAccessToken();

console.log("Deploying the audited Firebase SQL Connect connector through the official API...");
const operation = await requestJson(
  token,
  apiRoot + connectorName + "?allowMissing=true&updateMask=source,displayName&requestId=" + randomUUID(),
  {
    method: "PATCH",
    body: JSON.stringify({
      name: connectorName,
      displayName: "Fukushima Machinaka Lab App Connector",
      source: {
        files: [
          { path: "dataconnect/app-connector/queries.gql", content: queries },
          { path: "dataconnect/app-connector/mutations.gql", content: mutations },
        ],
      },
    }),
  },
);
await waitForOperation(token, operation);

console.log("Loading and verifying the audited sample data...");
const seeded = await requestJson(token, apiRoot + serviceName + ":executeGraphql", {
  method: "POST",
  body: JSON.stringify({ query: seed, operationName: "SeedSampleChallenges" }),
});
if (seeded.errors?.length) {
  throw new Error("Sample data mutation returned GraphQL errors: " + JSON.stringify(seeded.errors));
}
const seededKeys = Object.keys(seeded.data || {});
if (!["first", "second", "third"].every((key) => seededKeys.includes(key))) {
  throw new Error("Sample data verification did not return all three expected records.");
}

console.log("Firebase SQL Connect connector and 3 sample records are ready.");
