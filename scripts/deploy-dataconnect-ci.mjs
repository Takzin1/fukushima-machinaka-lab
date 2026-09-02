import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fukushima-machinaka-lab";

if (process.env.VERCEL_ENV !== "production") {
  console.log("Skipping Firebase Data Connect deployment outside production.");
  process.exit(0);
}

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!clientEmail || !privateKey) {
  throw new Error("Firebase Admin credentials are unavailable in the production build environment.");
}

const tempDirectory = mkdtempSync(join(tmpdir(), "firebase-dataconnect-"));
const credentialsPath = join(tempDirectory, "service-account.json");

function runFirebase(args, label) {
  console.log(label);
  const result = spawnSync(
    "npx",
    ["-y", "firebase-tools@15.28.2", ...args],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        GOOGLE_APPLICATION_CREDENTIALS: credentialsPath,
        GOOGLE_CLOUD_PROJECT: projectId,
      },
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error("Firebase command failed with exit code " + result.status + ".");
  }
}

try {
  writeFileSync(
    credentialsPath,
    JSON.stringify({
      type: "service_account",
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
      token_uri: "https://oauth2.googleapis.com/token",
    }),
    { mode: 0o600 },
  );

  runFirebase(
    [
      "deploy",
      "--only",
      "dataconnect:fukushima-machinaka-lab-service:app-connector",
      "--project",
      projectId,
      "--non-interactive",
      "--force",
    ],
    "Deploying the audited Firebase Data Connect connector...",
  );

  runFirebase(
    [
      "dataconnect:execute",
      "dataconnect/seed_data.gql",
      "--project",
      projectId,
      "--non-interactive",
    ],
    "Loading the audited sample data...",
  );
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}

console.log("Firebase Data Connect connector and sample data are ready.");
