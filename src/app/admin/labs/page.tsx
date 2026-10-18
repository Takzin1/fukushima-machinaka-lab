import { createLabProjectAction } from "@/actions/labs";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth/dal";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";
import { getAllApplications } from "@/services/applications";
import { getAdminLabProjects } from "@/services/labs";
import { buttonClass } from "@/components/ui/button";

export default async function AdminLabsPage() {
  await requireRole("admin");
  if (!isLabExecutionEnabled()) {
    return <DashboardShell role="admin" eyebrow="LAB EXECUTION" title="LAB進捗"
      description="LAB管理機能はデータベース移行と認可検証が終わるまで利用できません。">
      <p className="rounded-2xl border border-line bg-white p-6 text-sm text-muted">
        現在は準備中です。運営がマッチングを確定した後、実験目標と初期測定を記録する予定です。
      </p>
    </DashboardShell>;
  }
  const [projects, applications] = await Promise.all([
    getAdminLabProjects(), getAllApplications(),
  ]);
  const matched = applications.filter((item) => item.status === "matched");
  return <DashboardShell role="admin" eyebrow="LAB EXECUTION" title="LAB進捗"
    description="成立したマッチングから地域実験を起動し、目標と実施前の状況を記録します。">
    <div className="grid gap-6">
      <section className="rounded-3xl border border-line bg-white p-6">
        <h2 className="text-xl font-black">新しいLABを開始</h2>
        <p className="mt-2 text-sm leading-7 text-muted">学生と商店主の合意確認後に登録してください。ひとつの応募につきLABは1件だけです。</p>
        <form action={createLabProjectAction} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm">
            対象のマッチング済み応募
            <select name="applicationId" required defaultValue="">
              <option value="" disabled>応募を選択</option>
              {matched.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.challenges?.title ?? "Challenge"} / {item.profiles?.display_name ?? "学生"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            実験目標（10〜300文字）
            <textarea name="goal" minLength={10} maxLength={300} required />
          </label>
          <label className="grid gap-2 text-sm">
            実施前の状況・比較基準
            <textarea name="baselineNote" maxLength={1200} />
          </label>
          <button disabled={!matched.length} className={buttonClass("admin", "min-h-11 rounded-xl disabled:opacity-40")}>LAB案件を作成</button>
        </form>
      </section>
      <section>
        <h2 className="text-xl font-black">進行案件（{projects.length}件）</h2>
        <div className="mt-4 grid gap-4">
          {projects.map((item) => (
            <article key={item.id} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs font-bold text-student">{item.status} · {item.challenge.title}</p>
              <h3 className="mt-2 font-black">{item.goal}</h3>
              <Link href={`/admin/labs/${item.id}`} className="mt-3 inline-block text-sm font-bold text-student underline">KPI・測定記録を管理する →</Link>
              <p className="mt-2 text-sm text-muted">参加学生：{item.student.displayName}</p>
              {item.baselineNote && <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{item.baselineNote}</p>}
            </article>
          ))}
          {!projects.length && <p className="rounded-xl border border-line bg-white p-5 text-sm text-muted">LAB案件はまだありません。</p>}
        </div>
      </section>
    </div>
  </DashboardShell>;
}
