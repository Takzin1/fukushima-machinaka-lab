"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSupabaseWorkflowGateway,
  publishChallenge,
} from "@/features/workflows";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    await publishChallenge(
      { id: user.id, role: user.profile.role },
      parsed.data,
      createSupabaseWorkflowGateway(supabase),
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
  await requireRole("admin");
  const parsed = applicationStatusSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/applications?error=invalid-status");

  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.applicationId);

  if (error) redirect("/admin/applications?error=update-failed");
  revalidatePath("/admin/applications");
  redirect("/admin/applications?updated=1");
}

const challengeStatusSchema = z.object({
  challengeId: z.string().uuid(),
  status: z.enum(["draft", "published", "closed", "archived"]),
});

export async function updateChallengeStatusAction(formData: FormData) {
  await requireRole("admin");
  const parsed = challengeStatusSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/challenges?error=invalid-status");

  const supabase = await createClient();
  const { error } = await supabase
    .from("challenges")
    .update({
      status: parsed.data.status,
      published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.challengeId);

  if (error) redirect("/admin/challenges?error=update-failed");
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
  redirect("/admin/challenges?updated=1");
}
