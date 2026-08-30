import { updateChallengeStatusAction } from "@/actions/admin";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonClass } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getAllChallenges } from "@/services/challenges";

export default async function AdminChallengesPage() {
  await requireRole("admin");
  const challenges = await getAllChallenges();
  return <DashboardShell role="admin" eyebrow="CHALLENGE MANAGEMENT" title="Challenge管理" description="公開状態を変更すると公開一覧へ即時反映されます。">{challenges.length ? <div className="grid gap-4">{challenges.map((challenge) => <article key={challenge.id} className="rounded-3xl border border-line bg-white p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><span className="text-xs font-bold text-student">{challenge.category}</span><StatusPill status={challenge.status} />{challenge.is_sample ? <span className="text-xs text-muted">SAMPLE</span> : null}</div><h2 className="mt-2 text-lg font-black">{challenge.title}</h2><p className="mt-2 text-xs text-muted">締切 {formatDate(challenge.deadline)} · {challenge.capacity}名</p></div><form action={updateChallengeStatusAction} className="flex flex-col gap-2 sm:flex-row"><input type="hidden" name="challengeId" value={challenge.id} /><select name="status" defaultValue={challenge.status} aria-label={`${challenge.title}の公開状態`} className="min-w-36 text-sm"><option value="draft">下書き</option><option value="published">公開中</option><option value="closed">終了</option><option value="archived">アーカイブ</option></select><button className={buttonClass("admin", "min-h-11 rounded-xl px-4")}>更新</button></form></div></article>)}</div> : <EmptyState title="Challengeはまだありません" body="WISHレビュー画面から最初のChallengeを作成してください。" />}</DashboardShell>;
}
