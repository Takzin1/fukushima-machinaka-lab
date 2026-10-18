import type { Challenge } from "@/types/domain";

export type RecruitmentState = "open" | "expired" | "closed" | "sample";
export type RecruitmentFields = Pick<Challenge, "status" | "deadline" | "is_sample">;

// Preview fixtures use date-only JST deadlines; production uses exact ISO timestamps.
function deadlineTime(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return Date.parse(`${value}T23:59:59.999+09:00`);
  }
  return Date.parse(value);
}

export function getRecruitmentState(
  challenge: RecruitmentFields,
  now: Date = new Date(),
): RecruitmentState {
  if (challenge.is_sample) return "sample";
  if (challenge.status !== "published") return "closed";
  if (challenge.deadline === null) return "open";
  const due = deadlineTime(challenge.deadline);
  if (!Number.isFinite(due) || now.getTime() > due) return "expired";
  return "open";
}

export function recruitmentLabel(state: RecruitmentState): string {
  switch (state) {
    case "open": return "募集中";
    case "expired": return "募集終了";
    case "closed": return "募集停止";
    case "sample": return "SAMPLE・応募不可";
  }
}
