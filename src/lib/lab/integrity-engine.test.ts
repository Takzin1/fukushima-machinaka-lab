import { describe, expect, it } from "vitest";
import {
  inspectLabIntegrity, type IntegritySnapshot, type IntegrityMilestone,
} from "@/lib/lab/integrity-engine";

const projectId = "11111111-1111-4111-8111-111111111111";
const milestone: IntegrityMilestone = {
  id: "m1", projectId, status: "done", assigneeRole: "student", dueAt: null,
};
function sample(changes: Partial<IntegritySnapshot> = {}): IntegritySnapshot {
  return {
    projectId, status: "active",
    milestones: [milestone], events: [], metrics: [], observations: [],
    ...changes,
  };
}
const codes = (snapshot: IntegritySnapshot) => inspectLabIntegrity(snapshot).issues.map((i) => i.code);

describe("LAB read-only integrity diagnostics", () => {
  it("never authorizes completion even if all observations look clean", () => {
    const result = inspectLabIntegrity(sample());
    expect(result.level).toBe("no_findings");
    expect(result.observedMilestonesAllDone).toBe(true);
    expect(result.completionAuthorized).toBe(false);
  });
  it("rejects a completed project without completed milestones", () => {
    expect(codes(sample({ status: "completed", milestones: [] }))).toContain("INVALID_COMPLETION");
    expect(codes(sample({
      status: "completed", milestones: [{ ...milestone, status: "doing" }],
    }))).toContain("INVALID_COMPLETION");
  });
  it("flags cross-project milestones and unknown roles/statuses", () => {
    const result = codes(sample({ milestones: [
      { ...milestone, projectId: "another", assigneeRole: "owner", status: "invalid", dueAt: "nonsense" },
    ] }));
    expect(result).toEqual(expect.arrayContaining([
      "FOREIGN_MILESTONE", "UNKNOWN_ASSIGNEE", "UNKNOWN_MILESTONE_STATUS", "INVALID_DUE_DATE",
    ]));
  });
  it("fails closed when milestone fetch is at the 100-row cap", () => {
    const result = inspectLabIntegrity(sample({ milestones: Array.from({ length: 100 }, (_, i) => ({
      ...milestone, id: "m" + i,
    })) }));
    expect(result.issues.map((x) => x.code)).toContain("TRUNCATED_MILESTONES");
    expect(result.observedMilestonesAllDone).toBe(false);
    expect(result.completionAuthorized).toBe(false);
  });
  it("flags unknown metrics, cross-project observations and invalid measurements", () => {
    const record = {
      id: "o1", metricId: "lost", projectId: "other", phase: "after" as const,
      value: Number.POSITIVE_INFINITY, windowDays: 0, methodNote: "",
      measuredAt: "not-a-date", createdAt: "2026-10-01T00:00:00Z",
      evidenceUrl: null, contextNote: null,
    };
    const results = codes(sample({ observations: [record] }));
    expect(results).toEqual(expect.arrayContaining([
      "FOREIGN_OBSERVATION", "UNKNOWN_OBSERVATION_METRIC", "INVALID_OBSERVATION",
    ]));
  });
  it("recognizes a KPI from same project without creating false missing reference errors", () => {
    const metric = { id: "metric", projectId, name: "来店客数", unit: "人", direction: "higher" as const };
    const record = {
      id: "o1", metricId: metric.id, projectId, phase: "baseline" as const,
      value: 10, windowDays: 7, methodNote: "POS記録",
      measuredAt: "2026-10-01T00:00:00Z", createdAt: "2026-10-01T00:00:00Z",
      evidenceUrl: null, contextNote: null,
    };
    expect(codes(sample({ metrics: [metric], observations: [record] }))).toEqual([]);
  });
  it("marks broken audit attribution and latest project status mismatch", () => {
    const result = inspectLabIntegrity(sample({ events: [
      { id: "e1", projectId, actorId: "", kind: "project_transition", note: "",
        previousStatus: "planning", nextStatus: "paused", createdAt: "2026-10-01T00:00:00Z" },
    ] }));
    expect(result.level).toBe("blocked");
    expect(result.issues.map((x) => x.code)).toEqual(expect.arrayContaining([
      "INVALID_EVENT", "PROJECT_EVENT_MISMATCH",
    ]));
  });
  it("does not treat missing audit history as proof of corruption", () => {
    expect(codes(sample({ events: [] }))).toEqual([]);
  });
  it("rejects reused event and milestone identifiers within a result", () => {
    const event = { id: "e", projectId, actorId: "admin", kind: "milestone_created",
      note: "作成", previousStatus: null, nextStatus: "todo",
      createdAt: "2026-10-01T00:00:00Z" };
    const result = codes(sample({
      milestones: [milestone, milestone],
      events: [event, event],
    }));
    expect(result).toContain("DUPLICATE_MILESTONE");
    expect(result).toContain("DUPLICATE_EVENT");
  });
});
