# LAB Impact Engine — v0 descriptive measurement protocol

## What is implemented

A matched Application can become a private LabProject (PR #7). Each project defines one or more KPI metrics (`LabMetric`) and operator-submitted, append-only observations (`LabObservation`). Each record contains:
- Baseline or after phase and observed numeric value
- Identical measurement unit **within a metric**, windowDays 1–366
- Text describing collection method, observation date
- Optional HTTPS evidence URL and context/confounder note

The `compareLabMetric` function selects the most recent valid observation in each phase (by measuredAt, then createdAt), checks chronological order, identical windowDays and identical collection methods. It returns:
- `missing_pair` when baseline/after is missing
- `not_comparable` when measurement conditions differ
- `needs_evidence` when comparison is numerically possible but one or both evidence URLs are missing
- `descriptive_only` when dates/methods/windows agree and links exist

The delta is `after - before`. If baseline is strictly positive, the descriptive percent change is `delta / baseline × 100`, rounded to six decimals. A directionally favorable trend is not proof of causal impact. The output always sets `causalAttribution: not_established`.

## Trust and limitations

- HTTPS evidence URLs are *references*, not audited proof of measurement, unchanged source or license.
- Confounders (weather, promotions, opening hours, temporary construction, seasonal shifts, measurement selection) cannot be controlled by simple before/after comparisons.
- Equal window length and identical method names are necessary checks, not sufficient evidence of statistical comparability.
- Multiple observations are preserved; older evidence is not overwritten, but current summary uses the latest pair. Sampling bias is not estimated.
- Only admins can query/write LAB data; server actions and Data Connect operations both check admin role.
- RecordLabObservation verifies the metric belongs to the nominated LabProject in a Data Connect transaction.
- Unique (projectId, name) avoids silent metric name collisions.
- No external URL is fetched, and no private LAB evidence is published publicly.
- Page is disabled until schema migrations, matched-project creation and permission tests have passed. The static GitHub Pages preview excludes authenticated dynamic detail pages.
- List query limit is 100 metrics and 500 observations per project; results at these limits should be treated as potentially truncated rather than complete.

## Next before rollout

1. Review the generated Cloud SQL migration and migrate staging, not production first.
2. Test administrative operations, negative cases (cross-project metric, unmatched LAB, student/shop-owner/anonymous actor, duplicates).
3. Verify evidence URL authenticity and storage permissions; never treat an external URL as proof by itself.
4. Conduct one real paired merchant experiment, recording baseline, intervention context, follow-up, bias and confounders.
5. Consider control/comparison areas, repeated time-series and confidence intervals; do not make causal claims without a valid study design.
6. Add deliberate correction/amendment flow with explicit revision lineage, not silent observation mutation.
