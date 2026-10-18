/**
 * Explicit LAB experiment state machine. The DB connector independently
 * validates the same edges with @auth + optimistic expected-status checks.
 */
export const PROJECT_STATES = ["planning", "active", "paused", "completed", "canceled"] as const;
export type LabProjectStatus = (typeof PROJECT_STATES)[number];
export const MILESTONE_STATES = ["todo", "doing", "blocked", "done"] as const;
export type LabMilestoneStatus = (typeof MILESTONE_STATES)[number];
export type LabAssigneeRole = "admin" | "student" | "shop_owner";

const projectTransitions: Record<LabProjectStatus, readonly LabProjectStatus[]> = {
  planning: ["active", "canceled"],
  active: ["paused", "completed", "canceled"],
  paused: ["active", "canceled"],
  completed: [],
  canceled: [],
};

const milestoneTransitions: Record<LabMilestoneStatus, readonly LabMilestoneStatus[]> = {
  todo: ["doing"],
  doing: ["blocked", "done"],
  blocked: ["doing"],
  done: [],
};

export function projectNextStates(status: LabProjectStatus): readonly LabProjectStatus[] {
  return projectTransitions[status];
}
export function milestoneNextStates(status: LabMilestoneStatus): readonly LabMilestoneStatus[] {
  return milestoneTransitions[status];
}
export function canTransitionProject(from: LabProjectStatus, to: LabProjectStatus): boolean {
  return projectNextStates(from).includes(to);
}
export function canTransitionMilestone(from: LabMilestoneStatus, to: LabMilestoneStatus): boolean {
  return milestoneNextStates(from).includes(to);
}
export function isProjectStatus(value: string): value is LabProjectStatus {
  return PROJECT_STATES.some((state) => state === value);
}
export function isMilestoneStatus(value: string): value is LabMilestoneStatus {
  return MILESTONE_STATES.some((state) => state === value);
}

export type MilestoneState = { status: LabMilestoneStatus };
export type CompletionReadiness = {
  ready: boolean;
  pending: number;
  reason: "ready" | "no_milestones" | "unfinished";
};
export function getCompletionReadiness(milestones: readonly MilestoneState[]): CompletionReadiness {
  if (milestones.length === 0) return { ready: false, pending: 0, reason: "no_milestones" };
  const pending = milestones.filter((m) => m.status !== "done").length;
  return pending
    ? { ready: false, pending, reason: "unfinished" }
    : { ready: true, pending: 0, reason: "ready" };
}
export function isMilestoneOverdue(
  dueAt: string | null,
  status: LabMilestoneStatus,
  now = new Date(),
): boolean {
  if (status === "done" || !dueAt) return false;
  const due = Date.parse(dueAt);
  return Number.isFinite(due) && now.getTime() > due;
}
