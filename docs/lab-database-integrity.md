# LAB Database Integrity Engine — staging runbook

## Scope

`src/lib/lab/integrity-engine.ts` implements read-only diagnostics for
a private admin snapshot. It detects invalid project/milestone states,
foreign-project metrics/observations, duplicate IDs, missing metric
references, invalid observations and audit entries, and truncated query
windows (100 milestones, 300 events, 100 metrics, 500 observations).
Because the queries are not one snapshot, a latest audit event status
mismatch is only a warning.

**This diagnostic does not authorize project completion**, even when
every known milestone has been marked done.

## Staging-only PostgreSQL integrity design

`db/staging/001_lab_integrity_guards.sql` is not referenced by Firebase
deployment scripts and has **not been executed on any actual Cloud SQL
instance**. The script assumes tables in `public` with generated
snake_case names; inspect generated Data Connect schema before using.

It makes a `lab_project` status UPDATE and every child
`lab_milestone` INSERT/UPDATE share a parent row lock via
`SELECT ... FOR UPDATE`. Completion checks at least one milestone
exists and none are unfinished while holding the parent lock.
It also blocks editing/deleting append-only LAB events and observations
and rejects cross-project metric references on observation insert.

### Mandatory staging acceptance procedure

1. Deploy Firebase Data Connect to a disposable staging project. Inspect
   PostgreSQL table and column names and verify the SQL matches.
2. Back up staging, run the manual SQL script with a schema-owner
   account, then verify the installed trigger definitions in
   `pg_catalog.pg_trigger`.
3. Create an active test LAB with one done milestone. In two independent
   sessions race (A) project update to `completed` and (B) inserting
   a new `todo` milestone. Test both orderings. Exactly one conflicting
   operation must fail. Never allow a completed project with a pending milestone.
4. Repeat for a concurrent milestone transition, missing milestones,
   blocked milestones, canceled LAB edits, cross-project observations,
   audit record overwrite/delete and rollbacks on errors.
5. Verify real Data Connect authorization for admin, anonymous, student
   and shop-owner identities. Confirm that a subsequent Firebase deployment
   does not drop manually-managed triggers.
6. Capture SQL traces, isolation levels, transaction deadlocks and
   retry/rollback behavior in the PR before approving production use.
7. Only after reviews may a *separate* PR reintroduce `active → completed`
   and update `LAB_RELEASE_APPROVED` from `false` to `true`.

## Caveats

The manual SQL is a proposal, not a tested or deployed migration.
The design presumes PostgreSQL READ COMMITTED statement snapshots; real
Cloud SQL/Data Connect execution can differ. Updating a milestone row
can acquire child locks before the parent, so competing transactions may
deadlock; the database must abort one and clients must handle that failure.
The app must not treat static SQL contract tests or a clean diagnostic
snapshot as evidence of production-safe concurrent completion.
