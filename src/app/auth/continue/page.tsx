import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";

export default async function ContinuePage() {
  const user = await requireUser();

  if (user.profile.role === "admin") redirect("/admin");
  if (user.profile.role === "shop_owner") redirect("/owner");
  redirect("/student");
}
