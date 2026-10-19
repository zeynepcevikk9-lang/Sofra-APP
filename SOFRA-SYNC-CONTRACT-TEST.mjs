import assert from 'node:assert/strict';
import { buildSyncEnvelope, buildSyncStatus, SYNC_EXCLUDED_FIELDS } from './SOFRA-SYNC-V1.mjs';

const state = {
  pantry: [{ id: 'pantry_1', canonical_name: 'domates', display_name: 'Domates', quantity_text: '2 kg', quantity_value: 2, quantity_unit: 'kg', stock_state: 'available', source: 'manual', updated_at: '2026-10-19T10:00:00Z', user_id: 'private' }],
  plans: [{ id: 'plan_1', date: '2026-10-19', servings: 2, main_recipe_id: 'recipe_oven_vegetables', optional_recipe_ids: [], custom_meals: [{ slot: 'dinner', title: 'Kendi ogunum', note: 'Senkronlanabilir ozel not' }] }],
  feedback: [{ recommendation_id: 'recommendation_1', value: 'helpful', created_at: '2026-10-19T10:00:00Z' }],
  fit_profile: { goal: 'lose' },
  health_summary: { activeCalories: 500 },
};

let envelope = buildSyncEnvelope({ state });
assert.equal(envelope.sync_status, 'consent_required');
assert.equal(envelope.payload, null);

envelope = buildSyncEnvelope({ state, consent: { sync: true, scopes: ['pantry', 'plans', 'feedback'] } });
assert.equal(envelope.sync_status, 'ready_for_account_sync');
assert.equal(envelope.cloud_sync, false);
assert.equal(envelope.persisted, false);
assert.equal(envelope.payload.pantry[0].quantity_text, '2 kg');
assert.equal(envelope.payload.plans[0].custom_meals[0].note, 'Senkronlanabilir ozel not');
assert.equal('fit_profile' in envelope.payload, false);
assert.equal('health_summary' in envelope.payload, false);
assert.equal('user_id' in envelope.payload.pantry[0], false);
assert.ok(SYNC_EXCLUDED_FIELDS.includes('health_data'));

const status = buildSyncStatus({ provider: 'anonymous' });
assert.equal(status.status, 'account_required');
assert.equal(status.upload_enabled, false);
assert.equal(status.download_enabled, false);
assert.equal(status.sensitive_data.health_data_included, false);

console.log('SOFRA_SYNC_CONTRACT_TEST_OK');
