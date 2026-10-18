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
