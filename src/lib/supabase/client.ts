import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = requireSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
