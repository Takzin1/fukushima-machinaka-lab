import "server-only";

import { demoChallenges } from "@/data/demo-challenges";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Challenge } from "@/types/domain";

const challengeColumns =
  "id, wish_id, title, summary, background, problem, desired_outcome, shop_display_name, category, skills, period, workload, area, capacity, deadline, status, is_sample, published_at, created_at, updated_at";

export async function getPublishedChallenges(): Promise<Challenge[]> {
  if (!isSupabaseConfigured()) return demoChallenges;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select(challengeColumns)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw new Error("Challenge一覧を取得できませんでした。");
  return (data ?? []) as Challenge[];
}

export async function getPublishedChallenge(id: string): Promise<Challenge | null> {
  if (!isSupabaseConfigured()) {
    return demoChallenges.find((challenge) => challenge.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select(challengeColumns)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error("Challengeを取得できませんでした。");
  return data as Challenge | null;
}

export async function getAllChallenges(): Promise<Challenge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select(challengeColumns)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Challenge管理データを取得できませんでした。");
  return (data ?? []) as Challenge[];
}
