import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createSofraServer } from './SOFRA-API-SERVER.mjs';
import { emptyStoreState, loadStore, saveStore } from './SOFRA-STORE-V1.mjs';

const directory = await mkdtemp(join(tmpdir(), 'sofra-api-persistence-'));
const filePath = join(directory, 'state.json');

const openServer = async (state) => {
  const instance = createSofraServer({ state, saveState: () => saveStore(filePath, state) });
  await new Promise((resolve) => instance.server.listen(0, '127.0.0.1', resolve));
  const address = instance.server.address();
  const base = `http://127.0.0.1:${address.port}`;
  return { ...instance, base };
};

try {
  const first = await openServer(await loadStore(filePath, { fallback: emptyStoreState() }));
  const createResponse = await fetch(`${first.base}/v1/pantry/items`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ display_name: 'Domates', canonical_name: 'domates', quantity_text: '2 adet', stock_state: 'available', source: 'manual' }),
  });
  assert.equal(createResponse.status, 201);
  await new Promise((resolve, reject) => first.server.close((error) => error ? reject(error) : resolve()));

  const restoredState = await loadStore(filePath);
  assert.equal(restoredState.pantry[0].display_name, 'Domates');
  const second = await openServer(restoredState);
  const listResponse = await fetch(`${second.base}/v1/pantry`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.equal(list.items[0].quantity_text, '2 adet');
  await new Promise((resolve, reject) => second.server.close((error) => error ? reject(error) : resolve()));
} finally {
  await rm(directory, { recursive: true, force: true });
}

console.log('SOFRA_API_PERSISTENCE_TEST_OK');
console.log('restart=restored pantry=ok');
