import { describe, expect, it } from "vitest";
import { getRecruitmentState, recruitmentLabel } from "@/lib/recruitment";

describe("recruitment state", () => {
  const live = { status: "published" as const, is_sample: false, deadline: "2026-10-31" };
  it("treats date-only deadlines as inclusive to JST day end", () => {
    expect(getRecruitmentState(live, new Date("2026-10-31T14:59:59.999Z"))).toBe("open");
    expect(getRecruitmentState(live, new Date("2026-10-31T15:00:00Z"))).toBe("expired");
  });
  it("treats ISO production deadlines as exact instants", () => {
    const challenge = { ...live, deadline: "2026-10-31T14:59:59Z" };
    expect(getRecruitmentState(challenge, new Date("2026-10-31T14:59:59Z"))).toBe("open");
    expect(getRecruitmentState(challenge, new Date("2026-10-31T15:00:00Z"))).toBe("expired");
  });
  it("blocks samples regardless of published status or date", () => {
    expect(getRecruitmentState({ ...live, is_sample: true }, new Date("2026-01-01"))).toBe("sample");
    expect(recruitmentLabel("sample")).toContain("応募不可");
  });
  it("rejects non-published, invalid dates and missing timestamps safely", () => {
    expect(getRecruitmentState({ ...live, status: "closed" })).toBe("closed");
    expect(getRecruitmentState({ ...live, deadline: "invalid" })).toBe("expired");
    expect(getRecruitmentState({ ...live, deadline: null })).toBe("open");
  });
});
