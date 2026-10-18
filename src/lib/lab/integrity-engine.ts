/**
 * Read-only integrity diagnostics for a *bounded, non-transactional* LAB
 * snapshot. These checks are advisory: they are NOT the database's atomic
 * authorization to complete a project or a substitute for staging tests.
 */
import type { LabMetric, LabObservation } from "@/lib/lab/impact-engine";
import { isMilestoneStatus, isProjectStatus } from "@/lib/lab/workflow-engine";

export type IntegritySeverity = "error" | "warning";
export type IntegrityIssue = {
  code: string;
  severity: IntegritySeverity;
  description: string;
  subjectId?: string;
};
export type IntegrityMilestone = {
  id: string;
  projectId: string;
  status: string;
  assigneeRole: string;
  dueAt: string | null;
};
export type IntegrityEvent = {
  id: string;
  projectId: string;
  kind: string;
  actorId: string;
  note: string;
  previousStatus: string | null;
  nextStatus: string | null;
  createdAt: string;
};
export type IntegritySnapshot = {
  projectId: string;
  status: string;
  milestones: readonly IntegrityMilestone[];
  events: readonly IntegrityEvent[];
  metrics: readonly LabMetric[];
  observations: readonly LabObservation[];
};
export type IntegrityReport = {
  level: "blocked" | "review" | "no_findings";
  issues: IntegrityIssue[];
  observationCount: number;
  milestoneCount: number;
  // Information only; the DB completion mutation remains deliberately closed.
  observedMilestonesAllDone: boolean;
  completionAuthorized: false;
};

const LIMITS = { milestones: 100, events: 300, metrics: 100, observations: 500 } as const;
const roles = new Set(["admin", "student", "shop_owner"]);
const phases = new Set(["baseline", "after"]);
const finiteInstant = (value: string) => Number.isFinite(Date.parse(value));

export function inspectLabIntegrity(snapshot: IntegritySnapshot): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const add = (code: string, severity: IntegritySeverity, description: string, subjectId?: string) => {
    issues.push({ code, severity, description, ...(subjectId ? { subjectId } : {}) });
  };

  const completeSnapshot =
    snapshot.milestones.length < LIMITS.milestones &&
    snapshot.events.length < LIMITS.events &&
    snapshot.metrics.length < LIMITS.metrics &&
    snapshot.observations.length < LIMITS.observations;

  for (const [kind, count, limit] of [
    ["milestones", snapshot.milestones.length, LIMITS.milestones],
    ["events", snapshot.events.length, LIMITS.events],
    ["metrics", snapshot.metrics.length, LIMITS.metrics],
    ["observations", snapshot.observations.length, LIMITS.observations],
  ] as const) {
    if (count >= limit) {
      add("TRUNCATED_" + kind.toUpperCase(), "warning",
        kind + "の取得上限に到達。履歴の全件を検証できない可能性があります。");
    }
  }

  if (!isProjectStatus(snapshot.status)) {
    add("UNKNOWN_PROJECT_STATUS", "error", "案件の状態が許可された値ではありません。");
  }

  const milestoneIds = new Set<string>();
  for (const milestone of snapshot.milestones) {
    if (milestoneIds.has(milestone.id)) {
      add("DUPLICATE_MILESTONE", "error", "同じマイルストーンが複数回取得されました。", milestone.id);
    }
    milestoneIds.add(milestone.id);
    if (milestone.projectId !== snapshot.projectId) {
      add("FOREIGN_MILESTONE", "error", "別案件のマイルストーンが混入しています。", milestone.id);
    }
    if (!isMilestoneStatus(milestone.status)) {
      add("UNKNOWN_MILESTONE_STATUS", "error", "進捗状態が不正です。", milestone.id);
    }
    if (!roles.has(milestone.assigneeRole)) {
      add("UNKNOWN_ASSIGNEE", "error", "担当区分が不正です。", milestone.id);
    }
    if (milestone.dueAt && !finiteInstant(milestone.dueAt)) {
      add("INVALID_DUE_DATE", "error", "期限日時が解釈できません。", milestone.id);
    }
  }

  if (snapshot.status === "completed") {
    if (!completeSnapshot || snapshot.milestones.length === 0 ||
        snapshot.milestones.some((m) => m.status !== "done")) {
      add("INVALID_COMPLETION", "error",
        "完了案件に未完了の工程、工程ゼロ、または取得上限による検証不能が見つかりました。");
    }
  }

  const metricIds = new Set<string>();
  const metricNames = new Set<string>();
  for (const metric of snapshot.metrics) {
    if (metricIds.has(metric.id)) {
      add("DUPLICATE_METRIC", "error", "KPI IDが重複しています。", metric.id);
    }
    metricIds.add(metric.id);
    if (metricNames.has(metric.name)) {
      add("DUPLICATE_METRIC_NAME", "warning", "同名のKPIが重複しています。", metric.id);
    }
    metricNames.add(metric.name);
    if (metric.projectId !== snapshot.projectId) {
      add("FOREIGN_METRIC", "error", "別案件のKPIが混入しています。", metric.id);
    }
    if (metric.direction !== "higher" && metric.direction !== "lower") {
      add("UNKNOWN_DIRECTION", "error", "KPIの改善方向が不正です。", metric.id);
    }
  }

  const observationIds = new Set<string>();
  for (const point of snapshot.observations) {
    if (observationIds.has(point.id)) {
      add("DUPLICATE_OBSERVATION", "error", "観測記録のIDが重複しています。", point.id);
    }
    observationIds.add(point.id);
    if (point.projectId !== snapshot.projectId) {
      add("FOREIGN_OBSERVATION", "error", "別案件の観測記録が混入しています。", point.id);
    }
    // A capped metric list may hide its referenced KPI; do not present a
    // definitive missing-reference error unless the metric list is complete.
    if (!metricIds.has(point.metricId) && snapshot.metrics.length < LIMITS.metrics) {
      add("UNKNOWN_OBSERVATION_METRIC", "error", "観測記録の参照先KPIが確認できません。", point.id);
    }
    if (!phases.has(point.phase) || !Number.isFinite(point.value) ||
        !Number.isInteger(point.windowDays) || point.windowDays < 1 ||
        point.windowDays > 366 || !point.methodNote.trim() ||
        !finiteInstant(point.measuredAt)) {
      add("INVALID_OBSERVATION", "error", "観測値・測定方法・測定日時が不正です。", point.id);
    }
  }

  const eventIds = new Set<string>();
  let latestTransition: IntegrityEvent | null = null;
  for (const event of snapshot.events) {
    if (eventIds.has(event.id)) {
      add("DUPLICATE_EVENT", "error", "監査イベントIDが重複しています。", event.id);
    }
    eventIds.add(event.id);
    if (event.projectId !== snapshot.projectId || !event.actorId.trim() ||
        !event.note.trim() || !finiteInstant(event.createdAt)) {
      add("INVALID_EVENT", "error", "監査イベントの案件・記録者・理由・日時が不正です。", event.id);
    }
    if (event.kind === "project_transition" && finiteInstant(event.createdAt) &&
        (!latestTransition || Date.parse(event.createdAt) > Date.parse(latestTransition.createdAt))) {
      latestTransition = event;
    }
  }

  if (latestTransition && isProjectStatus(snapshot.status) &&
      latestTransition.nextStatus !== snapshot.status) {
    // This is only a warning: independent queries can observe different
    // committed instants, and capped event lists can omit relevant records.
    add("PROJECT_EVENT_MISMATCH", "warning",
      "監査ログの直近状態と現在状態が異なります。別時点の取得や更新競合の可能性があります。",
      latestTransition.id);
  }

  const observedMilestonesAllDone = completeSnapshot &&
    snapshot.milestones.length > 0 &&
    snapshot.milestones.every((m) => m.projectId === snapshot.projectId &&
      isMilestoneStatus(m.status) && m.status === "done");

  const level = issues.some((i) => i.severity === "error") ? "blocked" :
    issues.length > 0 ? "review" : "no_findings";
  return {
    level, issues,
    milestoneCount: snapshot.milestones.length,
    observationCount: snapshot.observations.length,
    observedMilestonesAllDone,
    completionAuthorized: false,
  };
}
