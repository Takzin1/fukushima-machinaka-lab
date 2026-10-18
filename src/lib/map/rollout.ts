/** An explicit production rollout gate: deploy Data Connect schema before enabling. */
export type PublicMapRolloutStatus = "disabled" | "ready" | "unavailable";
export function isPublicMapDataEnabled(value: string | undefined = process.env.MAP_DATA_ENABLED) {
  return value === "true";
}
