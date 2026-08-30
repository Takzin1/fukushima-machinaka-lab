import { notFound } from "next/navigation";
import { ChallengeForm } from "@/components/forms/challenge-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusPill } from "@/components/ui/status-pill";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getWish } from "@/services/wishes";

export default async function AdminWishDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const wish = await getWish(id);
  if (!wish) notFound();
  return <DashboardShell role="admin" eyebrow="WISH REVIEW" title={wish.shop_name} description="非公開情報を確認し、公開用Challengeへ編集します。"><div className="grid gap-7 xl:grid-cols-[.8fr_1.2fr]"><article className="h-fit rounded-[2rem] border border-line bg-white p-6"><div className="flex items-center justify-between"><StatusPill status={wish.status} /><span className="text-xs text-muted">{formatDate(wish.created_at)}</span></div><dl className="mt-7 grid gap-5 text-sm"><div><dt className="font-black text-muted">担当・連絡先（非公開）</dt><dd className="mt-1 leading-7">{wish.contact_name}<br />{wish.contact_email}<br />{wish.address ?? "住所未登録"}</dd></div><div><dt className="font-black text-muted">業種</dt><dd className="mt-1">{wish.industry}</dd></div><div><dt className="font-black text-muted">困っていること・やりたいこと</dt><dd className="mt-2 whitespace-pre-wrap leading-7">{wish.problem}</dd></div><div><dt className="font-black text-muted">期待する状態</dt><dd className="mt-2 whitespace-pre-wrap leading-7">{wish.desired_outcome}</dd></div>{wish.experiment_idea ? <div><dt className="font-black text-muted">試したいこと</dt><dd className="mt-2 whitespace-pre-wrap leading-7">{wish.experiment_idea}</dd></div> : null}</dl></article><div className="rounded-[2rem] border border-line bg-white p-6 sm:p-8"><div className="mb-7"><p className="text-xs font-black tracking-[0.18em] text-admin">CONVERT TO CHALLENGE</p><h2 className="mt-2 text-2xl font-black">学生向けの問いへ編集</h2></div><ChallengeForm wish={wish} /></div></div></DashboardShell>;
}
