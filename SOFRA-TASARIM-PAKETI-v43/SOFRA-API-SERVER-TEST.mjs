import assert from 'node:assert/strict';
import { createSofraServer } from './SOFRA-API-SERVER.mjs';

let persistedState = null;
const { server } = createSofraServer({ saveState: async (state) => { persistedState = JSON.parse(JSON.stringify(state)); } });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const request = async (path, options = {}) => {
  const response = await fetch(base + path, { headers: { 'content-type': 'application/json' }, ...options });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
};

try {
  let result = await request('/v1/me');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.auth_provider, 'anonymous');

  result = await request('/v1/auth/status');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.session.provider, 'anonymous');
  assert.equal(result.body.account_linking.available, false);
  assert.deepEqual(result.body.providers.map((provider) => provider.id), ['google', 'apple']);

  result = await request('/v1/notifications/status?platform=ios');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.permission_status, 'not_requested');
  assert.equal(result.body.live_permission, false);
  assert.equal(result.body.permission_plan.permission_api, 'UNUserNotificationCenter');

  result = await request('/v1/recipes?mode=fit&query=patl%C4%B1can&max_minutes=45');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.items[0].id, 'recipe_eggplant_olive_oil');
  assert.equal(result.body.items[0].fit_verification, 'unverified');
  assert.equal(result.body.items[0].nutrition, null);
  result = await request('/v1/recipes/recipe_eggplant_olive_oil');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.title, 'Zeytinyağlı patlıcan');
  assert.equal(result.body.source, 'catalog_v1');
  assert.equal(result.body.instructions_available, true);
  assert.equal(result.body.servings, 2);
  assert.equal(result.body.ingredients_detail[0][1], 'patlıcan');
  assert.equal(result.body.instructions.length, 3);
  result = await request('/v1/recipes/recipe_does_not_exist');
  assert.equal(result.response.status, 404);
  result = await request('/v1/recipes?mode=tatli&query=patl%C4%B1can');
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.body.items, [], 'Tatlı filtresi sebze tarifini döndürmemeli');

  result = await request('/v1/billing/status');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.current_plan, 'free');
  assert.equal(result.body.checkout.available, false);
  assert.equal(result.body.checkout.live, false);

  result = await request('/v1/ai/status');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.provider_status, 'not_connected');
  assert.equal(result.body.fallback, 'deterministic');
  assert.equal(result.body.auto_save, false);
  assert.equal(result.body.tasks.pantry_note.confirmation_required, true);
  assert.equal(result.body.tasks.pantry_note.ready, true);
  assert.equal(result.body.tasks.recipe_normalization.ready, false);
  assert.equal(result.body.tasks.recommendation_explanation.ready, false);

  result = await request('/v1/health/permission-plan?provider=apple_healthkit');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.live_connection, false);
  assert.deepEqual(result.body.write_permissions, []);
  assert.equal(result.body.permissions.find((item) => item.key === 'activeCalories').platform_type, 'HKQuantityTypeIdentifierActiveEnergyBurned');

  result = await request('/v1/health/permission-plan?provider=unknown');
  assert.equal(result.response.status, 422, 'bilinmeyen sağlık sağlayıcısı kabul edilmemeli');

  result = await request('/v1/pantry/parse-note', { method: 'POST', body: JSON.stringify({ text: '6 yumurta aldım, peynir azaldı, süt bitti, bilinmeyen ürün' }) });
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.body.items.map((item) => [item.canonical_name, item.stock_state]), [['yumurta', 'available'], ['peynir', 'low'], ['süt', 'finished']]);
  assert.equal(result.body.items[0].quantity_text, '6 yumurta');
  assert.equal(result.body.unparsed_text, 'bilinmeyen ürün');
  assert.equal(result.body.parser, 'deterministic_fallback');
  assert.equal(result.body.ai_status, 'not_connected');
  assert.equal(result.body.requires_user_confirmation, true);
  assert.equal(result.body.auto_saved, false);
  result = await request('/v1/pantry');
  assert.deepEqual(result.body.items, [], 'önizleme endpointi kullanıcı onayı olmadan dolaba yazmamalı');

  result = await request('/v1/pantry/items/bulk', { method: 'POST', body: JSON.stringify({ items: [
    { display_name: 'Yumurta', canonical_name: 'yumurta', quantity_text: '6 adet', stock_state: 'available', source: 'natural_note' },
    { display_name: 'Peynir', canonical_name: 'peynir', quantity_text: 'Miktarı ayrıca doğrula', stock_state: 'low', source: 'natural_note' },
  ] }) });
  assert.equal(result.response.status, 201);
  assert.equal(result.body.count, 2, 'onaylanan toplu dolap kaydı iki ürün içermeli');
  assert.equal(result.body.items[0].source, 'natural_note');
  assert.equal(persistedState?.pantry.length, 2, 'API mutasyonu persist callback’ine ulaşmalı');
  result = await request('/v1/pantry');
  const pantryCountAfterBulk = result.body.items.length;
  result = await request('/v1/pantry/items/bulk', { method: 'POST', body: JSON.stringify({ items: [
    { display_name: 'Domates', canonical_name: 'domates', quantity_text: '2 adet', stock_state: 'available', source: 'natural_note' },
    { display_name: 'Hatalı', canonical_name: 'hatali', quantity_text: null, stock_state: 'invalid', source: 'natural_note' },
  ] }) });
  assert.equal(result.response.status, 422, 'geçersiz toplu kayıtta hiçbir ürün yazılmamalı');
  result = await request('/v1/pantry');
  assert.equal(result.body.items.length, pantryCountAfterBulk, 'atomik toplu kayıtta kısmi yazım olmamalı');

  result = await request('/v1/pantry/parse-note', { method: 'POST', body: JSON.stringify({ text: '' }) });
  assert.equal(result.response.status, 422, 'boş doğal not kabul edilmemeli');

  result = await request('/v1/pantry/items', { method: 'POST', body: JSON.stringify({ display_name: 'Patates', canonical_name: 'patates', quantity_text: 'Miktarı belirsiz', stock_state: 'available', source: 'manual', expiry_date: '2026-10-16' }) });
  assert.equal(result.response.status, 201);
  const potatoId = result.body.id;
  assert.equal(result.body.expiry_date, '2026-10-16');

  result = await request(`/v1/pantry/items/${potatoId}`, { method: 'PATCH', body: JSON.stringify({ stock_state: 'low' }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.stock_state, 'low');

  result = await request(`/v1/pantry/items/${potatoId}`, { method: 'PATCH', body: JSON.stringify({ user_id: 'attacker' }) });
  assert.equal(result.response.status, 422, 'korumalı alanlar PATCH ile değişmemeli');

  result = await request(`/v1/pantry/items/${potatoId}`, { method: 'PATCH', body: JSON.stringify({ stock_state: 'invalid' }) });
  assert.equal(result.response.status, 422, 'geçersiz stok durumu kabul edilmemeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', max_minutes: 45, servings: 4 }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.recipe_id, 'recipe_oven_vegetables');
  assert.equal(result.body.expiry_boost, true);

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'unknown', servings: 4 }) });
  assert.equal(result.response.status, 422, 'geçersiz mod kabul edilmemeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, pantry_item_ids: [potatoId] }) });
  assert.equal(result.response.status, 200);
  assert.ok(result.body.matched_ingredients.includes('patates'), 'seçili dolap ürünü öneriye yansımadı');
  assert.ok(!result.body.matched_ingredients.includes('domates'), 'seçili olmayan dolap ürünü öneriye sızdı');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, pantry_item_ids: ['pantry_missing'] }) });
  assert.equal(result.response.status, 422, 'yabancı dolap kimliği kabul edilmemeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, unexpected: true }) });
  assert.equal(result.response.status, 422, 'tanımsız öneri alanı kabul edilmemeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({
    mode: 'fit', servings: 4,
    health_summary: {
      source: 'apple_healthkit', asOf: '2026-10-14T12:00:00Z', activeCalories: 420, steps: 6840,
      exerciseMinutes: 32, weightKg: 64, permissions: { activeCalories: 'granted', steps: 'granted', exercise: 'granted', weightKg: 'granted' },
    },
  }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.health_context.source, 'apple_healthkit');
  assert.equal(result.body.health_context.activeCalories, 420);
  assert.equal(result.body.fit_verification, 'unverified');
  assert.equal(result.body.nutrition, null, 'doğrulanmamış tarif kalorisi öneriye taşınmamalı');
  assert.equal(result.body.safety.status, 'not_requested');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'fit', servings: 4, fit_profile: { gender: 'Kadın', age: 30, height: 165, weight: 60, activityFactor: 1.375, goalKey: 'lose' } }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.fit_target.ready, true);
  assert.equal(result.body.fit_target.targetKcal, 1515);
  assert.equal(result.body.fit_target.approximate, true);
  assert.equal(result.body.fit_goal_boost, 20, 'Fit hedefi öneri puanına yansımadı');
  assert.equal(result.body.reason_code, 'fit_goal', 'Fit hedefi açıklaması dönmedi');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'fit', servings: 1, pantry_item_ids: [], fit_profile: { gender: 'Kadın', age: 30, height: 165, weight: 60, activityFactor: 1.375, goalKey: 'gain' } }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.recipe_id, 'recipe_avocado_egg_toast', 'kilo alma hedefi enerji yoğun Fit tarifi öne çıkarmadı');
  assert.equal(result.body.fit_goal_boost, 20);

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'fit', servings: 4, fit_profile: { age: 30, unknown_field: true } }) });
  assert.equal(result.response.status, 422, 'tanımsız Fit profil alanı kabul edilmemeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, safety_profile: { selected: ['gluten'] } }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.recipe_id, null, 'doğrulanmamış tarif çölyak profiline önerilmemeli');
  assert.equal(result.body.reason_code, 'safety_review_required');
  assert.equal(result.body.safety.reason, 'no_verified_match');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, safety_profile: { selected: ['unknown'] } }) });
  assert.equal(result.response.status, 422, 'geçersiz gıda güvenliği anahtarı kabul edilmemeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'fit', servings: 4, health_summary: { source: 'health_connect', activeCalories: -1, permissions: { activeCalories: 'granted' } } }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.health_context.activeCalories, null, 'geçersiz sağlık metriği öneriye taşınmamalı');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, recent_recipe_ids: ['recipe_oven_vegetables'] }) });
  assert.equal(result.response.status, 200);
  assert.equal(typeof result.body.repeat_penalty, 'number', 'tekrar cezası öneri yanıtına taşınmalı');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4, recent_recipe_ids: ['recipe_unknown'] }) });
  assert.equal(result.response.status, 422, 'bilinmeyen recent_recipe_ids kabul edilmemeli');

  result = await request('/v1/plans', { method: 'POST', body: JSON.stringify({ date: '2026-10-14', servings: 4, main_recipe_id: 'recipe_oven_vegetables' }) });
  assert.equal(result.response.status, 201);
  assert.deepEqual(result.body.optional_recipe_ids, []);

  result = await request('/v1/plans', { method: 'POST', body: JSON.stringify({ date: '14-10-2026', servings: 4, main_recipe_id: 'recipe_oven_vegetables' }) });
  assert.equal(result.response.status, 422, 'geçersiz plan tarihi kabul edilmemeli');

  result = await request('/v1/plans', { method: 'POST', body: JSON.stringify({ date: '2026-10-14', servings: 0, main_recipe_id: 'recipe_oven_vegetables' }) });
  assert.equal(result.response.status, 422, 'geçersiz kişi sayısı kabul edilmemeli');

  result = await request('/v1/plans', { method: 'POST', body: JSON.stringify({ date: '2026-10-14', servings: 4, main_recipe_id: 'recipe_unknown' }) });
  assert.equal(result.response.status, 422, 'geçersiz ana tarif kabul edilmemeli');

  result = await request('/v1/plans', { method: 'POST', body: JSON.stringify({ date: '2026-10-14', servings: 4, main_recipe_id: 'recipe_oven_vegetables', optional_recipe_ids: ['recipe_pasta_mushroom', 'recipe_pasta_mushroom'] }) });
  assert.equal(result.response.status, 422, 'tekrarlı opsiyonel tarif kabul edilmemeli');

  result = await request('/v1/shopping/candidates');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.items.find((item) => item.name === 'patates').state, 'in_pantry');
  assert.equal(result.body.items.find((item) => item.name === 'domates').state, 'check');

  result = await request('/v1/plans?view=month');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.view, 'month');

  result = await request('/v1/plans?view=quarter');
  assert.equal(result.response.status, 422, 'geçersiz plan görünümü kabul edilmemeli');

  result = await request('/v1/market/quotes', { method: 'POST', body: JSON.stringify({ candidateIds: ['candidate_domates'], userConfirmed: false }) });
  assert.equal(result.response.status, 409, 'onaysız market isteği 409 olmalı');

  result = await request('/v1/market/quotes', { method: 'POST', body: JSON.stringify({ candidateIds: [], userConfirmed: true }) });
  assert.equal(result.response.status, 422, 'boş market listesi kabul edilmemeli');

  result = await request('/v1/market/quotes', { method: 'POST', body: JSON.stringify({ candidateIds: ['candidate_harici_urun'], userConfirmed: true }) });
  assert.equal(result.response.status, 422, 'Plan dışı market adayı gönderilmemeli');

  result = await request('/v1/market/quotes', { method: 'POST', body: JSON.stringify({ candidateIds: ['candidate_domates'], userConfirmed: true }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.market_status, 'demo_only');
  assert.equal(result.body.sort, 'total');
  assert.equal(result.body.quotes[0].provider, 'CarrefourSA');
  assert.equal(result.body.quotes[0].comparison_state, 'comparable');
  assert.equal(result.body.quotes.find((quote) => quote.provider === 'Getir').comparison_state, 'minimum_basket_not_met');
  result = await request('/v1/market/quotes', { method: 'POST', body: JSON.stringify({ candidateIds: ['candidate_domates'], userConfirmed: true, sort: 'fast' }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.sort, 'fast');
  assert.equal(result.body.quotes[0].retailer, 'Getir');

  result = await request('/v1/market/handoff', { method: 'POST', body: JSON.stringify({ provider: 'CarrefourSA', candidateIds: ['candidate_domates'], userConfirmed: true }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.market_status, 'demo_only');
  assert.equal(result.body.handoff_status, 'not_connected');
  assert.equal(result.body.partner_url, null);

  result = await request('/v1/market/handoff', { method: 'POST', body: JSON.stringify({ provider: 'CarrefourSA', candidateIds: ['candidate_domates'], userConfirmed: false }) });
  assert.equal(result.response.status, 409, 'onaysız market yönlendirmesi yapılmamalı');

  result = await request('/v1/recommendations/recommendation_recipe_oven_vegetables/feedback', { method: 'POST', body: JSON.stringify({ value: 'helpful' }) });
  assert.equal(result.response.status, 204, 'geçerli geri bildirim kaydedilmeli');

  result = await request('/v1/recommendations', { method: 'POST', body: JSON.stringify({ mode: 'sofra', servings: 4 }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.learning_boost, 6, 'olumlu geri bildirim öneri puanına yansımadı');

  result = await request('/v1/recommendations/not-a-recipe/feedback', { method: 'POST', body: JSON.stringify({ value: 'helpful' }) });
  assert.equal(result.response.status, 422, 'yabancı öneri kimliği kabul edilmemeli');

  result = await request('/v1/me/export');
  assert.equal(result.response.status, 200);
  assert.equal(result.body.schema_version, 1);
  assert.equal(result.body.data.pantry.length, 3);
  assert.equal(result.body.data.plans.length, 1);
  assert.equal(result.body.data.feedback.length, 1);

  result = await request('/v1/me/data', { method: 'DELETE' });
  assert.equal(result.response.status, 204, 'veri silme 204 dönmeli');
  result = await request('/v1/pantry');
  assert.deepEqual(result.body.items, [], 'silme sonrası dolap boş olmalı');
  result = await request('/v1/plans');
  assert.deepEqual(result.body.items, [], 'silme sonrası plan boş olmalı');
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

console.log('SOFRA_API_SERVER_TEST_OK');
