import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithContext } from "@/types/domain";

export async function getStudentApplications(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, challenge_id, student_id, motivation, interest_reason, skills_experience, availability, notes, status, privacy_agreed_at, created_at, updated_at, challenges(id, title, shop_display_name)",
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("応募履歴を取得できませんでした。");
  return (data ?? []) as unknown as ApplicationWithContext[];
}

export async function getAllApplications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, challenge_id, student_id, motivation, interest_reason, skills_experience, availability, notes, status, privacy_agreed_at, created_at, updated_at, challenges(id, title, shop_display_name), profiles(display_name, university, faculty, grade, skills)",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error("応募管理データを取得できませんでした。");
  return (data ?? []) as unknown as ApplicationWithContext[];
}
