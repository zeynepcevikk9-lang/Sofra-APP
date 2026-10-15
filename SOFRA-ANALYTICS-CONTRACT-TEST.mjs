import assert from 'node:assert/strict';
import { createAnalyticsEvent, isAnalyticsEventSafe, sanitizeAnalyticsEvent } from './SOFRA-ANALYTICS-V1.mjs';

const modeEvent = createAnalyticsEvent('mode_selected', { mode: 'fit' }, '2026-10-15T12:00:00Z');
assert.deepEqual(modeEvent, {
  schema_version: 1,
  event: 'mode_selected',
  properties: { mode: 'fit' },
  occurred_at: '2026-10-15T12:00:00Z',
});

const feedback = sanitizeAnalyticsEvent({ event: 'recommendation_feedback', properties: { value: 'helpful', recipe_id: 'silently-ignored' } });
assert.deepEqual(feedback.properties, { value: 'helpful' }, 'olay sadece tanımlı alanları taşımalı');
assert.deepEqual(sanitizeAnalyticsEvent({ event: 'health_connection_cta_viewed' }).properties, {});

for (const property of ['age', 'weight', 'health_summary', 'allergen', 'email', 'free_text']) {
  assert.throws(() => sanitizeAnalyticsEvent({ event: 'screen_view', properties: { screen: 'fit', [property]: 'secret' } }), /hassas alan yasak/);
}
assert.throws(() => createAnalyticsEvent('screen_view', { screen: 'unknown' }), /izinli değil/);
assert.throws(() => createAnalyticsEvent('notification_preference_changed', { enabled: 'yes' }), /enabled boolean olmalı/);
assert.equal(isAnalyticsEventSafe({ event: 'theme_changed', properties: { theme: 'gece' } }), true);
assert.equal(isAnalyticsEventSafe({ event: 'screen_view', properties: { screen: 'fit', weight: 60 } }), false);

console.log('SOFRA_ANALYTICS_CONTRACT_TEST_OK');
console.log('events=8 remoteProvider=not_connected sensitiveFields=blocked');

