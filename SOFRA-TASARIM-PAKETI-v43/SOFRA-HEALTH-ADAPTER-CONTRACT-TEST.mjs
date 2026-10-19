import assert from 'node:assert/strict';
import { adaptHealthConnectPayload, adaptHealthKitPayload, adaptHealthPayload, buildHealthAdapterStatus } from './SOFRA-HEALTH-ADAPTERS-V1.mjs';

const permissions = { activeCalories: 'granted', steps: 'granted', exercise: 'granted', weightKg: 'granted' };
const asOf = '2026-10-16T10:00:00Z';

const ios = adaptHealthKitPayload({
  activeEnergyBurned: '420',
  stepCount: 6840,
  exerciseDurationMinutes: 32,
  bodyMassKg: '64,5',
  lastUpdatedAt: asOf,
}, { permissions });
assert.deepEqual(ios, {
  source: 'apple_healthkit',
  asOf,
  activeCalories: 420,
  steps: 6840,
  exerciseMinutes: 32,
  weightKg: 64.5,
  permissions,
});

const android = adaptHealthConnectPayload({
  activeCaloriesBurned: 310,
  steps: 4200,
  exerciseDurationMinutes: 18,
  weightKg: 72,
  asOf,
}, { permissions });
assert.equal(android.source, 'health_connect');
assert.equal(android.activeCalories, 310);
assert.equal(android.steps, 4200);
assert.equal(android.exerciseMinutes, 18);
assert.equal(android.weightKg, 72);

const partial = adaptHealthPayload('health_connect', { activeCaloriesBurned: 310, steps: 4200 }, {
  permissions: { activeCalories: 'granted', steps: 'denied', exercise: 'unavailable', weightKg: 'not_requested' },
  asOf,
});
assert.equal(partial.activeCalories, 310);
assert.equal(partial.steps, null);
assert.equal(partial.exerciseMinutes, null);
assert.equal(partial.weightKg, null);
assert.throws(() => adaptHealthPayload('unknown', {}), /sağlık sağlayıcısı/);

const safeDefaults = adaptHealthKitPayload({ activeEnergyBurned: 999, stepCount: 10 }, { asOf });
assert.equal(safeDefaults.activeCalories, null);
assert.equal(safeDefaults.steps, null);
assert.deepEqual(safeDefaults.permissions, { activeCalories: 'not_requested', steps: 'not_requested', exercise: 'not_requested', weightKg: 'not_requested' });

const defaultStatus = buildHealthAdapterStatus('apple_healthkit');
assert.equal(defaultStatus.connection.state, 'not_connected');
assert.equal(defaultStatus.live_connection, false);
assert.equal(defaultStatus.manual_fallback_available, true);
assert.equal(defaultStatus.health_context.activeCalories, null);
assert.equal(defaultStatus.permissions.find((item) => item.key === 'steps').status, 'not_requested');

const partialStatus = buildHealthAdapterStatus('health_connect', {
  permissions: ['activeCalories', 'steps'],
  liveConnection: true,
  activeCalories: 310,
  steps: 4200,
  asOf,
});
assert.equal(partialStatus.connection.state, 'partial');
assert.equal(partialStatus.health_context.activeCalories, 310);
assert.equal(partialStatus.health_context.steps, 4200);
assert.equal(partialStatus.health_context.weightKg, null);
assert.equal(partialStatus.permissions.find((item) => item.key === 'weightKg').status, 'not_requested');

const deniedStatus = buildHealthAdapterStatus('apple_healthkit', {
  permissions: { activeCalories: 'denied', steps: 'denied', exercise: 'denied', weightKg: 'denied' },
  liveConnection: true,
  activeCalories: 999,
});
assert.equal(deniedStatus.connection.state, 'denied');
assert.equal(deniedStatus.health_context.activeCalories, null);

console.log('SOFRA_HEALTH_ADAPTER_CONTRACT_OK');
console.log('ios=normalized android=normalized partial=bounded defaultPermissions=blocked status=exposed');

