import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getStudentApplications } from "@/services/applications";

export default async function StudentApplicationsPage() {
  const user = await requireRole("student");
  const applications = await getStudentApplications(user.id);
  return <DashboardShell role="student" eyebrow="MY APPLICATIONS" title="応募履歴" description="ステータスは運営による確認状況を表します。"><div className="grid gap-4">{applications.length ? applications.map((application) => <article key={application.id} className="rounded-3xl border border-line bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold text-student">{application.challenges?.shop_display_name}</p><h2 className="mt-2 text-lg font-black">{application.challenges?.title ?? "Challenge"}</h2><p className="mt-3 line-clamp-2 text-sm leading-7 text-muted">{application.motivation}</p></div><div className="text-right"><StatusPill status={application.status} /><p className="mt-2 text-xs text-muted">{formatDate(application.created_at)}</p></div></div></article>) : <EmptyState title="応募履歴はありません" body="公開中のChallengeから、興味のあるテーマを探してみましょう。" />}</div></DashboardShell>;
}
