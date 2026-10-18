import {
  createLabMilestoneAction, transitionLabMilestoneAction, transitionLabProjectAction,
} from "@/actions/lab-workflow";
import { buttonClass } from "@/components/ui/button";
import type { AdminLabWorkflow } from "@/services/labs";
import {
  getCompletionReadiness, isMilestoneOverdue, isMilestoneStatus, isProjectStatus,
  milestoneNextStates, projectNextStates,
} from "@/lib/lab/workflow-engine";

const projectLabels: Record<string, string> = {
  planning: "計画中", active: "実施中", paused: "中断中",
  completed: "完了", canceled: "中止",
};
const milestoneLabels: Record<string, string> = {
  todo: "未着手", doing: "実施中", blocked: "阻害要因あり", done: "完了",
};
const assigneeLabels: Record<string, string> = {
  admin: "運営", student: "学生担当", shop_owner: "店舗担当",
};

export function LabWorkflowPanel({
  projectId, workflow,
}: { projectId: string; workflow: AdminLabWorkflow }) {
  const status = workflow.labProject?.status;
  if (!status || !isProjectStatus(status)) return null;
  const readiness = getCompletionReadiness(workflow.labMilestones);
  const transitions = projectNextStates(status);
  const editing = status === "planning" || status === "active";
  return <section className="grid gap-6" aria-label="実験進行管理">
    <div className="rounded-3xl border border-line bg-white p-6">
      <h2 className="text-xl font-black">EXPERIMENT · 実験進行管理</h2>
      <p className="mt-2 text-sm text-muted">現状：<strong>{projectLabels[status]}</strong>。変更時は必ず理由を記録し、以前の状態とともに履歴へ残します。</p>
      <p role="status" className="mt-3 rounded-xl bg-[#fff8e7] p-3 text-xs">
        LABの「完了」操作は、DB側の同時更新対策が検証されるまで無効です。
        {readiness.reason === "no_milestones"
          ? " マイルストーンが未登録です。"
          : readiness.reason === "unfinished"
            ? ` 現時点で未完了のマイルストーンが${readiness.pending}件あります。`
            : " マイルストーンの完了記録は揃っています。"}
      </p>
      {transitions.length > 0 && <form action={transitionLabProjectAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="expectedStatus" value={status} />
        <label className="grid gap-1 text-sm">次の進行状態
          <select name="nextStatus" required defaultValue="">
            <option value="" disabled>遷移先を選択</option>
            {transitions.map((s) => (
              <option key={s} value={s}>{projectLabels[s]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">判断理由・引き継ぎ事項（10〜600文字）
          <textarea name="note" required minLength={10} maxLength={600} rows={2}
            placeholder="例：事前検証と役割分担が完了し、実施開始を承認しました。" />
        </label>
        <button className={buttonClass("admin", "min-h-11 rounded-xl sm:col-span-2")}>状態を更新して履歴を保存</button>
      </form>}
    </div>
    <div className="rounded-3xl border border-line bg-white p-6">
      <h2 className="text-xl font-black">マイルストーン（{workflow.labMilestones.length}件）</h2>
      {(workflow.labMilestones.length >= 100 || workflow.labEvents.length >= 300) &&
        <p role="alert" className="mt-3 rounded-xl bg-[#fff8e7] p-3 text-xs">表示上限に達しています。履歴が一部省略されている可能性があります。</p>}
      {editing && <form action={createLabMilestoneAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="projectId" value={projectId} />
        <label className="grid gap-1 text-sm">達成項目
          <input name="title" minLength={5} maxLength={180} required placeholder="例：週末の回遊調査を実施" />
        </label>
        <label className="grid gap-1 text-sm">担当区分
          <select name="assigneeRole" required defaultValue="student">
            <option value="student">学生担当</option>
            <option value="shop_owner">店舗担当</option>
            <option value="admin">運営</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">期限（日本時間）
          <input name="dueDate" type="date" />
        </label>
        <button className={buttonClass("admin", "min-h-11 rounded-xl")}>マイルストーン追加</button>
      </form>}
      <div className="mt-5 grid gap-4">
        {workflow.labMilestones.map((milestone) => {
          const next = isMilestoneStatus(milestone.status) ? milestoneNextStates(milestone.status) : [];
          const overdue = isMilestoneStatus(milestone.status) &&
            isMilestoneOverdue(milestone.dueAt, milestone.status);
          return <article key={milestone.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-black">{milestone.title}</h3>
              <span className="text-xs font-bold text-student">{milestoneLabels[milestone.status] ?? milestone.status}</span>
            </div>
            <p className="mt-2 text-xs text-muted">
              担当：{assigneeLabels[milestone.assigneeRole] ?? "要確認"}
              {milestone.dueAt && ` ／ 期限：${new Date(milestone.dueAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}`}
              {overdue && " ／ 期限超過"}
            </p>
            {status === "active" && next.length > 0 && <form action={transitionLabMilestoneAction}
              className="mt-4 grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="milestoneId" value={milestone.id} />
              <input type="hidden" name="expectedStatus" value={milestone.status} />
              <label className="grid gap-1 text-xs">次の状態
                <select name="nextStatus" required defaultValue="">
                  <option value="" disabled>選択</option>
                  {next.map((s) => <option key={s} value={s}>{milestoneLabels[s]}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs sm:col-span-2">進捗理由（10〜600文字）
                <textarea name="note" minLength={10} maxLength={600} required rows={2} />
              </label>
              <button className={buttonClass("admin", "min-h-11 rounded-xl sm:col-span-2")}>進捗を記録</button>
            </form>}
          </article>;
        })}
        {!workflow.labMilestones.length &&
          <p className="text-sm text-muted">実験の小さな達成目標を登録してください。</p>}
      </div>
    </div>
    <div className="rounded-3xl border border-line bg-white p-6">
      <h2 className="text-xl font-black">変更履歴（追記式）</h2>
      <p className="mt-2 text-xs text-muted">進行状態とマイルストーンの操作履歴は閲覧専用です。記録者と理由を残します。</p>
      <ol className="mt-4 grid gap-3">
        {workflow.labEvents.map((event) => <li key={event.id} className="rounded-xl border border-line p-3 text-xs">
          <p className="font-bold">{event.kind === "project_transition" ? "LAB状態変更" :
            event.kind === "milestone_created" ? "マイルストーン追加" : "進捗変更"}
            {event.previousStatus && `：${event.previousStatus} → ${event.nextStatus ?? "?"}`}
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-6">{event.note}</p>
          <p className="mt-1 text-muted">
            {new Date(event.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
            {" ／ "}記録者：{event.actorId}
          </p>
        </li>)}
        {!workflow.labEvents.length && <li className="text-xs text-muted">状態変更の履歴はまだありません。</li>}
      </ol>
    </div>
  </section>;
}
