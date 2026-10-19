import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalog, recommend, recipeDetails } from './SOFRA-ALGORITHM-V1.mjs';

const apiSpec = readFileSync(new URL('./SOFRA-API-V1.openapi.yaml', import.meta.url), 'utf8');
assert.ok(apiSpec.includes('ingredient_safety:'), 'tarif detayindaki malzeme guvenlik alani eksik');
assert.ok(apiSpec.includes('recipe_detail:'), 'oneride tarif detay baglantisi eksik');
const requiredPaths = [
  '/v1/me:',
  '/v1/auth/status:',
  '/v1/notifications/status:',
  '/v1/billing/status:',
  '/v1/recipes:',
  '/v1/recipes/{recipeId}:',
  '/v1/ai/status:',
  '/v1/health/permission-plan:',
  '/v1/health/adapter-status:',
  '/v1/recipe-sources/validate:',
  '/v1/pantry:',
  '/v1/pantry/items:',
  '/v1/pantry/items/bulk:',
  '/v1/pantry/parse-note:',
  '/v1/recommendations:',
  '/v1/plans:',
  '/v1/shopping/candidates:',
  '/v1/market/quotes:',
  '/v1/market/handoff:',
];

for (const path of requiredPaths) assert.ok(apiSpec.includes(path), `OpenAPI yolu eksik: ${path}`);
assert.ok(apiSpec.includes('HealthAdapterStatus'), 'Health adapter runtime durum semasi eksik');
assert.ok(apiSpec.includes('manual_fallback_available'), 'Health adapter manuel fallback alani eksik');
assert.ok(apiSpec.includes('NutritionProvenance'), 'Besin provenance semasi eksik');
assert.ok(apiSpec.includes('ingredient_weighted_per_100g'), 'Besin gram donusum hesap yontemi eksik');
assert.ok(apiSpec.includes('RecipeSourceValidation'), 'Tarif source validation semasi eksik');
assert.ok(apiSpec.includes('RecipeContentProvenance'), 'Tarif content provenance semasi eksik');
assert.ok(apiSpec.includes('health_summary:'), 'Fit sağlık bağlamı alanı eksik');
assert.ok(apiSpec.includes('health_context:'), 'Fit sağlık bağlamı yanıt alanı eksik');
assert.ok(apiSpec.includes('HealthContext'), 'Fit sağlık kullanım politikası şeması eksik');
assert.ok(apiSpec.includes('not_applied_without_verified_nutrition'), 'Fit sağlık sıralama güvenlik sınırı eksik');
assert.ok(apiSpec.includes('callback_exchange: { type: string, enum: [server_only] }'), 'OAuth token değişimi sunucu sınırı eksik');
assert.ok(apiSpec.includes('permission_level: { type: string, enum: [per_data_type] }'), 'sağlık izni veri türü kapsamı eksik');
assert.ok(apiSpec.includes('enum: [total, fast, single]'), 'market sıralama sözleşmesi eksik');
assert.ok(apiSpec.includes('safety_profile:'), 'gıda güvenliği profil alanı eksik');
assert.ok(apiSpec.includes('SafetyProfile'), 'gıda güvenliği şeması eksik');
assert.ok(apiSpec.includes('FitProfile'), 'Fit profil şeması eksik');
assert.ok(apiSpec.includes('fit_target:'), 'Fit hedef yanıt alanı eksik');
assert.ok(apiSpec.includes('fit_goal_boost:'), 'Fit hedef puanı yanıt alanı eksik');
assert.ok(apiSpec.includes('recent_add_boost:'), 'yeni eklenen ürün puanı yanıt alanı eksik');
assert.ok(apiSpec.includes('AiStatus'), 'AI durum şeması eksik');
assert.ok(apiSpec.includes('ingredients_detail:'), 'tarif detayındaki ölçülü malzeme alanı eksik');
assert.ok(apiSpec.includes('instructions_available:'), 'tarif detayındaki hazırlanış durumu eksik');
assert.ok(apiSpec.includes('servings:'), 'tarif detayındaki porsiyon alanı eksik');
assert.ok(apiSpec.includes('required_quantity_text:'), 'alışveriş adayında gereken miktar alanı eksik');
assert.ok(apiSpec.includes('pantry_quantity_text:'), 'alışveriş adayında dolap miktarı alanı eksik');

const store = {
  pantry: [],
  plans: [],
  feedback: [],
  nextId: 1,
};

function createPantryItem(input) {
  assert.ok(input.display_name, 'display_name zorunlu');
  assert.ok(['available', 'low', 'finished', 'unknown'].includes(input.stock_state), 'geçersiz stock_state');
  const item = {
    id: `pantry_${store.nextId++}`,
    user_id: 'usr_contract_test',
    canonical_name: input.canonical_name ?? input.display_name.toLocaleLowerCase('tr-TR'),
    display_name: input.display_name,
    quantity_text: input.quantity_text ?? null,
    quantity_value: input.quantity_value ?? null,
    quantity_unit: input.quantity_unit ?? null,
    stock_state: input.stock_state,
    expiry_date: input.expiry_date ?? null,
    source: input.source ?? 'manual',
    confidence: input.confidence ?? null,
    updated_at: '2026-10-14T12:00:00Z',
  };
  store.pantry.push(item);
  return item;
}

function updatePantryItem(id, patch) {
  const item = store.pantry.find((entry) => entry.id === id);
  assert.ok(item, `pantry kaydı bulunamadı: ${id}`);
  Object.assign(item, patch, { updated_at: '2026-10-14T12:05:00Z' });
  return item;
}

function createPlan(input) {
  assert.ok(input.main_recipe_id, 'main_recipe_id zorunlu');
  const plan = { id: `plan_${store.nextId++}`, ...input };
  store.plans.push(plan);
  return plan;
}

function shoppingCandidates() {
  const plannedRecipeIds = store.plans.flatMap((plan) => [plan.main_recipe_id, ...(plan.optional_recipe_ids ?? [])]);
  const ingredients = [...new Set(plannedRecipeIds.flatMap((id) => catalog.find((recipe) => recipe.id === id)?.ingredients ?? []))];
  return ingredients.map((name) => {
    const item = store.pantry.find((entry) => entry.canonical_name.includes(name) || name.includes(entry.canonical_name));
    const state = !item ? 'check' : item.stock_state === 'finished' ? 'missing' : 'in_pantry';
    const required = plannedRecipeIds.flatMap((id) => recipeDetails[id]?.ingredients ?? [])
      .filter(([, ingredient]) => ingredient === name)
      .map(([quantity]) => quantity);
    return {
      id: `candidate_${name}`,
      name,
      state,
      required_quantity_text: [...new Set(required)].join(' + ') || null,
      pantry_quantity_text: item?.quantity_text ?? null,
      reason: !item ? 'Dolabında kayıt yok' : undefined,
    };
  });
}

function marketQuotes({ candidateIds, userConfirmed }) {
  assert.equal(userConfirmed, true, 'market teklifi için kullanıcı onayı gerekir');
  assert.ok(candidateIds?.length, 'candidateIds boş olamaz');
  return [{ provider: 'demo-market', quoted_at: '2026-10-14T12:10:00Z', estimated_total: 360.9, delivery_fee: 29.9, minimum_basket: null, delivery_eta_minutes: null, stock_state: 'unknown', partnership_label: null }];
}

// 1) Bilinmeyen miktarı ve isteğe bağlı SKT'yi aynen koru.
const potato = createPantryItem({ display_name: 'Patates', canonical_name: 'patates', quantity_text: 'Miktarı belirsiz', stock_state: 'available', expiry_date: '2026-10-16' });
assert.equal(potato.quantity_text, 'Miktarı belirsiz');
assert.equal(potato.expiry_date, '2026-10-16');

// 2) Güncelleme ve durum semantiği.
const cheese = createPantryItem({ display_name: 'Peynir', canonical_name: 'peynir', quantity_text: null, stock_state: 'low' });
updatePantryItem(cheese.id, { stock_state: 'finished' });
assert.equal(cheese.stock_state, 'finished');

// 3) SKT önceliği ve açıklanabilir öneri.
const recommendationResult = recommend({ mode: 'sofra', maxMinutes: 45, inventory: store.pantry, now: new Date('2026-10-14T00:00:00Z') })[0];
assert.equal(recommendationResult.id, 'recipe_oven_vegetables');
assert.equal(recommendationResult.expiryBoost, true);
assert.equal(recommendationResult.reasonCode, 'expiry_priority');
assert.ok(recommendationResult.missing.includes('domates'));

// 4) Fit, kısa süreli doğrulanmış Fit tarifini öne alır; eşleşen malzeme kuralı
// süre filtresinden önce gelir ve dolap eşleşmesi varsa tarif listede kalabilir.
const fitResult = recommend({ mode: 'fit', maxMinutes: 15, inventory: [], now: new Date('2026-10-14T00:00:00Z') })[0];
assert.equal(fitResult.id, 'recipe_yogurt_bowl');
assert.equal(fitResult.fit, true);

// 4b) Açık geri bildirim benzer tariflere sınırlı tercih sinyali taşır;
// yakın zamanda gösterilen tarif ise tekrar cezası alır.
const learned = recommend({ mode: 'sofra', inventory: [], feedback: [{ recipe_id: 'recipe_pasta_mushroom', value: 'helpful' }], recentRecipeIds: ['recipe_noodle'] });
assert.ok(learned.find((item) => item.id === 'recipe_noodle')?.repeatPenalty < 0);
assert.ok(learned.find((item) => item.id === 'recipe_noodle')?.preferenceBoost > 0);

// 5) Plan → alışveriş adayı zinciri; eklenmeyen ürün kesin yok sayılmaz.
const plan = createPlan({ date: '2026-10-14', servings: 4, main_recipe_id: 'recipe_oven_vegetables', optional_recipe_ids: ['recipe_yogurt_bowl'] });
assert.equal(plan.main_recipe_id, 'recipe_oven_vegetables');
assert.deepEqual(plan.custom_meals ?? [], []);
const candidates = shoppingCandidates();
assert.equal(candidates.find((item) => item.name === 'domates')?.state, 'check');
assert.equal(candidates.find((item) => item.name === 'patates')?.state, 'in_pantry');
assert.equal(candidates.find((item) => item.name === 'peynir')?.state, 'missing');
assert.equal(candidates.find((item) => item.name === 'patates')?.pantry_quantity_text, 'Miktarı belirsiz');

// 6) Market adapter kullanıcı onayı olmadan çağrılamaz.
assert.throws(() => marketQuotes({ candidateIds: ['candidate_domates'], userConfirmed: false }), /onayı gerekir/);
assert.equal(marketQuotes({ candidateIds: ['candidate_domates'], userConfirmed: true })[0].provider, 'demo-market');

assert.ok(apiSpec.includes('canonical_name:'), 'tarif malzemesinde kanonik ad alani eksik');
assert.ok(apiSpec.includes('quantity_value:'), 'tarif malzemesinde sayisal miktar alani eksik');
assert.ok(apiSpec.includes('quantity_text:'), 'tarif malzemesinde gorunen miktar alani eksik');
assert.ok(apiSpec.includes('step_media:'), 'tarif adim gorsel alani eksik');
console.log('SOFRA_API_CONTRACT_TEST_OK');
console.log(`pantry=${store.pantry.length} plans=${store.plans.length} candidates=${candidates.length}`);
