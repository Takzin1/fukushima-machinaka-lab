import "server-only";

import { requireRole, requireUser } from "@/lib/auth/dal";
import { executeUserQuery } from "@/lib/firebase/data-connect";
import { mapWish, type DataRecord } from "@/lib/firebase/mappers";
import type { Wish } from "@/types/domain";

export async function getOwnerWishes(ownerId: string): Promise<Wish[]> {
  const user = await requireRole("shop_owner");
  if (ownerId !== user.id) throw new Error("FORBIDDEN");
  const response = await executeUserQuery<{ wishes: DataRecord[] }>(
    "ListOwnerWishes",
    { uid: user.id, email: user.email, emailVerified: true },
  );
  return response.data.wishes.map(mapWish);
}

export async function getWish(id: string): Promise<Wish | null> {
  const user = await requireUser();
  const actor = { uid: user.id, email: user.email, emailVerified: true };
  if (user.profile.role === "admin") {
    const response = await executeUserQuery<{ wish: DataRecord | null }, { id: string }>(
      "AdminGetWish",
      actor,
      { id },
    );
    return response.data.wish ? mapWish(response.data.wish) : null;
  }

  const response = await executeUserQuery<
    { wishes: DataRecord[] },
    { id: string }
  >("GetOwnedWish", actor, { id });
  const row = response.data.wishes[0];
  return row ? mapWish(row) : null;
}

export async function getAllWishes(): Promise<Wish[]> {
  const user = await requireRole("admin");
  const response = await executeUserQuery<{ wishes: DataRecord[] }>(
    "AdminListWishes",
    { uid: user.id, email: user.email, emailVerified: true },
  );
  return response.data.wishes.map(mapWish);
}
