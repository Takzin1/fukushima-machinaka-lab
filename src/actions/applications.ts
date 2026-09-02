"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createFirebaseWorkflowGateway } from "@/features/firebase-workflow-gateway";
import { submitApplication } from "@/features/workflows";
import { requireRole } from "@/lib/auth/dal";
import { applicationSchema, fieldErrors, formDataObject } from "@/lib/validation";
import type { FormState } from "@/types/domain";

export async function createApplicationAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("student");
  const parsed = applicationSchema.safeParse(formDataObject(formData));

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await submitApplication(
      { id: user.id, role: user.profile.role },
      parsed.data,
      createFirebaseWorkflowGateway({
        uid: user.id,
        email: user.email,
        emailVerified: true,
      }),
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const message =
      code === "ALREADY_APPLIED"
        ? "このChallengeには応募済みです。"
        : code === "CHALLENGE_NOT_OPEN"
          ? "このChallengeは現在応募できません。"
          : "応募を保存できませんでした。時間をおいて再度お試しください。";
    return { status: "error", message };
  }

  revalidatePath("/student/applications");
  redirect("/student/applications?created=1");
}
