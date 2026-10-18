/**
 * LAB descriptive impact engine, NOT a causal estimator.
 * A before/after delta cannot isolate weather, seasonality, other promotions or
 * a non-randomized comparison group. Never label the result as an effect of LAB.
 */
export type LabMetric = {
  id: string;
  projectId: string;
  name: string;
  unit: string;
  direction: "higher" | "lower";
};

export type LabObservation = {
  id: string;
  projectId: string;
  metricId: string;
  phase: "baseline" | "after";
  value: number;
  windowDays: number;
  methodNote: string;
  evidenceUrl: string | null;
  contextNote: string | null;
  measuredAt: string;
  createdAt: string;
};

export type LabComparisonStatus =
  | "missing_pair"
  | "not_comparable"
  | "needs_evidence"
  | "descriptive_only";

export type LabComparison = {
  metricId: string;
  metricName: string;
  unit: string;
  status: LabComparisonStatus;
  baseline: LabObservation | null;
  after: LabObservation | null;
  delta: number | null;
  changePercent: number | null;
  favorable: boolean | null;
  limitations: string[];
  causalAttribution: "not_established";
};

const round = (n: number) => Math.round(n * 1_000_000) / 1_000_000;

function latest(points: LabObservation[]): LabObservation | null {
  const valid = points.filter((p) => Number.isFinite(Date.parse(p.measuredAt)));
  return valid.sort((a, b) =>
    Date.parse(b.measuredAt) - Date.parse(a.measuredAt) ||
    Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
    b.id.localeCompare(a.id)
  )[0] ?? null;
}

export function compareLabMetric(metric: LabMetric, all: LabObservation[]): LabComparison {
  const eligible = all.filter((p) => p.metricId === metric.id && p.projectId === metric.projectId);
  const baseline = latest(eligible.filter((p) => p.phase === "baseline"));
  const after = latest(eligible.filter((p) => p.phase === "after"));
  const result: LabComparison = {
    metricId: metric.id, metricName: metric.name, unit: metric.unit,
    status: "missing_pair", baseline, after,
    delta: null, changePercent: null, favorable: null,
    limitations: ["実験前後の差分だけでは、実験による因果効果を特定できません。"],
    causalAttribution: "not_established",
  };
  if (!baseline || !after) {
    result.limitations.push("比較に必要な実験前・実験後の観測値が両方揃っていません。");
    return result;
  }
  if (!Number.isFinite(baseline.value) || !Number.isFinite(after.value) ||
    baseline.windowDays < 1 || after.windowDays < 1 ||
    !Number.isInteger(baseline.windowDays) || !Number.isInteger(after.windowDays) ||
    baseline.windowDays !== after.windowDays ||
    !baseline.methodNote.trim() || baseline.methodNote.trim() !== after.methodNote.trim() ||
    Date.parse(after.measuredAt) <= Date.parse(baseline.measuredAt)) {
    result.status = "not_comparable";
    result.limitations.push("測定方法・期間・観測順序が一致しないため差分計算を保留しました。");
    return result;
  }
  const delta = round(after.value - baseline.value);
  result.delta = delta;
  result.changePercent = baseline.value > 0 ? round(delta / baseline.value * 100) : null;
  result.favorable = metric.direction === "higher" ? delta > 0 : delta < 0;
  if (!baseline.evidenceUrl || !after.evidenceUrl) {
    result.status = "needs_evidence";
    result.limitations.push("前後いずれかの根拠URLが未登録です。");
  } else {
    result.status = "descriptive_only";
    result.limitations.push("根拠URLの内容・原本真正性はシステムが独立検証していません。");
  }
  if (baseline.value <= 0) result.limitations.push("基準値が0以下のため変化率は表示しません。");
  if (!baseline.contextNote?.trim() || !after.contextNote?.trim()) {
    result.limitations.push("交絡要因の記録が不足しています。天候や他の施策の影響を確認してください。");
  }
  return result;
}

export function compareLabMetrics(metrics: LabMetric[], all: LabObservation[]): LabComparison[] {
  return metrics.map((metric) => compareLabMetric(metric, all));
}
