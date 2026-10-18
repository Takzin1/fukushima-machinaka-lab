# LAB Experiment Workflow Engine — v0

## Goal

Connect the LAB handoff (#7) and KPI observations (#8) to an accountable execution workflow, without enabling access to private merchant/student records or making causal claims. PR dependency: **#7 → #8 → this PR**.

## State machines

Project:
- `planning → active` or `canceled`
- `active → paused` or `canceled` (completion currently **locked** pending atomic DB invariant)
- `paused → active` or `canceled`
- `completed` and `canceled` are final; no editing or reopening.

Milestone:
- `todo → doing`
- `doing → blocked` or `done`
- `blocked → doing`
- `done` is final. Progress transitions require project status `active`.

**Safety hardening:** an otherwise-valid project may **not** transition to `completed` in v0: the server state machine, action and connector's `@auth` all fail closed. The readiness helper reports a *diagnostic snapshot only*; it cannot authorize completion. A DB-side atomic milestone check is required before adding the `active → completed` transition in a subsequent release.

## Data and permissions

- `LabMilestone`: project foreign key, title, assigned *role* (not a new permission), optional due date, status.
- `LabEvent`: append-only project/milestone action, actor ID from auth, previous and next status, reason, timestamp.
- All queries, commands and UI require an admin role.
- Data Connect mutations duplicate role/state/foreign-project checks and atomically update status and insert an audit event.
- `expectedStatus` guards against stale client updates.
- The server additionally validates goal and milestone readiness before sending a completion mutation.
- No public API/participant-facing workflow endpoint, email notification or automated action. Assigned student/shop owner cannot edit milestones in v0.
- GitHub Pages static export skips authenticated LAB detail pages and aliases server actions to no-ops.
- `LAB_EXECUTION_ENABLED=false` by default until database migrations, permission tests, and stakeholder review have passed.

## Critical limitation before production

The previous implementation used a **server-side** readiness check before sending a separate status update. This created a time-of-check/time-of-use race with concurrent milestone additions or updates. This hardening **disables all `completed` transitions** in the server state machine, server action, and Data Connect authorization expression until a DB-atomic, concurrency-tested invariant is available. `getCompletionReadiness` remains informational only. No one should enable completion by only changing frontend buttons or form validators.

## Further work

1. Staging database migration and negative authorization tests: admin/student/shop-owner/anonymous.
2. Unauthorized state edges, stale expected-state, cross-project milestone mutations, terminal state writes and duplicate submissions.
3. Concurrency validation for completion/readiness and event append; ensure transactional rejection rolls back both status and event.
4. 100-row milestones/300-row event pagination with explicit truncation UI (initial UI warns at the cap).
5. Reassignment to a specific consenting actor only after role-scoped access and explicit project membership are implemented.
6. Add milestone dependencies, file evidence/hash attestations, immutable report snapshots, reminders and PII retention policy after protocol review.
