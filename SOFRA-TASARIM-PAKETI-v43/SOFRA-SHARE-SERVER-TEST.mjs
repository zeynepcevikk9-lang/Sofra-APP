import assert from 'node:assert/strict';
import { createSofraServer } from './SOFRA-API-SERVER.mjs';

const { server } = createSofraServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const request = async (path, options = {}) => {
  const response = await fetch(base + path, { headers: { 'content-type': 'application/json' }, ...options });
  return { response, body: response.status === 204 ? null : await response.json() };
};

try {
  let result = await request('/v1/share/preview', { method: 'POST', body: JSON.stringify({ resource_type: 'recipe', recipe_id: 'recipe_pasta_mushroom' }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.share_status, 'preview_only');
  assert.equal(result.body.live_link, false);
  assert.equal(result.body.persisted, false);
  assert.equal(result.body.public_payload.resource_type, 'recipe');
  assert.equal(result.body.privacy.health_data_included, false);
  assert.equal(result.body.public_payload.recipe.id, 'recipe_pasta_mushroom');
  assert.equal('pantry' in result.body.public_payload, false);
  assert.equal('fit_profile' in result.body.public_payload, false);

  result = await request('/v1/plans', { method: 'POST', body: JSON.stringify({
    date: '2026-10-19',
    servings: 2,
    main_recipe_id: 'recipe_pasta_mushroom',
    custom_meals: [{ slot: 'snack', title: 'Kendi ara ogunum', note: 'private note' }],
  }) });
  assert.equal(result.response.status, 201);
  const planId = result.body.id;

  result = await request('/v1/share/preview', { method: 'POST', body: JSON.stringify({ resource_type: 'plan', plan_id: planId }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.public_payload.resource_type, 'plan');
  assert.equal(result.body.public_payload.plan.custom_meals[0].title, 'Kendi ara ogunum');
  assert.equal('note' in result.body.public_payload.plan.custom_meals[0], false);
  assert.equal(result.body.privacy.pantry_included, false);
  assert.equal(result.body.privacy.fit_profile_included, false);

  result = await request('/v1/share/preview', { method: 'POST', body: JSON.stringify({ resource_type: 'recipe', recipe_id: 'recipe_pasta_mushroom', health_summary: {} }) });
  assert.equal(result.response.status, 422);

  result = await request('/v1/share/preview', { method: 'POST', body: JSON.stringify({ resource_type: 'plan', plan_id: 'plan_missing' }) });
  assert.equal(result.response.status, 404);
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('SOFRA_SHARE_SERVER_TEST_OK');
