import { updateChallengeStatusAction, updateChallengeMapLocationAction } from "@/actions/admin";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonClass } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getAllChallenges } from "@/services/challenges";
import { isPublicMapDataEnabled } from "@/lib/map/rollout";

export default async function AdminChallengesPage() {
  await requireRole("admin");
  const challenges = await getAllChallenges();
  const mapDataReady = isPublicMapDataEnabled();
  return (
    <DashboardShell role="admin" eyebrow="CHALLENGE MANAGEMENT" title="Challenge管理"
      description="Challengeの公開と地図への位置情報公開は、別々に承認・管理します。">
      {!mapDataReady && <p className="rounded-xl border border-line bg-white p-4 text-sm">地図登録はCloud SQLのスキーマ更新と接続確認後に有効になります。</p>}
      {challenges.length ? (
        <div className="grid gap-4">
          {challenges.map((challenge) => (
            <article key={challenge.id} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-student">{challenge.category}</span>
                    <StatusPill status={challenge.status} />
                    {challenge.is_sample ? <span className="text-xs text-muted">SAMPLE</span> : null}
                  </div>
                  <h2 className="mt-2 text-lg font-black">{challenge.title}</h2>
                  <p className="mt-2 text-xs text-muted">締切 {formatDate(challenge.deadline)} · {challenge.capacity}名</p>
                </div>
                <form action={updateChallengeStatusAction} className="flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <select name="status" defaultValue={challenge.status} aria-label={`${challenge.title}の公開状態`} className="min-w-36 text-sm">
                    <option value="draft">下書き</option>
                    <option value="published">公開中</option>
                    <option value="closed">終了</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                  <button className={buttonClass("admin", "min-h-11 rounded-xl px-4")}>更新</button>
                </form>
              </div>
              {mapDataReady && <details className="mt-5 border-t border-line pt-4">
                <summary className="cursor-pointer text-sm font-bold text-student">地図掲載設定（管理者のみ）</summary>
                <p className="mt-3 text-xs leading-6 text-muted">
                  非公開のWISH住所は自動取得しません。店舗の承諾と位置の確認を済ませた場合にだけ公開してください。
                  「エリア概略」の場合、実際の店舗位置ではなく公開可能な代表地点を指定してください。
                </p>
                <form action={updateChallengeMapLocationAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="challengeId" value={challenge.id} />
                  <label className="grid gap-1 text-xs">
                    緯度（例：37.75）
                    <input name="latitude" type="number" step="any" min="-90" max="90" required defaultValue={challenge.map_latitude ?? ""} />
                  </label>
                  <label className="grid gap-1 text-xs">
                    経度（例：140.46）
                    <input name="longitude" type="number" step="any" min="-180" max="180" required defaultValue={challenge.map_longitude ?? ""} />
                  </label>
                  <label className="grid gap-1 text-xs">
                    地図に表示する公開ラベル
                    <input name="label" maxLength={120} required defaultValue={challenge.map_label ?? ""} placeholder="例：すずらん通り周辺（概略）" />
                  </label>
                  <label className="grid gap-1 text-xs">
                    公開精度
                    <select name="precision" defaultValue={challenge.map_precision ?? "area"}>
                      <option value="area">エリア概略</option>
                      <option value="exact">正確な公開地点</option>
                    </select>
                  </label>
                  <label className="flex items-start gap-2 rounded-xl bg-[#f7f9f8] p-3 text-xs sm:col-span-2">
                    <input type="checkbox" name="approved" defaultChecked={challenge.map_approved} />
                    公開許可と地点を確認済み（チェックなしで保存すると地図非表示）
                  </label>
                  <button className={buttonClass("admin", "min-h-11 rounded-xl sm:col-span-2")}>地図設定を保存</button>
                </form>
              </details>}
            </article>
          ))}
        </div>
      ) : <EmptyState title="Challengeはまだありません" body="WISHレビュー画面から最初のChallengeを作成してください。" />}
    </DashboardShell>
  );
}
