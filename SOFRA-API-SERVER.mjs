import http from 'node:http';
import { catalog, recommend } from './SOFRA-ALGORITHM-V1.mjs';
import { buildMarketRequest, rankQuotes } from './SOFRA-MARKET-V1.mjs';
import { parsePantryNote } from './SOFRA-INGEST-V1.mjs';
import { fitContext, normalizeHealthSummary } from './SOFRA-HEALTH-V1.mjs';
import { recipeNutrition } from './SOFRA-NUTRITION-V1.mjs';
import { normalizeSafetyProfile, SAFETY_KEYS } from './SOFRA-SAFETY-V1.mjs';
import { calculateFitTarget, normalizeFitProfile } from './SOFRA-FIT-V1.mjs';

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
  return { pantry: [], plans: [], feedback: [], nextId: 1 };
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
  return {
    id: `pantry_${state.nextId++}`,
    user_id: 'usr_anonymous_demo',
    canonical_name: input.canonical_name || displayName.toLocaleLowerCase('tr-TR'),
    display_name: displayName,
    quantity_text: input.quantity_text ?? null,
    quantity_value: input.quantity_value ?? null,
    quantity_unit: input.quantity_unit ?? null,
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw validationError('geçersiz plan gövdesi');
  const allowed = ['date', 'servings', 'main_recipe_id', 'optional_recipe_ids'];
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length) throw validationError(`güncellenemeyen plan alanı: ${unknown[0]}`);
  if (!isoDate(input.date)) throw validationError('geçersiz plan tarihi');
  if (!Number.isInteger(input.servings) || input.servings < 1) throw validationError('servings en az 1 olmalı');
  if (typeof input.main_recipe_id !== 'string' || !recipeById(input.main_recipe_id)) throw validationError('geçersiz main_recipe_id');
  const optionalRecipeIds = input.optional_recipe_ids ?? [];
  if (!Array.isArray(optionalRecipeIds)) throw validationError('optional_recipe_ids dizi olmalı');
  if (new Set(optionalRecipeIds).size !== optionalRecipeIds.length || optionalRecipeIds.some((id) => typeof id !== 'string' || !recipeById(id))) {
    throw validationError('geçersiz optional_recipe_ids');
  }
  return {
    id: `plan_${state.nextId++}`,
    date: input.date,
    servings: input.servings,
    main_recipe_id: input.main_recipe_id,
    optional_recipe_ids: optionalRecipeIds,
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

function shoppingCandidates(state) {
  const recipeIds = state.plans.flatMap((plan) => [plan.main_recipe_id, ...(plan.optional_recipe_ids || [])]);
  const ingredients = [...new Set(recipeIds.flatMap((id) => recipeById(id)?.ingredients || []))];
  return ingredients.map((name) => {
    const item = state.pantry.find((entry) => entry.canonical_name.includes(name) || name.includes(entry.canonical_name));
    const stateName = !item ? 'check' : item.stock_state === 'finished' ? 'missing' : 'in_pantry';
    return { id: `candidate_${name}`, name, state: stateName, reason: !item ? 'Dolabında kayıt yok' : null };
  });
}

function demoMarketQuotes() {
  return [
    { provider: 'CarrefourSA', retailer: 'CarrefourSA', subtotal: 331, deliveryFee: 29.9, minimumBasket: null, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 1440, source: 'demo', updatedAt: new Date().toISOString(), isSponsored: false },
    { provider: 'Getir', retailer: 'Getir', subtotal: 342.1, deliveryFee: 0, minimumBasket: 350, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 25, source: 'demo', updatedAt: new Date().toISOString(), isSponsored: true, partnershipLabel: 'İş birliği' },
    { provider: 'Migros', retailer: 'Migros', subtotal: 348, deliveryFee: 29.9, minimumBasket: 400, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 35, source: 'demo', updatedAt: new Date().toISOString(), isSponsored: false },
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
  const result = recommend({ mode: input.mode, maxMinutes: input.max_minutes || 0, inventory, feedback: state.feedback, recentRecipeIds: input.recent_recipe_ids || [], safetyProfile: input.safety_profile || {} });
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
    learning_boost: top.learningBoost,
    preference_boost: top.preferenceBoost,
    repeat_penalty: top.repeatPenalty,
    reason_code: top.reasonCode,
    score_version: top.scoreVersion,
    safety: top.safety,
    health_context: input.mode === 'fit' && input.health_summary ? fitContext(input.health_summary) : null,
    fit_target: fitTarget,
    fit_verification: nutrition.fit_verification,
    nutrition: nutrition.nutrition,
  };
}

export function createSofraServer({ state = createState() } = {}) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      const path = url.pathname;
      const method = req.method;

      if (method === 'GET' && path === '/v1/me') {
        return json(res, 200, { id: 'usr_anonymous_demo', auth_provider: 'anonymous', locale: 'tr-TR', created_at: '2026-10-14T12:00:00Z' });
      }
      if (method === 'GET' && path === '/v1/me/export') return json(res, 200, exportUserData(state));
      if (method === 'DELETE' && path === '/v1/me/data') {
        state.pantry = [];
        state.plans = [];
        state.feedback = [];
        res.writeHead(204); return res.end();
      }
      if (method === 'GET' && path === '/v1/pantry') return json(res, 200, { items: state.pantry });
      if (method === 'POST' && path === '/v1/pantry/parse-note') {
        const input = await readJson(req);
        if (typeof input.text !== 'string' || !input.text.trim()) throw validationError('text zorunlu');
        return json(res, 200, parsePantryNote(input.text));
      }
      if (method === 'POST' && path === '/v1/pantry/items/bulk') {
        const batch = buildPantryBatch(state, await readJson(req));
        state.nextId = batch.nextId;
        state.pantry.push(...batch.items);
        return json(res, 201, { items: batch.items, count: batch.items.length });
      }
      if (method === 'POST' && path === '/v1/pantry/items') {
        const item = buildPantryItem(state, await readJson(req));
        state.pantry.push(item);
        return json(res, 201, item);
      }
      const itemMatch = path.match(/^\/v1\/pantry\/items\/([^/]+)$/);
      if (itemMatch) {
        const item = state.pantry.find((entry) => entry.id === itemMatch[1]);
        if (!item) return json(res, 404, { code: 'not_found', message: 'Dolap kaydı bulunamadı' });
        if (method === 'PATCH') {
          const patch = buildPantryPatch(await readJson(req));
          Object.assign(item, patch, { updated_at: new Date().toISOString() });
          return json(res, 200, item);
        }
        if (method === 'DELETE') {
          state.pantry = state.pantry.filter((entry) => entry !== item);
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
          score_version: 'deterministic-v1',
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
          quotes: rankQuotes(demoMarketQuotes()).map(serializeMarketQuote),
          candidate_ids: request.candidateIds,
        });
      }
      return json(res, 404, { code: 'not_found', message: 'Endpoint bulunamadı' });
    } catch (error) {
      return errorResponse(res, error);
    }
  });
  return { server, state };
}

if (process.argv[1] && process.argv[1].endsWith('SOFRA-API-SERVER.mjs')) {
  const port = Number(process.env.PORT || 8787);
  createSofraServer().server.listen(port, '127.0.0.1', () => console.log(`Sofra API reference server: http://127.0.0.1:${port}`));
}
