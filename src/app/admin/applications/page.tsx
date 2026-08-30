import { updateApplicationStatusAction } from "@/actions/admin";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonClass } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getAllApplications } from "@/services/applications";

export default async function AdminApplicationsPage() {
  await requireRole("admin");
  const applications = await getAllApplications();
  return <DashboardShell role="admin" eyebrow="KNOT MANAGEMENT" title="応募管理" description="応募情報は運営内部で確認し、商店主への共有範囲を個別に判断します。">{applications.length ? <div className="grid gap-5">{applications.map((application) => <article key={application.id} className="rounded-3xl border border-line bg-white p-5 sm:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-3"><StatusPill status={application.status} /><span className="text-xs text-muted">応募 {formatDate(application.created_at)}</span></div><h2 className="mt-3 text-lg font-black">{application.challenges?.title ?? "Challenge"}</h2><p className="mt-2 text-sm font-bold text-student">{application.profiles?.display_name} · {application.profiles?.university ?? "所属未登録"} {application.profiles?.faculty}</p><dl className="mt-5 grid gap-4 text-sm"><div><dt className="font-black text-muted">応募理由</dt><dd className="mt-1 whitespace-pre-wrap leading-7">{application.motivation}</dd></div><div><dt className="font-black text-muted">経験・スキル</dt><dd className="mt-1 whitespace-pre-wrap leading-7">{application.skills_experience}</dd></div><div><dt className="font-black text-muted">参加可能期間</dt><dd className="mt-1">{application.availability}</dd></div></dl></div><form action={updateApplicationStatusAction} className="flex shrink-0 flex-col gap-2 sm:flex-row"><input type="hidden" name="applicationId" value={application.id} /><select name="status" defaultValue={application.status} aria-label={`${application.profiles?.display_name}の応募状態`} className="min-w-40 text-sm"><option value="applied">応募済み</option><option value="reviewing">確認中</option><option value="interview">面談</option><option value="matched">マッチング成立</option><option value="not_selected">今回は見送り</option><option value="withdrawn">辞退</option></select><button className={buttonClass("admin", "rounded-xl px-4")}>更新</button></form></div></article>)}</div> : <EmptyState title="応募はまだありません" body="学生から応募が届くと、ここで内容とステータスを確認できます。" />}</DashboardShell>;
}
