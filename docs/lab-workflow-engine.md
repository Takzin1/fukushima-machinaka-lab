# LAB Experiment Workflow Engine — v0

## Goal

Connect the LAB handoff (#7) and KPI observations (#8) to an accountable execution workflow, without enabling access to private merchant/student records or making causal claims. PR dependency: **#7 → #8 → this PR**.

## State machines

Project:
- `planning → active` or `canceled`
- `active → paused`, `completed`, or `canceled`
- `paused → active` or `canceled`
- `completed` and `canceled` are final; no editing or reopening.

Milestone:
- `todo → doing`
- `doing → blocked` or `done`
- `blocked → doing`
- `done` is final. Progress transitions require project status `active`.

A project can be completed only when a full, known milestone snapshot exists, at least one milestone is present, and all are marked `done`. A full 100-item result conservatively prevents completion because the query may be truncated.

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

The **server-side** completion gate checks the current milestone list and then sends a separate status update mutation. The database currently does **not** enforce “all milestones done” inside the same atomic transaction as completion; a concurrently added/changed milestone could theoretically race with the gate. Before production rollout, add an atomic database-level completion invariant or equivalent locked transaction and perform concurrency tests. Do not claim this completion rule is fully race-safe.

## Further work

1. Staging database migration and negative authorization tests: admin/student/shop-owner/anonymous.
2. Unauthorized state edges, stale expected-state, cross-project milestone mutations, terminal state writes and duplicate submissions.
3. Concurrency validation for completion/readiness and event append; ensure transactional rejection rolls back both status and event.
4. 100-row milestones/300-row event pagination with explicit truncation UI (initial UI warns at the cap).
5. Reassignment to a specific consenting actor only after role-scoped access and explicit project membership are implemented.
6. Add milestone dependencies, file evidence/hash attestations, immutable report snapshots, reminders and PII retention policy after protocol review.
