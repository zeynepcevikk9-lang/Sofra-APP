import assert from 'node:assert/strict';
import { buildHealthPermissionPlan, fitContext, healthConnectionState, marketPayload, normalizeHealthSummary } from './SOFRA-HEALTH-V1.mjs';

function assertNoHealthData(value) {
  const serialized = JSON.stringify(value);
  for (const forbidden of ['activeCalories', 'exerciseMinutes', 'steps', 'weightKg', 'health', 'fitProfile']) {
    assert.equal(serialized.includes(forbidden), false, `market payload sağlık alanı içeriyor: ${forbidden}`);
  }
}

const full = normalizeHealthSummary({
  source: 'apple_healthkit',
  asOf: '2026-10-14T12:00:00Z',
  activeCalories: 420,
  steps: 6840,
  exerciseMinutes: 32,
  weightKg: 64,
  permissions: { activeCalories: 'granted', steps: 'granted', exercise: 'granted', weightKg: 'granted' },
});
assert.deepEqual(full, {
  source: 'apple_healthkit',
  asOf: '2026-10-14T12:00:00Z',
  activeCalories: 420,
  steps: 6840,
  exerciseMinutes: 32,
  weightKg: 64,
  permissions: { activeCalories: 'granted', steps: 'granted', exercise: 'granted', weightKg: 'granted' },
});

const partial = normalizeHealthSummary({
  source: 'health_connect',
  activeCalories: 420,
  steps: 6840,
  exerciseMinutes: 32,
  weightKg: 64,
  permissions: { activeCalories: 'granted', steps: 'denied', exercise: 'unavailable', weightKg: 'not_requested' },
});
assert.equal(partial.source, 'health_connect');
assert.equal(partial.activeCalories, 420);
assert.equal(partial.steps, null);
assert.equal(partial.exerciseMinutes, null);
assert.equal(partial.weightKg, null);

const invalid = normalizeHealthSummary({
  source: 'unknown_provider',
  asOf: 'not-a-date',
  activeCalories: -20,
  permissions: { activeCalories: 'granted' },
});
assert.equal(invalid.source, 'unknown');
assert.equal(invalid.asOf, null);
assert.equal(invalid.activeCalories, null);
assert.equal(partial.asOf, null);

const context = fitContext(full);
assert.deepEqual(context, {
  source: 'apple_healthkit',
  asOf: '2026-10-14T12:00:00Z',
  activeCalories: 420,
  steps: 6840,
  exerciseMinutes: 32,
  weightKg: 64,
});
assertNoHealthData(marketPayload({ candidateIds: ['candidate_domates'] }));

const iosPlan = buildHealthPermissionPlan('apple_healthkit');
const androidPlan = buildHealthPermissionPlan('health_connect');
assert.equal(iosPlan.live_connection, false);
assert.equal(iosPlan.read_only, true);
assert.deepEqual(iosPlan.write_permissions, []);
assert.deepEqual(iosPlan.connection, { state: 'not_connected', revoke_supported: true, provider_settings_fallback: true });
assert.deepEqual(iosPlan.consent, { explain_before_system_prompt: true, permission_level: 'per_data_type' });
assert.equal(iosPlan.permissions.find((item) => item.key === 'activeCalories').platform_type, 'HKQuantityTypeIdentifierActiveEnergyBurned');
assert.equal(androidPlan.permissions.find((item) => item.key === 'activeCalories').platform_type, 'ActiveCaloriesBurned');
assert.throws(() => buildHealthPermissionPlan('unknown'), /geçersiz sağlık sağlayıcısı/);
assert.equal(healthConnectionState({ provider: 'apple_healthkit', liveConnection: false }), 'not_connected');
assert.equal(healthConnectionState({ provider: 'apple_healthkit', liveConnection: true, permissions: { activeCalories: 'granted', steps: 'granted', exercise: 'granted', weightKg: 'granted' } }), 'connected');
assert.equal(healthConnectionState({ provider: 'health_connect', liveConnection: true, permissions: { activeCalories: 'granted', steps: 'denied', exercise: 'not_requested', weightKg: 'not_requested' } }), 'partial');
assert.equal(healthConnectionState({ provider: 'health_connect', liveConnection: true, permissions: { activeCalories: 'denied', steps: 'denied', exercise: 'denied', weightKg: 'denied' } }), 'denied');
assert.equal(healthConnectionState({ provider: 'health_connect', liveConnection: true, permissions: { activeCalories: 'unavailable', steps: 'unavailable', exercise: 'unavailable', weightKg: 'unavailable' } }), 'unavailable');

console.log('SOFRA_HEALTH_CONTRACT_TEST_OK');
console.log(`fullSource=${full.source} partialSource=${partial.source} readOnlyPlans=true marketHealthLeak=false`);
