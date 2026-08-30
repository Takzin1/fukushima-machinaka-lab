import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Wish } from "@/types/domain";

const wishColumns =
  "id, owner_id, shop_name, contact_name, contact_email, industry, website_url, sns_url, address, problem, desired_outcome, experiment_idea, preferred_period, notes, status, created_at, updated_at";

export async function getOwnerWishes(ownerId: string): Promise<Wish[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select(wishColumns)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("WISH一覧を取得できませんでした。");
  return (data ?? []) as Wish[];
}

export async function getWish(id: string): Promise<Wish | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select(wishColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("WISHを取得できませんでした。");
  return data as Wish | null;
}

export async function getAllWishes(): Promise<Wish[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishes")
    .select(wishColumns)
    .order("created_at", { ascending: false });

  if (error) throw new Error("WISH管理データを取得できませんでした。");
  return (data ?? []) as Wish[];
}
