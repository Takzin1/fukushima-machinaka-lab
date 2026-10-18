# Phase 2 — LAB execution foundation

## Flow
Matched Application -> Admin verifies human agreement -> unique LabProject.
Project begins in `planning`. The experiment goal and pre-experiment baseline are private and visible to administrators only in this release.

## Security
- `LAB_EXECUTION_ENABLED` is strictly `true` only after a staged Data Connect deployment.
- LAB records are never returned from public queries.
- Server Action requires admin role; Data Connect query & mutation repeat admin role checks.
- Server derives challenge ID, student ID, and owner ID from the authoritative Application -> Challenge -> Wish relations, not from posted form fields.
- Mutation verifies the Application is matched and the identities agree. FK and unique(Application) reject duplicates.
- This does NOT grant the student or shop owner permissions yet; role-scoped collaboration will need a separate reviewed release.

## Follow-on work
- Stage transitions / accountable owner with audit trail.
- Milestones, task assignment, completion evidence and attachments.
- KPI measurement units, baseline/observed dates, confounders and evidence provenance (initial backend and admin interface implemented in the stacked Impact Engine PR; independent provenance validation and causal research remain pending).
- Consent and record-retention notices; privacy-by-default outcome publishing.
- Student/shop-owner scoped views and explicit agreement workflow.

## Release gate
1. Compile Data Connect.
2. Review generated SQL migration and deploy to **staging**.
3. Authenticated admin may create project from matched application; non-admin denied.
4. Unmatched applications, identity mismatch and duplicate application ID rejected at connector.
5. Complete staging permission and data-retention review before enabling `LAB_EXECUTION_ENABLED=true` in production.
