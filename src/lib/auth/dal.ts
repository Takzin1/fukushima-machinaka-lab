import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/env";
import { executeUserQuery } from "@/lib/firebase/data-connect";
import { mapProfile, type DataRecord } from "@/lib/firebase/mappers";
import { getFirebaseSession } from "@/lib/firebase/session";
import type { Profile, UserRole } from "@/types/domain";

export type UserContext = {
  id: string;
  email: string;
  profile: Profile;
};

type ProfileResult = { profile: DataRecord | null };

export const getUserContext = cache(async (): Promise<UserContext | null> => {
  if (!isFirebaseConfigured()) return null;

  const session = await getFirebaseSession();
  if (!session?.uid || session.email_verified !== true) return null;

  try {
    const response = await executeUserQuery<ProfileResult>(
      "GetCurrentProfile",
      {
        uid: session.uid,
        email: session.email,
        emailVerified: true,
      },
    );
    if (!response.data.profile) return null;
    const profile = mapProfile(response.data.profile);
    return {
      id: session.uid,
      email: session.email ?? profile.email,
      profile,
    };
  } catch {
    return null;
  }
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
