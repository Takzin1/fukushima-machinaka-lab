import "server-only";
import { requireRole } from "@/lib/auth/dal";
import { executeUserQuery } from "@/lib/firebase/data-connect";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";

export type AdminLabProject = {
  id: string;
  applicationId: string;
  challengeId: string;
  studentId: string;
  ownerId: string;
  goal: string;
  baselineNote: string | null;
  status: string;
  createdAt: string;
  challenge: { title: string };
  student: { displayName: string };
};

export async function getAdminLabProjects(): Promise<AdminLabProject[]> {
  const user = await requireRole("admin");
  if (!isLabExecutionEnabled()) return [];
  const { data } = await executeUserQuery<{ labProjects: AdminLabProject[] }>(
    "AdminListLabProjects",
    { uid: user.id, email: user.email, emailVerified: true },
  );
  return data.labProjects;
}

import type { LabMetric, LabObservation } from "@/lib/lab/impact-engine";

export type LabEvidenceOverview = {
  labProject: { id: string; challengeId: string; goal: string; status: string; challenge: { title: string } } | null;
  labMetrics: LabMetric[];
  labObservations: LabObservation[];
};

export async function getAdminLabEvidence(id: string): Promise<LabEvidenceOverview | null> {
  const user = await requireRole("admin");
  if (!isLabExecutionEnabled()) return null;
  const { data } = await executeUserQuery<LabEvidenceOverview, { id: string }>(
    "AdminGetLabEvidence",
    { uid: user.id, email: user.email, emailVerified: true },
    { id },
  );
  return data.labProject ? data : null;
}

import type { LabProjectStatus, LabMilestoneStatus, LabAssigneeRole } from "@/lib/lab/workflow-engine";

export type AdminLabMilestone = {
  id: string;
  projectId: string;
  title: string;
  assigneeRole: LabAssigneeRole;
  dueAt: string | null;
  status: LabMilestoneStatus;
  createdAt: string;
  updatedAt: string;
};
export type AdminLabEvent = {
  id: string;
  projectId: string;
  actorId: string;
  kind: string;
  subjectId: string | null;
  previousStatus: string | null;
  nextStatus: string | null;
  note: string;
  createdAt: string;
};
export type AdminLabWorkflow = {
  labProject: {
    id: string;
    status: LabProjectStatus;
    goal: string;
    challenge: { title: string };
  } | null;
  labMilestones: AdminLabMilestone[];
  labEvents: AdminLabEvent[];
};
export async function getAdminLabWorkflow(id: string): Promise<AdminLabWorkflow | null> {
  const user = await requireRole("admin");
  if (!isLabExecutionEnabled()) return null;
  const { data } = await executeUserQuery<AdminLabWorkflow, { id: string }>(
    "AdminGetLabWorkflow",
    { uid: user.id, email: user.email, emailVerified: true },
    { id },
  );
  return data.labProject ? data : null;
}
