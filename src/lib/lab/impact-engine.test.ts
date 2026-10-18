import { describe, expect, it } from "vitest";
import { compareLabMetric, compareLabMetrics, type LabMetric, type LabObservation } from "@/lib/lab/impact-engine";

const metric: LabMetric = { id: "m1", projectId: "p1", name: "来客数", unit: "人", direction: "higher" };
const baseline: LabObservation = {
  id: "o1", projectId: "p1", metricId: "m1", phase: "baseline",
  value: 100, windowDays: 7, methodNote: "POS週次集計",
  evidenceUrl: "https://example.com/before", contextNote: "雨の日あり",
  measuredAt: "2026-10-01T00:00:00.000Z", createdAt: "2026-10-01T00:00:01Z",
};
const after: LabObservation = {
  ...baseline, id: "o2", phase: "after", value: 120,
  evidenceUrl: "https://example.com/after",
  measuredAt: "2026-10-15T00:00:00.000Z", createdAt: "2026-10-15T00:00:01Z",
};
describe("LAB impact engine", () => {
  it("computes auditable descriptive deltas, never causal effectiveness", () => {
    const x = compareLabMetric(metric, [baseline, after]);
    expect(x.status).toBe("descriptive_only");
    expect(x.delta).toBe(20);
    expect(x.changePercent).toBe(20);
    expect(x.favorable).toBe(true);
    expect(x.causalAttribution).toBe("not_established");
  });
  it("tracks lower-is-better without changing arithmetic", () => {
    const x = compareLabMetric({ ...metric, direction: "lower" }, [baseline, after]);
    expect(x.delta).toBe(20);
    expect(x.favorable).toBe(false);
  });
  it("never compares mismatched observation windows", () => {
    const x = compareLabMetric(metric, [baseline, { ...after, windowDays: 30 }]);
    expect(x.status).toBe("not_comparable");
    expect(x.delta).toBeNull();
  });
  it("never compares mismatched collection methods", () => {
    const x = compareLabMetric(metric, [baseline, { ...after, methodNote: "手カウント" }]);
    expect(x.status).toBe("not_comparable");
  });
  it("rejects a follow-up taken before the baseline", () => {
    const x = compareLabMetric(metric, [baseline, { ...after, measuredAt: "2026-09-20T00:00:00Z" }]);
    expect(x.status).toBe("not_comparable");
  });
  it("requires both phases", () => {
    expect(compareLabMetric(metric, [baseline]).status).toBe("missing_pair");
  });
  it("does not report a nonsensical percent when baseline is zero", () => {
    const x = compareLabMetric(metric, [{ ...baseline, value: 0 }, after]);
    expect(x.delta).toBe(120);
    expect(x.changePercent).toBeNull();
  });
  it("flags incomplete evidence and missing confounder notes", () => {
    const x = compareLabMetric(metric, [baseline, { ...after, evidenceUrl: null, contextNote: null }]);
    expect(x.status).toBe("needs_evidence");
    expect(x.limitations.some((l) => l.includes("交絡"))).toBe(true);
  });
  it("keeps observations from other projects out of the comparison", () => {
    const x = compareLabMetric(metric, [baseline, { ...after, projectId: "other" }]);
    expect(x.status).toBe("missing_pair");
  });
  it("selects the latest valid observation for each phase", () => {
    const older = { ...after, id: "old", measuredAt: "2026-10-10T00:00:00Z", value: 101 };
    expect(compareLabMetric(metric, [older, baseline, after]).delta).toBe(20);
  });
  it("does not mutate original arrays and supports several metrics", () => {
    const records = [after, baseline];
    const list = compareLabMetrics([metric, { ...metric, id: "m2" }], records);
    expect(list[0].delta).toBe(20);
    expect(list[1].status).toBe("missing_pair");
    expect(records[0].id).toBe("o2");
  });
});
