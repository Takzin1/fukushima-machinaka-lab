export type AnalyticsEvent =
  | "challenge_view"
  | "wish_submit"
  | "application_start"
  | "application_complete";

export function trackEvent(_event: AnalyticsEvent, _properties?: Record<string, string>) {
  void _event;
  void _properties;
  // Intentionally a no-op in MVP. Add a consent-aware provider in a later phase.
}
