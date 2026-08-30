import type { UserRole } from "@/types/domain";

export type Permission =
  | "wish:create"
  | "challenge:publish"
  | "application:create"
  | "application:review";

const permissions: Record<UserRole, Permission[]> = {
  shop_owner: ["wish:create"],
  student: ["application:create"],
  admin: ["challenge:publish", "application:review"],
};

export function canPerform(role: UserRole, permission: Permission) {
  return permissions[role].includes(permission);
}

export function assertPermission(role: UserRole, permission: Permission) {
  if (!canPerform(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
