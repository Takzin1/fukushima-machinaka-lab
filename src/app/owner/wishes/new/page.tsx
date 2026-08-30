import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { WishForm } from "@/components/forms/wish-form";
import { requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "WISHを登録" };
export default async function NewWishPage() {
  const user = await requireRole("shop_owner");
  return <DashboardShell role="shop_owner" eyebrow="NEW WISH" title="まずは、そのまま聞かせてください。" description="完成した企画にする必要はありません。運営が確認し、必要に応じて聞き取りを行います。"><div className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-white p-5 sm:p-9"><WishForm defaultEmail={user.email} /></div></DashboardShell>;
}
