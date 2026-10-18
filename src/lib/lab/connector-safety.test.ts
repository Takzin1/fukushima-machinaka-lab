import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canTransitionProject } from "@/lib/lab/workflow-engine";

/**
 * Regression fence: a client-side readiness check cannot establish an atomic
 * DB invariant. The connector must fail closed on completion as well.
 */
describe("LAB connector release invariants", () => {
  const mutations = readFileSync(
    resolve(process.cwd(), "dataconnect/app-connector/mutations.gql"), "utf8",
  );
  const begin = mutations.indexOf("mutation TransitionLabProject(");
  const end = mutations.indexOf("mutation CreateLabMilestone(", begin);
  const transition = mutations.slice(begin, end);

  it("guards project transitions with server-verified admin role and expected state", () => {
    expect(begin).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(begin);
    expect(transition).toContain("role @check(expr: \"this == 'admin'\"");
    expect(transition).toContain('status @check(expr: "this == vars.expectedStatus"');
    expect(transition).toContain("@transaction");
  });

  it("denies completing a LAB at both server and Data Connect layers", () => {
    expect(canTransitionProject("active", "completed")).toBe(false);
    expect(transition).not.toContain("vars.nextStatus == 'completed'");
    expect(transition).toContain("vars.nextStatus == 'paused'");
  });

  it("writes the transition and audit record in the same transaction body", () => {
    expect(transition).toContain("labProject_update(");
    expect(transition).toContain("labEvent_insert(");
  });
});
