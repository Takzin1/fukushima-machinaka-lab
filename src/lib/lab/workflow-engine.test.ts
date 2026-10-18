import { describe, expect, it } from "vitest";
import {
  PROJECT_STATES, MILESTONE_STATES, canTransitionProject, canTransitionMilestone,
  getCompletionReadiness, isProjectStatus, isMilestoneStatus, isMilestoneOverdue,
  milestoneNextStates, projectNextStates,
} from "@/lib/lab/workflow-engine";

describe("experiment workflow state machine", () => {
  it("only allows explicitly approved project edges", () => {
    expect(projectNextStates("planning")).toEqual(["active", "canceled"]);
    // Completion cannot be enabled by client/server-only checks.
    expect(canTransitionProject("active", "completed")).toBe(false);
    expect(canTransitionProject("active", "paused")).toBe(true);
    expect(canTransitionProject("paused", "active")).toBe(true);
    expect(canTransitionProject("paused", "completed")).toBe(false);
    expect(canTransitionProject("planning", "completed")).toBe(false);
    for (const state of PROJECT_STATES) {
      expect(canTransitionProject(state, state)).toBe(false);
    }
    expect(projectNextStates("completed")).toEqual([]);
    expect(projectNextStates("canceled")).toEqual([]);
  });
  it("keeps completed and canceled projects terminal", () => {
    for (const target of PROJECT_STATES) {
      expect(canTransitionProject("completed", target)).toBe(false);
      expect(canTransitionProject("canceled", target)).toBe(false);
    }
    expect(isProjectStatus("active")).toBe(true);
    expect(isProjectStatus("hacked")).toBe(false);
  });
  it("blocks shortcut milestone progress and terminal reopening", () => {
    expect(milestoneNextStates("todo")).toEqual(["doing"]);
    expect(canTransitionMilestone("todo", "done")).toBe(false);
    expect(canTransitionMilestone("doing", "blocked")).toBe(true);
    expect(canTransitionMilestone("blocked", "doing")).toBe(true);
    for (const state of MILESTONE_STATES) expect(canTransitionMilestone("done", state)).toBe(false);
    expect(isMilestoneStatus("doing")).toBe(true);
    expect(isMilestoneStatus("tampered")).toBe(false);
  });
  it("requires at least one milestone and all done before completion", () => {
    expect(getCompletionReadiness([])).toEqual({ ready:false, pending:0, reason:"no_milestones" });
    expect(getCompletionReadiness([{status:"done"}, {status:"doing"}])).toEqual({ ready:false, pending:1, reason:"unfinished" });
    expect(getCompletionReadiness([{status:"done"}])).toEqual({ ready:true, pending:0, reason:"ready" });
  });
  it("flags deadline overruns but never completed tasks", () => {
    const now = new Date("2026-10-19T10:00:00.000Z");
    expect(isMilestoneOverdue("2026-10-18T00:00:00Z", "todo", now)).toBe(true);
    expect(isMilestoneOverdue("2026-10-20T00:00:00Z", "blocked", now)).toBe(false);
    expect(isMilestoneOverdue("2026-10-18T00:00:00Z", "done", now)).toBe(false);
    expect(isMilestoneOverdue(null, "doing", now)).toBe(false);
    expect(isMilestoneOverdue("invalid", "todo", now)).toBe(false);
  });
});
