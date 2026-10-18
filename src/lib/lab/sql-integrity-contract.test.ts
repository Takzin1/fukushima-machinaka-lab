import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Static migration contract checks only. These do not execute SQL or prove
// concurrency safety; staging integration tests are mandatory.
const migration = readFileSync(resolve(
  process.cwd(), "db/staging/001_lab_integrity_guards.sql",
), "utf8");

describe("manual LAB integrity SQL migration", () => {
  it("does not hide a production auto-deployment path", () => {
    expect(migration).toContain("MANUAL STAGING MIGRATION ONLY");
    expect(migration).toContain("to_regclass('public.lab_project')");
    expect(migration).toContain("BEGIN;");
    expect(migration.trimEnd().endsWith("COMMIT;")).toBe(true);
  });
  it("locks the parent project for every milestone writer", () => {
    expect(migration).toContain("BEFORE INSERT OR UPDATE OR DELETE ON public.lab_milestone");
    expect(migration).toMatch(/FROM public\.lab_project\s+WHERE id = parent_id\s+FOR UPDATE/);
    expect(migration).toContain("trg_lab_milestone_parent_integrity");
  });
  it("requires at least one milestone and rejects any not done at completion", () => {
    expect(migration).toContain("NEW.status = 'completed'");
    expect(migration).toContain("NOT EXISTS (");
    expect(migration).toContain("OR EXISTS (");
    expect(migration).toContain("m.status IS DISTINCT FROM 'done'");
  });
  it("retains append-only audit/evidence and cross-project observation checks", () => {
    expect(migration).toContain("trg_lab_event_append_only");
    expect(migration).toContain("trg_lab_observation_append_only");
    expect(migration).toContain("metric_project IS DISTINCT FROM NEW.project_id");
  });
});
