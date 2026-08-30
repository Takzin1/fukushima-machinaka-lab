"use server";

import { redirect } from "next/navigation";
import { publicEnv, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  fieldErrors,
  formDataObject,
  loginSchema,
  registerSchema,
} from "@/lib/validation";
import type { FormState } from "@/types/domain";

const configError: FormState = {
  status: "error",
  message: "現在、認証環境を準備中です。運営へお問い合わせください。",
};

export async function loginAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) return configError;

  const parsed = loginSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "メールアドレスまたはパスワードを確認してください。",
    };
  }

  redirect("/auth/continue");
}

export async function registerAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) return configError;

  const parsed = registerSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.siteUrl}/auth/callback`,
      data: {
        display_name: parsed.data.displayName,
        requested_role: parsed.data.role,
        university: parsed.data.university,
        faculty: parsed.data.faculty,
        grade: parsed.data.grade,
        privacy_agreed: true,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: "登録できませんでした。入力内容を確認するか、時間をおいて再度お試しください。",
    };
  }

  if (!data.session) {
    return {
      status: "success",
      message: "確認メールを送信しました。メール内のリンクから登録を完了してください。",
    };
  }

  redirect("/auth/continue");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
