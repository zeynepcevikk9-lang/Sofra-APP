import assert from 'node:assert/strict';
import { createSofraServer } from './SOFRA-API-SERVER.mjs';

const { server } = createSofraServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = 'http://127.0.0.1:' + port;
const request = async (path, options = {}) => {
  const response = await fetch(base + path, { headers: { 'content-type': 'application/json' }, ...options });
  return { response, body: response.status === 204 ? null : await response.json() };
};

try {
  let result = await request('/v1/sync/status');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.cloud_sync, false);
  assert.equal(result.body.account_required, true);

  result = await request('/v1/sync/prepare', { method: 'POST', body: JSON.stringify({}) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.sync_status, 'consent_required');
  assert.equal(result.body.payload, null);

  await request('/v1/pantry/items', { method: 'POST', body: JSON.stringify({ display_name: 'Domates', stock_state: 'available', source: 'manual', quantity_text: '2 kg' }) });
  await request('/v1/plans', { method: 'POST', body: JSON.stringify({ date: '2026-10-19', servings: 2, main_recipe_id: 'recipe_oven_vegetables', custom_meals: [{ slot: 'dinner', title: 'Kendi ogunum', note: 'private sync note' }] }) });
  result = await request('/v1/sync/prepare', { method: 'POST', body: JSON.stringify({ consent: { sync: true, scopes: ['pantry', 'plans'] } }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.sync_status, 'ready_for_account_sync');
  assert.equal(result.body.payload.pantry.length, 1);
  assert.equal(result.body.payload.plans[0].custom_meals[0].note, 'private sync note');
  assert.equal(result.body.cloud_sync, false);
  assert.equal(result.body.persisted, false);
  assert.equal('health_summary' in result.body.payload, false);
  assert.equal('fit_profile' in result.body.payload, false);

  result = await request('/v1/sync/prepare', { method: 'POST', body: JSON.stringify({ consent: { sync: true, scopes: ['health_data'] } }) });
  assert.equal(result.response.status, 422);
  result = await request('/v1/sync/prepare', { method: 'POST', body: JSON.stringify({ health_summary: {} }) });
  assert.equal(result.response.status, 422);
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('SOFRA_SYNC_SERVER_TEST_OK');
