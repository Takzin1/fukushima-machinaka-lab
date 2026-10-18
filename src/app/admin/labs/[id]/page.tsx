import Link from "next/link";
import { notFound } from "next/navigation";
import { createLabMetricAction, recordLabObservationAction } from "@/actions/lab-evidence";
import { DashboardShell } from "@/components/dashboard-shell";
import { buttonClass } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { compareLabMetrics } from "@/lib/lab/impact-engine";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";
import { getAdminLabEvidence } from "@/services/labs";

export const dynamic = "force-dynamic";

export default async function AdminLabDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  if (!isLabExecutionEnabled()) {
    return <DashboardShell role="admin" eyebrow="LAB EVIDENCE" title="実験の測定記録"
      description="データベース移行と認可テストが完了するまで測定エンジンは無効です。">
      <Link href="/admin/labs" className="text-sm font-bold text-student underline">LAB一覧へ戻る</Link>
    </DashboardShell>;
  }
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const data = await getAdminLabEvidence(id);
  if (!data?.labProject) notFound();
  const { labProject: project, labMetrics: metrics, labObservations: observations } = data;
  const comparisons = compareLabMetrics(metrics, observations);
  return <DashboardShell role="admin" eyebrow="LAB IMPACT ENGINE"
    title={project.challenge.title}
    description="実験前後の測定記録を保存し、比較可能性と根拠の不足を検査します。差分は因果効果の推定ではありません。">
    <div className="grid gap-8">
      <div className="flex items-center gap-3 text-sm">
        <Link href="/admin/labs" className="font-bold text-student underline">LAB案件へ戻る</Link>
        <span className="text-muted">状態：{project.status}</span>
      </div>
      {(metrics.length >= 100 || observations.length >= 500) && (
        <p role="alert" className="rounded-xl border border-line bg-white p-4 text-sm">
          データ取得上限に達しました。表示した測定記録・比較結果は全件を網羅していない可能性があります。
        </p>
      )}
      <section className="rounded-3xl border border-line bg-white p-6">
        <h2 className="text-xl font-black">1. 評価指標（KPI）を定義する</h2>
        <p className="mt-2 text-sm text-muted">例：来店人数／人／増加が望ましい。単位と測定方法を決めてから値を登録します。</p>
        <form action={createLabMetricAction} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="projectId" value={id} />
          <label className="grid gap-1 text-sm">指標名
            <input name="name" minLength={3} maxLength={120} required placeholder="例：7日間の来店人数" />
          </label>
          <label className="grid gap-1 text-sm">単位
            <input name="unit" maxLength={20} required placeholder="人／件／円" />
          </label>
          <label className="grid gap-1 text-sm">望ましい変化
            <select name="direction" defaultValue="higher">
              <option value="higher">増加が望ましい</option>
              <option value="lower">減少が望ましい</option>
            </select>
          </label>
          <button className={buttonClass("admin", "min-h-11 rounded-xl sm:col-span-2")}>KPIを登録</button>
        </form>
      </section>
      <section className="rounded-3xl border border-line bg-white p-6">
        <h2 className="text-xl font-black">2. 観測を追加する</h2>
        <p className="mt-2 text-sm leading-7 text-muted">実験前・実験後とも、同じ手法と同じ観測日数で記録してください。追記式のため以前の値は残ります。</p>
        <form action={recordLabObservationAction} className="mt-5 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="projectId" value={id} />
          <label className="grid gap-1 text-sm">対象KPI
            <select name="metricId" required defaultValue="">
              <option value="" disabled>指標を選択</option>
              {metrics.map((metric) => <option key={metric.id} value={metric.id}>{metric.name}（{metric.unit}）</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">観測フェーズ
            <select name="phase" defaultValue="baseline">
              <option value="baseline">実験前</option>
              <option value="after">実験後</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">観測値
            <input name="value" type="number" step="any" required placeholder="例：104" />
          </label>
          <label className="grid gap-1 text-sm">観測日数
            <input name="windowDays" type="number" min={1} max={366} step={1} defaultValue={7} required />
          </label>
          <label className="grid gap-1 text-sm">測定日（日本時間）
            <input name="measuredDate" type="date" required />
          </label>
          <label className="grid gap-1 text-sm">測定方法（前後で完全一致）
            <input name="methodNote" required minLength={5} maxLength={240} placeholder="例：POS集計・営業時間内" />
          </label>
          <label className="grid gap-1 text-sm">根拠URL（HTTPSのみ）
            <input name="evidenceUrl" type="url" maxLength={500} placeholder="https://..." />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">天候・他施策・営業時間などの外部要因
            <textarea name="contextNote" maxLength={1200} rows={3} />
          </label>
          <button disabled={!metrics.length} className={buttonClass("admin", "min-h-11 rounded-xl sm:col-span-2 disabled:opacity-40")}>観測記録を保存</button>
        </form>
      </section>
      <section>
        <h2 className="text-xl font-black">3. 検証結果（{comparisons.length}指標）</h2>
        <p className="mt-2 text-sm leading-7 text-muted">以下は観測値の記述的な差分のみ。実験以外の要因を排除していないため、増減を実験の効果とは断定しません。</p>
        <div className="mt-4 grid gap-4">
          {comparisons.map((item) => (
            <article key={item.metricId} className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-lg font-black">{item.metricName} <span className="text-sm font-normal text-muted">({item.unit})</span></h3>
              <p className="mt-2 text-xs font-bold text-student">判定：{item.status === "missing_pair" ? "比較に必要な観測が不足" : item.status === "not_comparable" ? "比較条件が不一致" : item.status === "needs_evidence" ? "根拠URL不足（暫定差分）" : "記述的比較のみ"}</p>
              <p className="mt-3 text-sm">実験前：{item.baseline?.value ?? "未登録"} ／ 実験後：{item.after?.value ?? "未登録"}</p>
              <p className="mt-2 font-bold">差分：{item.delta === null ? "算出保留" : `${item.delta > 0 ? "+" : ""}${item.delta} ${item.unit}`}
                {item.changePercent !== null ? `（${item.changePercent > 0 ? "+" : ""}${item.changePercent}%）` : ""}
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-6 text-muted">
                {item.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
              </ul>
            </article>
          ))}
          {!comparisons.length && <p className="rounded-xl border border-line bg-white p-5 text-sm text-muted">まずKPIを登録してください。</p>}
        </div>
      </section>
      <section className="rounded-3xl border border-line bg-white p-6">
        <h2 className="text-xl font-black">4. 測定履歴（追記式）</h2>
        <div className="mt-4 grid gap-3">
          {observations.map((obs) => {
            const metric = metrics.find((m) => m.id === obs.metricId);
            const safeUrl = obs.evidenceUrl && URL.canParse(obs.evidenceUrl) && new URL(obs.evidenceUrl).protocol === "https:"
              ? obs.evidenceUrl : null;
            return <article key={obs.id} className="rounded-xl border border-line p-4 text-sm">
              <p className="font-bold">{metric?.name ?? "KPI"}：{obs.value} {metric?.unit ?? ""}（{obs.phase === "baseline" ? "実験前" : "実験後"}）</p>
              <p className="mt-2 text-xs text-muted">{new Date(obs.measuredAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })} ／ {obs.windowDays}日間 ／ {obs.methodNote}</p>
              {obs.contextNote && <p className="mt-2 whitespace-pre-wrap text-xs text-muted">外部要因：{obs.contextNote}</p>}
              {safeUrl && <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-bold text-student underline">根拠資料を開く（未検証）</a>}
            </article>;
          })}
          {!observations.length && <p className="text-sm text-muted">まだ測定記録はありません。</p>}
        </div>
      </section>
    </div>
  </DashboardShell>;
}
