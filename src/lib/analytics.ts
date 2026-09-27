export type AnalyticsEvent = 'quiz_start' | 'quiz_complete' | 'share' | 'share_story' | 'map_view' | 'retake';

/**
 * No-op until an analytics provider is chosen (cookieless, e.g. Cloudflare Web Analytics or
 * Plausible). Never send answers or results with any identifier.
 */
export function track(event: AnalyticsEvent, props?: Record<string, string | number>): void {
  if (import.meta.env.DEV) console.debug('[track]', event, props ?? '');
}
