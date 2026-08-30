import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/domain";

export type UserContext = {
  id: string;
  email: string;
  profile: Profile;
};

export const getUserContext = cache(async (): Promise<UserContext | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, display_name, email, university, faculty, grade, bio, skills, privacy_agreed_at, created_at, updated_at",
    )
    .eq("id", claims.sub)
    .single();

  if (error || !data) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : data.email,
    profile: data as Profile,
  };
});

export async function requireUser() {
  const context = await getUserContext();
  if (!context) redirect("/login?message=login-required");
  return context;
}

export async function requireRole(...roles: UserRole[]) {
  const context = await requireUser();
  if (!roles.includes(context.profile.role)) redirect("/forbidden");
  return context;
}
