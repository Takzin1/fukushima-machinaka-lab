-- MANUAL STAGING MIGRATION ONLY.
-- Not referenced by Firebase deploy, CI or production startup.
-- Confirm Data Connect's generated PostgreSQL names before executing.
-- PostgreSQL READ COMMITTED transaction isolation is assumed. Exercise
-- concurrently in staging and inspect locks/deadlocks before approval.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $$
BEGIN
  IF to_regclass('public.lab_project') IS NULL OR
     to_regclass('public.lab_milestone') IS NULL OR
     to_regclass('public.lab_event') IS NULL OR
     to_regclass('public.lab_observation') IS NULL OR
     to_regclass('public.lab_metric') IS NULL THEN
    RAISE EXCEPTION 'LAB tables not found: deploy and verify Data Connect schema in staging first';
  END IF;
END
$$;

-- A project UPDATE holds a row lock. This BEFORE trigger validates its new
-- state against milestone rows while the project row is locked.
CREATE OR REPLACE FUNCTION public.lab_project_transition_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT (
      (OLD.status = 'planning' AND NEW.status IN ('active', 'canceled')) OR
      (OLD.status = 'active' AND NEW.status IN ('paused', 'canceled', 'completed')) OR
      (OLD.status = 'paused' AND NEW.status IN ('active', 'canceled'))
    ) THEN
      RAISE EXCEPTION 'Invalid LAB project transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.lab_milestone AS m WHERE m.project_id = NEW.id
    ) OR EXISTS (
      SELECT 1 FROM public.lab_milestone AS m
      WHERE m.project_id = NEW.id AND m.status IS DISTINCT FROM 'done'
    ) THEN
      RAISE EXCEPTION 'Cannot complete LAB: milestones are empty or unfinished';
    END IF;
  END IF;

  IF OLD.status IN ('completed', 'canceled') THEN
    -- Terminal cases must remain immutable (not only the status).
    IF NEW IS DISTINCT FROM OLD THEN
      RAISE EXCEPTION 'Terminal LAB projects are immutable';
    END IF;
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_lab_project_transition_integrity ON public.lab_project;
CREATE TRIGGER trg_lab_project_transition_integrity
BEFORE UPDATE ON public.lab_project
FOR EACH ROW EXECUTE FUNCTION public.lab_project_transition_integrity();

-- Every milestone writer acquires the SAME parent project row lock used by
-- project completion. This serializes the child change with the completion
-- check, avoiding the insert/update phantom that a separate API read creates.
CREATE OR REPLACE FUNCTION public.lab_milestone_parent_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  parent_state text;
  parent_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Milestones cannot be deleted; preserve audit history';
  END IF;

  parent_id := NEW.project_id;
  IF TG_OP = 'UPDATE' AND NEW.project_id IS DISTINCT FROM OLD.project_id THEN
    RAISE EXCEPTION 'Milestone reassignment across LABs is forbidden';
  END IF;

  SELECT status INTO parent_state
    FROM public.lab_project
    WHERE id = parent_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent LAB project not found';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF parent_state NOT IN ('planning', 'active') OR NEW.status <> 'todo' THEN
      RAISE EXCEPTION 'Cannot insert milestone in this LAB status';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF parent_state <> 'active' THEN
      RAISE EXCEPTION 'Milestones can advance only in active LABs';
    END IF;
    IF OLD.status IS DISTINCT FROM NEW.status AND NOT (
      (OLD.status = 'todo' AND NEW.status = 'doing') OR
      (OLD.status = 'doing' AND NEW.status IN ('blocked', 'done')) OR
      (OLD.status = 'blocked' AND NEW.status = 'doing')
    ) THEN
      RAISE EXCEPTION 'Invalid milestone transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_lab_milestone_parent_integrity ON public.lab_milestone;
CREATE TRIGGER trg_lab_milestone_parent_integrity
BEFORE INSERT OR UPDATE OR DELETE ON public.lab_milestone
FOR EACH ROW EXECUTE FUNCTION public.lab_milestone_parent_integrity();

-- Audit/evidence records cannot be rewritten or deleted by an accidental SQL
-- operation. Any future redaction needs a separate reviewed workflow.
CREATE OR REPLACE FUNCTION public.lab_append_only_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'LAB audit/evidence is append-only; use an explicit correction record';
END
$$;

DROP TRIGGER IF EXISTS trg_lab_event_append_only ON public.lab_event;
CREATE TRIGGER trg_lab_event_append_only
BEFORE UPDATE OR DELETE ON public.lab_event
FOR EACH ROW EXECUTE FUNCTION public.lab_append_only_integrity();

DROP TRIGGER IF EXISTS trg_lab_observation_append_only ON public.lab_observation;
CREATE TRIGGER trg_lab_observation_append_only
BEFORE UPDATE OR DELETE ON public.lab_observation
FOR EACH ROW EXECUTE FUNCTION public.lab_append_only_integrity();

-- Defense in depth: SQL-level cross-project observation/metric integrity,
-- independent of the Firebase Data Connect GraphQL transaction.
CREATE OR REPLACE FUNCTION public.lab_observation_metric_integrity()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  metric_project uuid;
BEGIN
  SELECT project_id INTO metric_project
    FROM public.lab_metric
    WHERE id = NEW.metric_id;
  IF NOT FOUND OR metric_project IS DISTINCT FROM NEW.project_id THEN
    RAISE EXCEPTION 'Observation metric must belong to the same LAB';
  END IF;

  IF NEW.phase NOT IN ('baseline', 'after') OR
     NEW.window_days NOT BETWEEN 1 AND 366 OR
     NEW.value::text IN ('NaN', 'Infinity', '-Infinity') OR
     btrim(NEW.method_note) = '' THEN
    RAISE EXCEPTION 'Invalid LAB observation fields';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_lab_observation_metric_integrity ON public.lab_observation;
CREATE TRIGGER trg_lab_observation_metric_integrity
BEFORE INSERT ON public.lab_observation
FOR EACH ROW EXECUTE FUNCTION public.lab_observation_metric_integrity();

COMMIT;
