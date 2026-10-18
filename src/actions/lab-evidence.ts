"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { executeUserMutation } from "@/lib/firebase/data-connect";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";
import { createLabMetricSchema, formDataObject, recordLabObservationSchema } from "@/lib/validation";

export async function createLabMetricAction(formData: FormData): Promise<void> {
  const user = await requireRole("admin");
  if (!isLabExecutionEnabled()) redirect("/admin/labs?error=lab-disabled");
  const parsed = createLabMetricSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/labs?error=invalid-metric");
  const input = parsed.data;
  try {
    await executeUserMutation("CreateLabMetric",
      { uid: user.id, email: user.email, emailVerified: true },
      input);
  } catch {
    redirect("/admin/labs?error=metric-failed");
  }
  revalidatePath(`/admin/labs/${input.projectId}`);
  redirect(`/admin/labs/${input.projectId}?metric-created=1`);
}

export async function recordLabObservationAction(formData: FormData): Promise<void> {
  const user = await requireRole("admin");
  if (!isLabExecutionEnabled()) redirect("/admin/labs?error=lab-disabled");
  const parsed = recordLabObservationSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/labs?error=invalid-observation");
  const input = parsed.data;
  // Date-only input is recorded at noon in Japan to preserve the intended date.
  const measuredAt = new Date(`${input.measuredDate}T12:00:00+09:00`).toISOString();
  try {
    await executeUserMutation("RecordLabObservation",
      { uid: user.id, email: user.email, emailVerified: true },
      {
        projectId: input.projectId,
        metricId: input.metricId,
        phase: input.phase,
        value: input.value,
        windowDays: input.windowDays,
        methodNote: input.methodNote,
        evidenceUrl: input.evidenceUrl,
        contextNote: input.contextNote,
        measuredAt,
      },
    );
  } catch {
    redirect("/admin/labs?error=observation-failed");
  }
  revalidatePath(`/admin/labs/${input.projectId}`);
  redirect(`/admin/labs/${input.projectId}?observation-created=1`);
}
