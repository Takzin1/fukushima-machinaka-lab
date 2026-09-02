"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createFirebaseWorkflowGateway } from "@/features/firebase-workflow-gateway";
import { publishChallenge } from "@/features/workflows";
import { requireRole } from "@/lib/auth/dal";
import { executeUserMutation } from "@/lib/firebase/data-connect";
import {
  applicationStatusSchema,
  challengeSchema,
  fieldErrors,
  formDataObject,
} from "@/lib/validation";
import type { FormState } from "@/types/domain";

export async function createChallengeAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("admin");
  const parsed = challengeSchema.safeParse(formDataObject(formData));

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await publishChallenge(
      { id: user.id, role: user.profile.role },
      parsed.data,
      createFirebaseWorkflowGateway({
        uid: user.id,
        email: user.email,
        emailVerified: true,
      }),
    );
  } catch {
    return {
      status: "error",
      message: "Challengeを保存できませんでした。内容を確認してください。",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  redirect("/admin/challenges?created=1");
}

export async function updateApplicationStatusAction(formData: FormData) {
  const user = await requireRole("admin");
  const parsed = applicationStatusSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/applications?error=invalid-status");

  try {
    await executeUserMutation(
      "UpdateApplicationStatus",
      { uid: user.id, email: user.email, emailVerified: true },
      { id: parsed.data.applicationId, status: parsed.data.status },
    );
  } catch {
    redirect("/admin/applications?error=update-failed");
  }
  revalidatePath("/admin/applications");
  redirect("/admin/applications?updated=1");
}

const challengeStatusSchema = z.object({
  challengeId: z.string().uuid(),
  status: z.enum(["draft", "published", "closed", "archived"]),
});

export async function updateChallengeStatusAction(formData: FormData) {
  const user = await requireRole("admin");
  const parsed = challengeStatusSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/challenges?error=invalid-status");

  try {
    await executeUserMutation(
      "UpdateChallengeStatus",
      { uid: user.id, email: user.email, emailVerified: true },
      {
        id: parsed.data.challengeId,
        status: parsed.data.status,
        publishedAt:
          parsed.data.status === "published" ? new Date().toISOString() : null,
      },
    );
  } catch {
    redirect("/admin/challenges?error=update-failed");
  }
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  redirect("/admin/challenges?updated=1");
}
