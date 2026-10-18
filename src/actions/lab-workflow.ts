"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/dal";
import { executeUserMutation } from "@/lib/firebase/data-connect";
import {
  canTransitionProject, canTransitionMilestone,
  isMilestoneStatus, isProjectStatus,
} from "@/lib/lab/workflow-engine";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";
import {
  createLabMilestoneSchema, formDataObject,
  transitionLabMilestoneSchema, transitionLabProjectSchema,
} from "@/lib/validation";
import { getAdminLabWorkflow } from "@/services/labs";

function detail(id: string, query: string) {
  return `/admin/labs/${id}?${query}`;
}

export async function transitionLabProjectAction(formData: FormData): Promise<void> {
  const actor = await requireRole("admin");
  if (!isLabExecutionEnabled()) redirect("/admin/labs?error=lab-disabled");
  const parsed = transitionLabProjectSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/labs?error=invalid-transition");
  const input = parsed.data;
  const workflow = await getAdminLabWorkflow(input.projectId);
  const current = workflow?.labProject?.status;
  if (!current || !isProjectStatus(current) || current !== input.expectedStatus ||
      !canTransitionProject(current, input.nextStatus)) {
    redirect(detail(input.projectId, "error=stale-transition"));
  }
  // Explicitly fail closed even if the UI or state table is modified later.
  // Completion needs an atomic DB invariant, not a pre-transaction snapshot.
  if (input.nextStatus === "completed") {
    redirect(detail(input.projectId, "error=completion-locked"));
  }
  try {
    await executeUserMutation("TransitionLabProject",
      { uid: actor.id, email: actor.email, emailVerified: true },
      { id: input.projectId, expectedStatus: input.expectedStatus,
        nextStatus: input.nextStatus, note: input.note });
  } catch {
    redirect(detail(input.projectId, "error=transition-failed"));
  }
  revalidatePath("/admin/labs");
  revalidatePath(`/admin/labs/${input.projectId}`);
  redirect(detail(input.projectId, "updated=1"));
}

export async function createLabMilestoneAction(formData: FormData): Promise<void> {
  const actor = await requireRole("admin");
  if (!isLabExecutionEnabled()) redirect("/admin/labs?error=lab-disabled");
  const parsed = createLabMilestoneSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/labs?error=invalid-milestone");
  const input = parsed.data;
  const workflow = await getAdminLabWorkflow(input.projectId);
  if (!workflow?.labProject || !["planning", "active"].includes(workflow.labProject.status)) {
    redirect(detail(input.projectId, "error=project-not-editable"));
  }
  const dueAt = input.dueDate
    ? new Date(`${input.dueDate}T23:59:59+09:00`).toISOString()
    : null;
  try {
    await executeUserMutation("CreateLabMilestone",
      { uid: actor.id, email: actor.email, emailVerified: true },
      { id: randomUUID(), projectId: input.projectId, title: input.title,
        assigneeRole: input.assigneeRole, dueAt });
  } catch {
    redirect(detail(input.projectId, "error=milestone-create-failed"));
  }
  revalidatePath(`/admin/labs/${input.projectId}`);
  redirect(detail(input.projectId, "milestone-created=1"));
}

export async function transitionLabMilestoneAction(formData: FormData): Promise<void> {
  const actor = await requireRole("admin");
  if (!isLabExecutionEnabled()) redirect("/admin/labs?error=lab-disabled");
  const parsed = transitionLabMilestoneSchema.safeParse(formDataObject(formData));
  if (!parsed.success) redirect("/admin/labs?error=invalid-milestone-transition");
  const input = parsed.data;
  const workflow = await getAdminLabWorkflow(input.projectId);
  if (workflow?.labProject?.status !== "active") {
    redirect(detail(input.projectId, "error=project-not-active"));
  }
  const milestone = workflow.labMilestones.find((m) => m.id === input.milestoneId);
  if (!milestone || milestone.projectId !== input.projectId ||
      !isMilestoneStatus(milestone.status) ||
      milestone.status !== input.expectedStatus ||
      !canTransitionMilestone(milestone.status, input.nextStatus)) {
    redirect(detail(input.projectId, "error=stale-milestone"));
  }
  try {
    await executeUserMutation("TransitionLabMilestone",
      { uid: actor.id, email: actor.email, emailVerified: true },
      { id: input.milestoneId, projectId: input.projectId,
        expectedStatus: input.expectedStatus, nextStatus: input.nextStatus,
        note: input.note });
  } catch {
    redirect(detail(input.projectId, "error=milestone-transition-failed"));
  }
  revalidatePath(`/admin/labs/${input.projectId}`);
  redirect(detail(input.projectId, "milestone-updated=1"));
}
