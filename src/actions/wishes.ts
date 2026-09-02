"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createFirebaseWorkflowGateway } from "@/features/firebase-workflow-gateway";
import { submitWish } from "@/features/workflows";
import { requireRole } from "@/lib/auth/dal";
import { fieldErrors, formDataObject, wishSchema } from "@/lib/validation";
import type { FormState } from "@/types/domain";

export async function createWishAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("shop_owner");
  const parsed = wishSchema.safeParse(formDataObject(formData));

  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await submitWish(
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
      message: "WISHを保存できませんでした。時間をおいて再度お試しください。",
    };
  }

  revalidatePath("/owner");
  redirect("/owner?created=1");
}
