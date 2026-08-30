import { describe, expect, it } from "vitest";
import { canPerform } from "@/lib/authorization";

describe("role authorization", () => {
  it("keeps each workflow on the correct role", () => {
    expect(canPerform("shop_owner", "wish:create")).toBe(true);
    expect(canPerform("shop_owner", "challenge:publish")).toBe(false);
    expect(canPerform("student", "application:create")).toBe(true);
    expect(canPerform("student", "application:review")).toBe(false);
    expect(canPerform("admin", "challenge:publish")).toBe(true);
  });
});
