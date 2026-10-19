import http from 'node:http';
import { catalog, matchesRecipeSearch, normalize as normalizeRecipeText, recipeDetails, recipeStepMedia, recommend } from './SOFRA-ALGORITHM-V1.mjs';
import { buildMarketHandoff, buildMarketRequest, rankQuotes } from './SOFRA-MARKET-V1.mjs';
import { canonicalizeIngredient, parsePantryNote, parseQuantityText } from './SOFRA-INGEST-V1.mjs';
import { buildHealthPermissionPlan, fitContext, normalizeHealthSummary } from './SOFRA-HEALTH-V1.mjs';
import { buildHealthAdapterStatus } from './SOFRA-HEALTH-ADAPTERS-V1.mjs';
import { recipeNutrition } from './SOFRA-NUTRITION-V1.mjs';
import { inspectIngredientSafety, normalizeSafetyProfile, SAFETY_KEYS } from './SOFRA-SAFETY-V1.mjs';
import { calculateFitTarget, normalizeFitProfile } from './SOFRA-FIT-V1.mjs';
import { AI_SCHEMA_VERSION, AI_TASKS } from './SOFRA-AI-V1.mjs';
import { emptyStoreState, loadStore, saveStore } from './SOFRA-STORE-V1.mjs';
import { buildAuthStatus } from './SOFRA-AUTH-V1.mjs';
import { buildNotificationStatus } from './SOFRA-NOTIFICATIONS-V1.mjs';
import { buildBillingStatus } from './SOFRA-BILLING-V1.mjs';

const json = (res, status, body) => {
  const payload = body == null ? '' : JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(payload);
};

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error('Geçersiz JSON'), { status: 400 }); }
}

function errorResponse(res, error) {
  const status = error.status || 500;
  json(res, status, { code: status === 404 ? 'not_found' : 'invalid_request', message: error.message || 'Beklenmeyen hata' });
}

function createState() {
  return emptyStoreState();
}

const pantryStates = ['available', 'low', 'finished', 'unknown'];
const pantrySources = ['manual', 'natural_note', 'receipt_ocr', 'voice'];
const isoDate = (value) => value == null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()));

function validationError(message) { return Object.assign(new Error(message), { status: 422 }); }

function buildPantryItem(state, input) {
  const displayName = String(input.display_name || '').trim();
  if (!displayName) throw validationError('display_name zorunlu');
  if (!pantryStates.includes(input.stock_state)) throw validationError('geçersiz stock_state');
  if (!pantrySources.includes(input.source)) throw validationError('geçersiz source');
  if (!isoDate(input.expiry_date)) throw validationError('geçersiz expiry_date');
  if (input.quantity_value != null && (!Number.isFinite(input.quantity_value) || input.quantity_value < 0)) throw validationError('geçersiz quantity_value');
  if (input.confidence != null && (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1)) throw validationError('geçersiz confidence');
  const parsedQuantity = input.quantity_text && input.quantity_value == null ? parseQuantityText(input.quantity_text) : { value: input.quantity_value ?? null, unit: input.quantity_unit ?? null };
  return {
    id: `pantry_${state.nextId++}`,
    user_id: 'usr_anonymous_demo',
    canonical_name: canonicalizeIngredient(input.canonical_name || displayName),
    display_name: displayName,
    quantity_text: input.quantity_text ?? null,
    quantity_value: parsedQuantity.value,
    quantity_unit: parsedQuantity.unit,
    stock_state: input.stock_state,
    expiry_date: input.expiry_date ?? null,
    source: input.source || 'manual',
    confidence: input.confidence ?? null,
    updated_at: new Date().toISOString(),
  };
}

function buildPantryBatch(state, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw validationError('geçersiz toplu dolap gövdesi');
  const allowed = ['items'];
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length) throw validationError(`güncellenemeyen toplu dolap alanı: ${unknown[0]}`);
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) throw validationError('items 1 ile 50 arasında olmalı');
  const shadow = { nextId: state.nextId };
  const items = input.items.map((item) => buildPantryItem(shadow, item));
  return { items, nextId: shadow.nextId };
}

function buildPantryPatch(input) {
  const allowed = ['quantity_text', 'quantity_value', 'quantity_unit', 'stock_state', 'expiry_date'];
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length) throw validationError(`güncellenemeyen alan: ${unknown[0]}`);
  if (!Object.keys(input).length) throw validationError('en az bir alan gerekli');
  if ('stock_state' in input && !pantryStates.includes(input.stock_state)) throw validationError('geçersiz stock_state');
  if ('expiry_date' in input && !isoDate(input.expiry_date)) throw validationError('geçersiz expiry_date');
  if ('quantity_text' in input && input.quantity_text != null && typeof input.quantity_text !== 'string') throw validationError('geçersiz quantity_text');
  if ('quantity_unit' in input && input.quantity_unit != null && typeof input.quantity_unit !== 'string') throw validationError('geçersiz quantity_unit');
  if ('quantity_value' in input && input.quantity_value != null && (!Number.isFinite(input.quantity_value) || input.quantity_value < 0)) throw validationError('geçersiz quantity_value');
  return Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
}

function recipeById(id) { return catalog.find((recipe) => recipe.id === id); }

const recipeUnitAliases = new Map([
  ['kg', 'kg'], ['kilo', 'kg'], ['g', 'g'], ['gram', 'g'], ['adet', 'adet'],
  ['l', 'litre'], ['litre', 'litre'], ['ml', 'ml'], ['paket', 'paket'],
  ['kutu', 'kutu'], ['demet', 'demet'], ['sise', 'şişe'], ['şişe', 'şişe'],
  ['kavanoz', 'kavanoz'], ['dilim', 'dilim'], ['avuç', 'avuç'], ['yemek kasigi', 'yemek kaşığı'],
  ['cay kasigi', 'çay kaşığı'], ['su bardagi', 'su bardağı'], ['çay kasigi', 'çay kaşığı'],
]);

function parseRecipeQuantity(quantityText) {
  const text = String(quantityText ?? '').trim();
  const match = text.match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return { quantity_text: text || null, quantity_value: null, unit: null };
  const rawNumber = match[1].replace(',', '.');
  const value = rawNumber.includes('/')
    ? (() => { const [numerator, denominator] = rawNumber.split('/').map(Number); return denominator ? numerator / denominator : null; })()
    : Number(rawNumber);
  const rest = match[2].trim();
  const normalizedRest = normalizeRecipeText(rest);
  const unit = recipeUnitAliases.get(normalizedRest) || recipeUnitAliases.get(normalizedRest.split(' ').slice(0, 2).join(' ')) || null;
  return { quantity_text: text || null, quantity_value: Number.isFinite(value) ? value : null, unit };
}

function formatScaledQuantity(value) {
  if (!Number.isFinite(value)) return null;
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(2)).toString().replace('.', ',');
}

function scaleQuantityText(quantityText, factor) {
  const text = String(quantityText ?? '').trim();
  if (!text || factor === 1) return text || null;
  const match = text.match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return text;
  const parsed = parseRecipeQuantity(text);
  if (parsed.quantity_value == null) return text;
  const scaled = formatScaledQuantity(parsed.quantity_value * factor);
  return scaled == null ? text : `${scaled}${match[2] ? ` ${match[2].trim()}` : ''}`;
}

function serializeIngredientDetail(entry, factor = 1) {
  const [quantityText, displayName] = Array.isArray(entry) ? entry : [entry?.quantity_text, entry?.display_name || entry?.canonical_name];
  const parsed = parseRecipeQuantity(quantityText);
  const quantityValue = parsed.quantity_value == null ? null : Number((parsed.quantity_value * factor).toFixed(4));
  return {
    canonical_name: normalizeRecipeText(displayName),
    display_name: displayName || null,
    quantity_text: scaleQuantityText(quantityText, factor),
    quantity_value: quantityValue,
    unit: parsed.unit,
  };
}

function serializeRecipe(recipe) {
  const nutrition = recipeNutrition(recipe);
  return {
    id: recipe.id,
    title: recipe.title,
    minutes: recipe.mins,
    emoji: recipe.emoji,
    ingredients: recipe.ingredients,
    tags: recipe.tags,
    fit: recipe.fit,
    fit_goals: recipe.fitGoals || [],
    fit_verification: nutrition.fit_verification,
    nutrition: nutrition.nutrition,
    safety: {
      allergens: recipe.safety?.allergens || [],
      verified: recipe.safety?.verified === true,
      cross_contamination: recipe.safety?.crossContamination || 'unknown',
    },
  };
}

function serializeRecipeDetail(recipe, requestedServings = null) {
  const detail = recipeDetails[recipe.id] || {};
  const baseServings = Number.isInteger(detail.servings) && detail.servings > 0 ? detail.servings : null;
  const servings = requestedServings ?? baseServings;
  const scaleFactor = baseServings && servings ? servings / baseServings : 1;
  return {
    servings,
    base_servings: baseServings,
    scale_factor: Number(scaleFactor.toFixed(4)),
    ingredients_detail: (detail.ingredients || []).map((entry) => serializeIngredientDetail(entry, scaleFactor)),
    ingredient_safety: inspectIngredientSafety(detail.ingredients || []),
    instructions: detail.instructions || [],
    step_media: (recipeStepMedia[recipe.id] || []).map((media) => ({ ...media })),
    tip: detail.tip || null,
    instructions_available: Array.isArray(detail.instructions) && detail.instructions.length > 0,
  };
}

function parseRequestedServings(searchParams) {
  const raw = searchParams.get('servings');
  if (raw == null || raw === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 50) throw validationError('gecersiz tarif porsiyonu');
  return value;
}

function recipeCatalogResponse(searchParams) {
  const mode = searchParams.get('mode') || 'sofra';
  if (!['sofra', 'fit', 'tatli'].includes(mode)) throw validationError('geçersiz recipe mode');
  const query = normalizeRecipeText(searchParams.get('query') || '');
  const maxMinutesValue = searchParams.get('max_minutes');
  const maxMinutes = maxMinutesValue == null || maxMinutesValue === '' ? null : Number(maxMinutesValue);
  if (maxMinutes != null && (!Number.isInteger(maxMinutes) || maxMinutes < 1 || maxMinutes > 240)) throw validationError('geçersiz max_minutes');
  const items = catalog
    .filter((recipe) => mode === 'sofra' || (mode === 'fit' ? recipe.fit === true : recipe.tags.includes('tatli')))
    .filter((recipe) => maxMinutes == null || recipe.mins <= maxMinutes)
    .filter((recipe) => matchesRecipeSearch(recipe, query))
    .map(serializeRecipe);
  return { mode, query, max_minutes: maxMinutes, items };
}

function buildRecommendationInput(state, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw validationError('geçersiz öneri gövdesi');
  const allowed = ['mode', 'max_minutes', 'servings', 'pantry_item_ids', 'fit_profile_id', 'fit_profile', 'health_summary', 'recent_recipe_ids', 'safety_profile'];
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length) throw validationError(`güncellenemeyen öneri alanı: ${unknown[0]}`);
  if (!['sofra', 'fit', 'tatli'].includes(input.mode)) throw validationError('geçersiz mode');
  if (!Number.isInteger(input.servings) || input.servings < 1) throw validationError('servings en az 1 olmalı');
  if (input.max_minutes != null && (!Number.isInteger(input.max_minutes) || input.max_minutes < 1)) throw validationError('geçersiz max_minutes');
  if (input.pantry_item_ids != null) {
    if (!Array.isArray(input.pantry_item_ids) || new Set(input.pantry_item_ids).size !== input.pantry_item_ids.length || input.pantry_item_ids.some((id) => typeof id !== 'string' || !state.pantry.some((item) => item.id === id))) {
      throw validationError('geçersiz pantry_item_ids');
    }
  }
  if (input.fit_profile_id != null && (typeof input.fit_profile_id !== 'string' || !input.fit_profile_id.trim())) throw validationError('geçersiz fit_profile_id');
  if (input.fit_profile != null) {
    if (!input.fit_profile || typeof input.fit_profile !== 'object' || Array.isArray(input.fit_profile)) throw validationError('geçersiz fit_profile');
    const fitProfileAllowed = ['gender', 'age', 'heightCm', 'height', 'weightKg', 'weight', 'activityFactor', 'activity', 'goal', 'goalKey'];
    const unknownFitField = Object.keys(input.fit_profile).find((key) => !fitProfileAllowed.includes(key));
    if (unknownFitField) throw validationError(`güncellenemeyen fit_profile alanı: ${unknownFitField}`);
  }
  if (input.health_summary != null && (!input.health_summary || typeof input.health_summary !== 'object' || Array.isArray(input.health_summary))) throw validationError('geçersiz health_summary');
  if (input.recent_recipe_ids != null && (!Array.isArray(input.recent_recipe_ids) || new Set(input.recent_recipe_ids).size !== input.recent_recipe_ids.length || input.recent_recipe_ids.some((id) => typeof id !== 'string' || !recipeById(id)))) throw validationError('geçersiz recent_recipe_ids');
  if (input.safety_profile != null) {
    if (!input.safety_profile || typeof input.safety_profile !== 'object' || Array.isArray(input.safety_profile)) throw validationError('geçersiz safety_profile');
    if (!Array.isArray(input.safety_profile.selected) || new Set(input.safety_profile.selected).size !== input.safety_profile.selected.length || input.safety_profile.selected.some((key) => typeof key !== 'string' || !SAFETY_KEYS.includes(key))) {
      throw validationError('geçersiz safety_profile.selected');
    }
  }
  return {
    ...input,
    ...(input.health_summary == null ? {} : { health_summary: normalizeHealthSummary(input.health_summary) }),
    ...(input.fit_profile == null ? {} : { fit_profile: normalizeFitProfile(input.fit_profile) }),
    ...(input.safety_profile == null ? {} : { safety_profile: normalizeSafetyProfile(input.safety_profile) }),
  };
}

function buildPlan(state, input) {
  const customMeals = input?.custom_meals ?? [];
  if (!Array.isArray(customMeals) || customMeals.length > 8) throw validationError('custom_meals en fazla 8 oge olmali');
  const allowedSlots = ['breakfast', 'lunch', 'dinner', 'snack'];
  const normalizedCustomMeals = customMeals.map((meal) => {
    if (!meal || typeof meal !== 'object' || Array.isArray(meal)) throw validationError('gecersiz custom_meal');
    const unknownMealField = Object.keys(meal).find((key) => !['slot', 'title', 'note'].includes(key));
    if (unknownMealField) throw validationError(`guncellenemeyen custom_meal alani: ${unknownMealField}`);
    const title = String(meal.title || '').trim();
    if (!title || title.length > 80) throw validationError('custom_meal title 1-80 karakter olmali');
    if (!allowedSlots.includes(meal.slot)) throw validationError('gecersiz custom_meal slot');
    const note = meal.note == null ? null : String(meal.note).trim();
    if (note != null && note.length > 160) throw validationError('custom_meal note en fazla 160 karakter olmali');
    return { id: `custom_meal_${state.nextId++}`, slot: meal.slot, title, note: note || null };
  });
  if (input?.main_recipe_id == null && !normalizedCustomMeals.length) throw validationError('main_recipe_id veya custom_meals gerekli');
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw validationError('geçersiz plan gövdesi');
  const allowed = ['date', 'servings', 'main_recipe_id', 'optional_recipe_ids', 'custom_meals'];
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length) throw validationError(`güncellenemeyen plan alanı: ${unknown[0]}`);
  if (!isoDate(input.date)) throw validationError('geçersiz plan tarihi');
  if (!Number.isInteger(input.servings) || input.servings < 1) throw validationError('servings en az 1 olmalı');
  if (input.main_recipe_id != null && (typeof input.main_recipe_id !== 'string' || !recipeById(input.main_recipe_id))) throw validationError('geçersiz main_recipe_id');
  const optionalRecipeIds = input.optional_recipe_ids ?? [];
  if (!Array.isArray(optionalRecipeIds)) throw validationError('optional_recipe_ids dizi olmalı');
  if (new Set(optionalRecipeIds).size !== optionalRecipeIds.length || optionalRecipeIds.some((id) => typeof id !== 'string' || !recipeById(id))) {
    throw validationError('geçersiz optional_recipe_ids');
  }
  return {
    id: `plan_${state.nextId++}`,
    date: input.date,
    servings: input.servings,
    main_recipe_id: input.main_recipe_id ?? null,
    optional_recipe_ids: optionalRecipeIds,
    custom_meals: normalizedCustomMeals,
  };
}

function exportUserData(state) {
  return {
    schema_version: 1,
    exported_at: new Date().toISOString(),
    user: { id: 'usr_anonymous_demo', auth_provider: 'anonymous', locale: 'tr-TR', created_at: '2026-10-14T12:00:00Z' },
    data: { pantry: state.pantry, plans: state.plans, feedback: state.feedback },
  };
}

function requiredQuantityText(recipeIds, ingredientName) {
  const quantities = recipeIds.flatMap((id) => {
    const detail = recipeDetails[id];
    if (!Array.isArray(detail?.ingredients)) return [];
    return detail.ingredients
      .filter(([, name]) => {
        const left = normalizeRecipeText(name);
        const right = normalizeRecipeText(ingredientName);
        return left === right || left.includes(right) || right.includes(left);
      })
      .map(([quantity]) => String(quantity).trim())
      .filter(Boolean);
  });
  const unique = [...new Set(quantities)];
  const parsed = unique.map((value) => value.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/u));
  if (unique.length && parsed.every(Boolean) && new Set(parsed.map((match) => match[2].toLocaleLowerCase('tr-TR'))).size === 1) {
    const total = parsed.reduce((sum, match) => sum + Number(match[1].replace(',', '.')), 0);
    const number = Number.isInteger(total) ? String(total) : String(Number(total.toFixed(2))).replace('.', ',');
    return `${number} ${parsed[0][2]}`;
  }
  return unique.length ? unique.join(' + ') : null;
}

function shoppingCandidates(state) {
  const recipeIds = state.plans.flatMap((plan) => [plan.main_recipe_id, ...(plan.optional_recipe_ids || [])]);
  const ingredients = [...new Set(recipeIds.flatMap((id) => recipeById(id)?.ingredients || []))];
  return ingredients.map((name) => {
    const item = state.pantry.find((entry) => entry.canonical_name.includes(name) || name.includes(entry.canonical_name));
    const stateName = !item ? 'check' : item.stock_state === 'finished' ? 'missing' : 'in_pantry';
    return {
      id: `candidate_${name}`,
      name,
      state: stateName,
      required_quantity_text: requiredQuantityText(recipeIds, name),
      pantry_quantity_text: item?.quantity_text ?? null,
      reason: !item ? 'Dolabında kayıt yok' : null,
    };
  });
}

function demoMarketQuotes() {
  return [
    { provider: 'CarrefourSA', retailer: 'CarrefourSA', subtotal: 331, deliveryFee: 29.9, minimumBasket: null, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 1440, singleStore: true, source: 'demo', updatedAt: new Date().toISOString(), isSponsored: false },
    { provider: 'Getir', retailer: 'Getir', subtotal: 342.1, deliveryFee: 0, minimumBasket: 350, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 25, singleStore: false, source: 'demo', updatedAt: new Date().toISOString(), isSponsored: true, partnershipLabel: 'İş birliği' },
    { provider: 'Migros', retailer: 'Migros', subtotal: 348, deliveryFee: 29.9, minimumBasket: 400, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 35, singleStore: false, source: 'demo', updatedAt: new Date().toISOString(), isSponsored: false },
  ];
}

function serializeMarketQuote(quote) {
    return {
    ...quote,
    provider: quote.provider || quote.retailer,
    quoted_at: quote.updatedAt,
    estimated_total: quote.estimatedTotal,
    delivery_fee: Number(quote.deliveryFee || 0),
    minimum_basket: quote.minimumBasket,
    delivery_eta_minutes: quote.deliveryEtaMinutes ?? null,
    stock_state: quote.stockState === 'complete' ? 'complete' : quote.stockState === 'partial' ? 'partial' : 'unknown',
    partnership_label: quote.sponsorshipLabel,
    comparison_state: quote.comparisonState,
    comparison_label: quote.comparisonLabel,
    minimum_basket_met: quote.minimumBasketMet,
    quantity_match: quote.quantityMatch,
    fresh: quote.fresh,
    source: quote.source || 'demo',
  };
}

function recommendationResponse(state, input) {
  const inventory = input.pantry_item_ids == null ? state.pantry : state.pantry.filter((item) => input.pantry_item_ids.includes(item.id));
  const result = recommend({ mode: input.mode, maxMinutes: input.max_minutes || 0, inventory, feedback: state.feedback, recentRecipeIds: input.recent_recipe_ids || [], safetyProfile: input.safety_profile || {}, fitGoal: input.fit_profile?.goalKey || input.fit_profile?.goal || null });
  const top = result[0];
  if (!top) return null;
  const nutrition = recipeNutrition(top);
  const fitTarget = input.mode === 'fit' && input.fit_profile ? calculateFitTarget(input.fit_profile) : null;
  return {
    id: `recommendation_${top.id}`,
    recipe_id: top.id,
    mode: input.mode || 'sofra',
    matched_ingredients: top.matchedIngredients,
    missing_ingredients: top.missing,
    time_fit: top.timeFit,
    expiry_boost: top.expiryBoost,
    recent_add_boost: top.recentAddBoost,
    learning_boost: top.learningBoost,
    preference_boost: top.preferenceBoost,
    repeat_penalty: top.repeatPenalty,
    fit_goal_boost: top.fitGoalBoost,
    reason_code: top.reasonCode,
    score_version: top.scoreVersion,
    safety: top.safety,
    health_context: input.mode === 'fit' && input.health_summary ? fitContext(input.health_summary) : null,
    fit_target: fitTarget,
    fit_verification: nutrition.fit_verification,
    nutrition: nutrition.nutrition,
    recipe_detail: { ...serializeRecipe(top), ...serializeRecipeDetail(top, input.servings), source: 'catalog_v1' },
  };
}

export function createSofraServer({ state = createState(), saveState = null } = {}) {
  const persist = async () => { if (typeof saveState === 'function') await saveState(state); };
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const path = url.pathname;
      const method = req.method;

      if (method === 'GET' && path === '/v1/me') {
        return json(res, 200, { id: 'usr_anonymous_demo', auth_provider: 'anonymous', locale: 'tr-TR', created_at: '2026-10-14T12:00:00Z' });
      }
      if (method === 'GET' && path === '/v1/auth/status') return json(res, 200, buildAuthStatus());
      if (method === 'GET' && path === '/v1/notifications/status') return json(res, 200, buildNotificationStatus({ platform: url.searchParams.get('platform') || 'web' }));
      if (method === 'GET' && path === '/v1/billing/status') return json(res, 200, buildBillingStatus());
      if (method === 'GET' && path === '/v1/ai/status') return json(res, 200, {
        schema_version: AI_SCHEMA_VERSION,
        provider_status: 'not_connected',
        fallback: 'deterministic',
        auto_save: false,
        tasks: Object.fromEntries(AI_TASKS.map((task) => [task, {
          ready: task === 'pantry_note',
          live_model: false,
          confirmation_required: true,
        }])),
      });
      if (method === 'GET' && path === '/v1/health/permission-plan') {
        return json(res, 200, buildHealthPermissionPlan(url.searchParams.get('provider') || ''));
      }
      if (method === 'GET' && path === '/v1/health/adapter-status') {
        return json(res, 200, buildHealthAdapterStatus(url.searchParams.get('provider') || ''));
      }
      if (method === 'GET' && path === '/v1/recipes') return json(res, 200, recipeCatalogResponse(url.searchParams));
      const recipeDetailMatch = path.match(/^\/v1\/recipes\/([^/]+)$/);
      if (method === 'GET' && recipeDetailMatch) {
        const recipe = recipeById(recipeDetailMatch[1]);
        if (!recipe) return json(res, 404, { code: 'not_found', message: 'Tarif bulunamadı' });
        return json(res, 200, { ...serializeRecipe(recipe), ...serializeRecipeDetail(recipe, parseRequestedServings(url.searchParams)), source: 'catalog_v1' });
      }
      if (method === 'GET' && path === '/v1/me/export') return json(res, 200, exportUserData(state));
      if (method === 'DELETE' && path === '/v1/me/data') {
        state.pantry = [];
        state.plans = [];
        state.feedback = [];
        await persist();
        res.writeHead(204); return res.end();
      }
      if (method === 'GET' && path === '/v1/pantry') return json(res, 200, { items: state.pantry });
      if (method === 'POST' && path === '/v1/pantry/parse-note') {
        const input = await readJson(req);
        if (typeof input.text !== 'string' || !input.text.trim()) throw validationError('text zorunlu');
        return json(res, 200, {
          ...parsePantryNote(input.text),
          parser: 'deterministic_fallback',
          ai_status: 'not_connected',
          requires_user_confirmation: true,
          auto_saved: false,
        });
      }
      if (method === 'POST' && path === '/v1/pantry/items/bulk') {
        const batch = buildPantryBatch(state, await readJson(req));
        state.nextId = batch.nextId;
        state.pantry.push(...batch.items);
        await persist();
        return json(res, 201, { items: batch.items, count: batch.items.length });
      }
      if (method === 'POST' && path === '/v1/pantry/items') {
        const item = buildPantryItem(state, await readJson(req));
        state.pantry.push(item);
        await persist();
        return json(res, 201, item);
      }
      const itemMatch = path.match(/^\/v1\/pantry\/items\/([^/]+)$/);
      if (itemMatch) {
        const item = state.pantry.find((entry) => entry.id === itemMatch[1]);
        if (!item) return json(res, 404, { code: 'not_found', message: 'Dolap kaydı bulunamadı' });
        if (method === 'PATCH') {
          const patch = buildPantryPatch(await readJson(req));
          Object.assign(item, patch, { updated_at: new Date().toISOString() });
          await persist();
          return json(res, 200, item);
        }
        if (method === 'DELETE') {
          state.pantry = state.pantry.filter((entry) => entry !== item);
          await persist();
          res.writeHead(204); return res.end();
        }
      }
      if (method === 'POST' && path === '/v1/recommendations') {
        const input = buildRecommendationInput(state, await readJson(req));
        const result = recommendationResponse(state, input);
        return result ? json(res, 200, result) : json(res, 200, {
          recipe_id: null,
          matched_ingredients: [],
          missing_ingredients: [],
          reason_code: input.safety_profile?.selected?.length ? 'safety_review_required' : 'general',
          score_version: 'deterministic-v1.2',
          fit_goal_boost: 0,
          safety: input.safety_profile?.selected?.length
            ? { status: 'review_required', blocked: true, conflicts: [], reason: 'no_verified_match' }
            : { status: 'not_requested', blocked: false, conflicts: [], reason: null },
          fit_target: input.mode === 'fit' && input.fit_profile ? calculateFitTarget(input.fit_profile) : null,
        });
      }
      const feedbackMatch = path.match(/^\/v1\/recommendations\/([^/]+)\/feedback$/);
      if (method === 'POST' && feedbackMatch) {
        const input = await readJson(req);
        if (!recipeById(feedbackMatch[1].replace(/^recommendation_/, ''))) throw validationError('geçersiz recommendation_id');
        if (!['helpful', 'not_helpful'].includes(input.value)) throw validationError('geçersiz feedback');
        state.feedback.push({ recommendation_id: feedbackMatch[1], value: input.value, created_at: new Date().toISOString() });
        await persist();
        res.writeHead(204); return res.end();
      }
      if (method === 'GET' && path === '/v1/plans') {
        const view = url.searchParams.get('view') || 'week';
        if (!['week', 'month', 'history'].includes(view)) throw validationError('geçersiz plan görünümü');
        return json(res, 200, { items: state.plans, view });
      }
      if (method === 'POST' && path === '/v1/plans') {
        const plan = buildPlan(state, await readJson(req));
        state.plans.push(plan);
        await persist();
        return json(res, 201, plan);
      }
      if (method === 'GET' && path === '/v1/shopping/candidates') return json(res, 200, { items: shoppingCandidates(state) });
      if (method === 'POST' && path === '/v1/market/quotes') {
        const input = await readJson(req);
        const request = buildMarketRequest(input);
        const candidateIds = new Set(shoppingCandidates(state).map((candidate) => candidate.id));
        if (request.candidateIds.some((id) => !candidateIds.has(id))) throw validationError('Market listesi yalnızca Planım ürünlerinden oluşmalı');
        return json(res, 200, {
          market_status: 'demo_only',
          quotes: rankQuotes(demoMarketQuotes(), { sort: request.sort }).map(serializeMarketQuote),
          candidate_ids: request.candidateIds,
          sort: request.sort,
        });
      }
      if (method === 'POST' && path === '/v1/market/handoff') {
        const handoff = buildMarketHandoff(await readJson(req));
        const candidateIds = new Set(shoppingCandidates(state).map((candidate) => candidate.id));
        if (handoff.candidate_ids.some((id) => !candidateIds.has(id))) throw validationError('Market listesi yalnızca Planım ürünlerinden oluşmalı');
        return json(res, 200, { market_status: 'demo_only', ...handoff });
      }
      return json(res, 404, { code: 'not_found', message: 'Endpoint bulunamadı' });
    } catch (error) {
      return errorResponse(res, error);
    }
  });
  return { server, state };
}

if (process.argv[1] && process.argv[1].endsWith('SOFRA-API-SERVER.mjs')) {
  const start = async () => {
    const port = Number(process.env.PORT || 8787);
    const storePath = process.env.SOFRA_STORE_PATH?.trim();
    const state = storePath ? await loadStore(storePath, { fallback: createState() }) : createState();
    const { server } = createSofraServer({ state, saveState: storePath ? () => saveStore(storePath, state) : null });
    server.listen(port, '127.0.0.1', () => console.log(`Sofra API reference server: http://127.0.0.1:${port}${storePath ? ' · kalıcı store açık' : ''}`));
  };
  start().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
