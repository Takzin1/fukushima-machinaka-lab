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

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabasePublishableKey =
  clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const publicEnv = {
  siteUrl: resolveSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL,
  ),
  supabaseUrl,
  supabasePublishableKey,
};

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function requireSupabaseEnv() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { supabaseUrl, supabasePublishableKey };
}
