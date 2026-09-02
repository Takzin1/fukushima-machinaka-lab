"use server";

import { redirect } from "next/navigation";
import { isFirebaseConfigured, publicEnv } from "@/lib/env";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import {
  FirebaseIdentityError,
  sendVerificationEmail,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/firebase/auth-rest";
import { executeUserMutation, executeUserQuery } from "@/lib/firebase/data-connect";
import { type DataRecord } from "@/lib/firebase/mappers";
import {
  clearFirebaseSession,
  createFirebaseSession,
} from "@/lib/firebase/session";
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
  if (!isFirebaseConfigured()) return configError;

  const parsed = loginSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    const identity = await signInWithPassword(parsed.data.email, parsed.data.password);
    const token = await getFirebaseAdminAuth().verifyIdToken(identity.idToken);
    if (token.email_verified !== true) {
      return {
        status: "error",
        message: "確認メールのリンクを開いてからログインしてください。",
      };
    }

    const profile = await executeUserQuery<{ profile: DataRecord | null }>(
      "GetCurrentProfile",
      { uid: token.uid, email: token.email, emailVerified: true },
    );
    if (!profile.data.profile) throw new Error("PROFILE_NOT_FOUND");

    await createFirebaseSession(identity.idToken);
  } catch {
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
  if (!isFirebaseConfigured()) return configError;

  const parsed = registerSchema.safeParse(formDataObject(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  let uid: string | undefined;
  try {
    const identity = await signUpWithPassword(parsed.data.email, parsed.data.password);
    uid = identity.localId;

    await sendVerificationEmail(
      identity.idToken,
      `${publicEnv.siteUrl}/login?message=email-verified`,
    );

    await executeUserMutation(
      "CreateProfile",
      {
        uid,
        email: parsed.data.email,
        emailVerified: false,
      },
      {
        role: parsed.data.role,
        displayName: parsed.data.displayName,
        email: parsed.data.email,
        university: parsed.data.university || null,
        faculty: parsed.data.faculty || null,
        grade: parsed.data.grade || null,
      },
    );
  } catch (error) {
    if (uid) await getFirebaseAdminAuth().deleteUser(uid).catch(() => undefined);
    const duplicate =
      error instanceof FirebaseIdentityError && error.code.includes("EMAIL_EXISTS");
    return {
      status: "error",
      message: duplicate
        ? "このメールアドレスは登録済みです。ログインしてください。"
        : "登録できませんでした。入力内容を確認するか、時間をおいて再度お試しください。",
    };
  }

  return {
    status: "success",
    message: "確認メールを送信しました。メール内のリンクを開いてからログインしてください。",
  };
}

export async function logoutAction() {
  await clearFirebaseSession();
  redirect("/");
}
