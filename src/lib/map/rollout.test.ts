import { describe, expect, it } from "vitest";
import { isPublicMapDataEnabled } from "@/lib/map/rollout";
describe("map rollout gate", () => {
  it("defaults to closed and accepts only explicit true", () => {
    for (const value of [undefined, "", "false", "TRUE", "1"]) {
      expect(isPublicMapDataEnabled(value)).toBe(false);
    }
    expect(isPublicMapDataEnabled("true")).toBe(true);
  });
});
