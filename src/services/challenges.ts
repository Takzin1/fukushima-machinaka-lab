import "server-only";

import { connection } from "next/server";
import { demoChallenges } from "@/data/demo-challenges";
import { requireRole } from "@/lib/auth/dal";
import { isFirebaseConfigured } from "@/lib/env";
import { executePublicQuery, executeUserQuery } from "@/lib/firebase/data-connect";
import { mapChallenge, type DataRecord } from "@/lib/firebase/mappers";
import type { Challenge } from "@/types/domain";

export async function getPublishedChallenges(): Promise<Challenge[]> {
  if (!isFirebaseConfigured()) return demoChallenges;
  await connection();
  const response = await executePublicQuery<{ challenges: DataRecord[] }>(
    "ListPublishedChallenges",
  );
  return response.data.challenges.map(mapChallenge);
}

export async function getPublishedChallenge(id: string): Promise<Challenge | null> {
  if (!isFirebaseConfigured()) {
    return demoChallenges.find((challenge) => challenge.id === id) ?? null;
  }
  await connection();
  const response = await executePublicQuery<
    { challenges: DataRecord[] },
    { id: string }
  >("GetPublishedChallenge", { id });
  const row = response.data.challenges[0];
  return row ? mapChallenge(row) : null;
}

export async function getAllChallenges(): Promise<Challenge[]> {
  const user = await requireRole("admin");
  const response = await executeUserQuery<{ challenges: DataRecord[] }>(
    "AdminListChallenges",
    { uid: user.id, email: user.email, emailVerified: true },
  );
  return response.data.challenges.map(mapChallenge);
}
