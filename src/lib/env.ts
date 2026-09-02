const fallbackSiteUrl = "http://localhost:3000";

function clean(value: string | undefined) {
  return value?.trim() || undefined;
}

function parseHttpUrl(value: string | undefined, assumeHttps = false) {
  const cleaned = clean(value);
  if (!cleaned) return undefined;
  const candidate = assumeHttps && !/^https?:\/\//i.test(cleaned)
    ? `https://${cleaned}`
    : cleaned;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function resolveSiteUrl(
  configuredUrl: string | undefined,
  vercelHost: string | undefined,
) {
  return (
    parseHttpUrl(configuredUrl) ??
    parseHttpUrl(vercelHost, true) ??
    fallbackSiteUrl
  );
}

const projectId = clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
const apiKey = clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
const adminClientEmail = clean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
const adminPrivateKey = clean(process.env.FIREBASE_ADMIN_PRIVATE_KEY)?.replace(
  /\\n/g,
  "\n",
);

export const publicEnv = {
  siteUrl: resolveSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
  ),
  firebaseProjectId: projectId,
  firebaseApiKey: apiKey,
};

export const firebaseConnector = {
  location: "asia-northeast1",
  serviceId: "fukushima-machinaka-lab-service",
  connector: "app-connector",
} as const;

export function isFirebaseConfigured() {
  return Boolean(projectId && apiKey && adminClientEmail && adminPrivateKey);
}

export function requireFirebaseAuthEnv() {
  if (!projectId || !apiKey) {
    throw new Error("Firebase Auth environment variables are not configured.");
  }
  return { projectId, apiKey };
}

export function requireFirebaseAdminEnv() {
  if (!projectId || !adminClientEmail || !adminPrivateKey) {
    throw new Error("Firebase Admin environment variables are not configured.");
  }
  return { projectId, adminClientEmail, adminPrivateKey };
}
