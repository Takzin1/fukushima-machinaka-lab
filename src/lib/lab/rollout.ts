/**
 * Two-key, source-controlled LAB rollout gate.
 *
 * Do NOT flip LAB_RELEASE_APPROVED until Cloud SQL migrations, Data Connect
 * permission checks and negative-case/concurrency tests are verified.
 * This compile-time lock protects production even when its environment
 * variables cannot be audited (e.g. missing Vercel permissions).
 */
export const LAB_RELEASE_APPROVED = false;

export function isLabExecutionEnabled(value: string | undefined = process.env.LAB_EXECUTION_ENABLED) {
  return LAB_RELEASE_APPROVED && value === "true";
}
