import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { emptyStoreState, loadStore, normalizeStoreState, saveStore, STORE_SCHEMA_VERSION } from './SOFRA-STORE-V1.mjs';

const directory = await mkdtemp(join(tmpdir(), 'sofra-store-'));
const filePath = join(directory, 'state.json');

try {
  const initial = await loadStore(filePath);
  assert.equal(initial.schema_version, STORE_SCHEMA_VERSION);
  assert.deepEqual(initial.pantry, []);
  assert.equal(initial.nextId, 1);

  const state = emptyStoreState();
  state.nextId = 3;
  state.pantry.push({ id: 'pantry_1', display_name: 'Patates', quantity_text: '2 kg' });
  state.plans.push({ id: 'plan_1', main_recipe_id: 'recipe_oven_vegetables' });
  state.feedback.push({ recommendation_id: 'recipe_oven_vegetables', value: 'helpful' });
  await saveStore(filePath, state);
  const restored = await loadStore(filePath);
  assert.deepEqual(restored, state);
  state.pantry[0].quantity_text = '3 kg';
  await saveStore(filePath, state);
  const overwritten = await loadStore(filePath);
  assert.equal(overwritten.pantry[0].quantity_text, '3 kg', 'store ikinci yazmada güncellenmeli');

  assert.throws(() => normalizeStoreState({ pantry: [], plans: [], feedback: [], nextId: 0 }), /nextId/);
  assert.throws(() => normalizeStoreState({ pantry: {}, plans: [], feedback: [], nextId: 1 }), /dizileri/);
  await rm(filePath, { force: true });
  await assert.rejects(() => loadStore(filePath, { fallback: { schema_version: 99, pantry: [], plans: [], feedback: [], nextId: 1 } }), /sürümü/);
} finally {
  await rm(directory, { recursive: true, force: true });
}

console.log('SOFRA_STORE_CONTRACT_TEST_OK');
console.log(`schema=${STORE_SCHEMA_VERSION} atomicWrite=ok restore=ok validation=ok`);
