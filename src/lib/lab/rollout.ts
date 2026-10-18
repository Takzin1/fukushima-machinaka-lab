/** Prevent runtime requests before the LabProject schema is deployed. */
export function isLabExecutionEnabled(value: string | undefined = process.env.LAB_EXECUTION_ENABLED) {
  return value === "true";
}
