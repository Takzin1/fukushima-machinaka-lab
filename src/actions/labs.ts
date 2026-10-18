"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { executeUserMutation, executeUserQuery } from "@/lib/firebase/data-connect";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";
import { createLabProjectSchema, formDataObject } from "@/lib/validation";

type MatchedApplication = {
  id: string;
  status: string;
  challengeId: string;
  studentId: string;
  challenge: { wish: { ownerId: string } | null } | null;
};

export async function createLabProjectAction(formData: FormData): Promise<void> {
  const user = await requireRole("admin");
  if (!isLabExecutionEnabled()) redirect("/admin/labs?error=not-enabled");
  const parsed = createLabProjectSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/labs?error=invalid-input");

  const actor = { uid: user.id, email: user.email, emailVerified: true };
  const { data } = await executeUserQuery<{ application: MatchedApplication | null }, { id: string }>(
    "AdminGetMatchedApplicationForLab",
    actor,
    { id: parsed.data.applicationId },
  );
  const application = data.application;
  if (!application || application.status !== "matched" || !application.challenge?.wish?.ownerId) {
    redirect("/admin/labs?error=not-matched");
  }

  try {
    await executeUserMutation(
      "CreateLabProject",
      actor,
      {
        applicationId: application.id,
        challengeId: application.challengeId,
        studentId: application.studentId,
        ownerId: application.challenge.wish.ownerId,
        goal: parsed.data.goal,
        baselineNote: parsed.data.baselineNote,
      },
    );
  } catch {
    // The connector also rejects duplicates and inconsistent matches.
    redirect("/admin/labs?error=create-failed");
  }
  revalidatePath("/admin/labs");
  redirect("/admin/labs?created=1");
}
