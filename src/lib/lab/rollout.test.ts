import { describe, expect, it } from "vitest";
import { isLabExecutionEnabled } from "@/lib/lab/rollout";
describe("LAB staged rollout", () => {
  it("requires a literal opt-in", () => {
    expect(isLabExecutionEnabled("true")).toBe(true);
    for (const value of ["TRUE", "1", "false", "", undefined]) {
      expect(isLabExecutionEnabled(value)).toBe(false);
    }
  });
});
