import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/ui/status-pill";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getWish } from "@/services/wishes";

export default async function OwnerWishDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("shop_owner");
  const { id } = await params;
  const wish = await getWish(id);
  if (!wish) notFound();
  const fields = [["困っていること・やりたいこと", wish.problem], ["期待する状態", wish.desired_outcome], ["学生と試してみたいこと", wish.experiment_idea], ["希望期間", wish.preferred_period], ["補足", wish.notes]];
  return <DashboardShell role="shop_owner" eyebrow="WISH DETAIL" title={wish.shop_name}><article className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-white p-6 sm:p-9"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-6"><StatusPill status={wish.status} /><span className="text-xs text-muted">登録 {formatDate(wish.created_at)}</span></div><dl className="mt-7 grid gap-7">{fields.map(([label, value]) => value ? <div key={label}><dt className="text-xs font-black tracking-[0.12em] text-owner">{label}</dt><dd className="mt-2 whitespace-pre-wrap leading-8 text-[#465458]">{value}</dd></div> : null)}</dl><div className="mt-8 rounded-2xl bg-owner-soft p-4 text-sm leading-7 text-[#79401f]">運営確認後、Challengeとして公開する内容と店舗情報の公開範囲をご相談します。</div></article></DashboardShell>;
}
