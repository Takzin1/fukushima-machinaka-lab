import { describe, expect, it } from "vitest";
import { LAB_RELEASE_APPROVED, isLabExecutionEnabled } from "@/lib/lab/rollout";
describe("LAB staged rollout", () => {
  it("fails closed even when deployment environment explicitly opts in", () => {
    expect(LAB_RELEASE_APPROVED).toBe(false);
    for (const value of ["true", "TRUE", "1", "false", "", undefined]) {
      expect(isLabExecutionEnabled(value)).toBe(false);
    }
  });
});
