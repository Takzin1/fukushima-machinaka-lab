import "server-only";

import { requireRole } from "@/lib/auth/dal";
import { executeUserQuery } from "@/lib/firebase/data-connect";
import {
  mapApplicationWithContext,
  type DataRecord,
} from "@/lib/firebase/mappers";

export async function getStudentApplications(studentId: string) {
  const user = await requireRole("student");
  if (studentId !== user.id) throw new Error("FORBIDDEN");
  const response = await executeUserQuery<{ applications: DataRecord[] }>(
    "ListStudentApplications",
    { uid: user.id, email: user.email, emailVerified: true },
  );
  return response.data.applications.map(mapApplicationWithContext);
}

export async function getAllApplications() {
  const user = await requireRole("admin");
  const response = await executeUserQuery<{ applications: DataRecord[] }>(
    "AdminListApplications",
    { uid: user.id, email: user.email, emailVerified: true },
  );
  return response.data.applications.map(mapApplicationWithContext);
}
