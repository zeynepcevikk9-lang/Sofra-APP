/** Versioned sync projection; cloud upload remains disabled until account auth exists. */

export const SYNC_SCHEMA_VERSION = 1;
export const SYNC_SCOPES = Object.freeze(['pantry', 'plans', 'feedback']);
const excludedFields = Object.freeze(['fit_profile', 'health_summary', 'health_data', 'market_data', 'account_identity', 'auth_tokens', 'raw_notes']);

function syncValidationError(message) {
  return Object.assign(new Error(message), { status: 422 });
}

function record(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw syncValidationError(label + ' gecersiz');
  return value;
}

function strings(value, label, max = 10) {
  if (!Array.isArray(value) || value.length < 1 || value.length > max || value.some((item) => typeof item !== 'string')) throw syncValidationError(label + ' gecersiz');
  return [...value];
}

function consentProjection(consent) {
  if (consent == null) return { sync: false, scopes: [] };
  record(consent, 'consent');
  const unknown = Object.keys(consent).filter((key) => !['sync', 'scopes'].includes(key));
  if (unknown.length) throw syncValidationError('guncellenemeyen consent alani: ' + unknown[0]);
  if (consent.sync !== true) return { sync: false, scopes: [] };
  const scopes = strings(consent.scopes, 'consent.scopes', SYNC_SCOPES.length);
  if (new Set(scopes).size !== scopes.length || scopes.some((scope) => !SYNC_SCOPES.includes(scope))) throw syncValidationError('consent.scopes gecersiz');
  return { sync: true, scopes };
}

function pantryItem(item) {
  record(item, 'pantry item');
  return {
    id: String(item.id || ''),
    canonical_name: String(item.canonical_name || ''),
    display_name: String(item.display_name || ''),
    quantity_text: item.quantity_text ?? null,
    quantity_value: item.quantity_value ?? null,
    quantity_unit: item.quantity_unit ?? null,
    stock_state: item.stock_state || 'unknown',
    expiry_date: item.expiry_date ?? null,
    source: item.source || 'manual',
    confidence: item.confidence ?? null,
    updated_at: item.updated_at ?? null,
  };
}

function planRecord(plan) {
  record(plan, 'plan');
  return {
    id: String(plan.id || ''),
    date: String(plan.date || ''),
    servings: plan.servings,
    main_recipe_id: plan.main_recipe_id ?? null,
    optional_recipe_ids: Array.isArray(plan.optional_recipe_ids) ? [...plan.optional_recipe_ids] : [],
    custom_meals: Array.isArray(plan.custom_meals) ? plan.custom_meals.map((meal) => ({
      id: meal.id ?? null,
      slot: meal.slot ?? null,
      title: meal.title ?? null,
      note: meal.note ?? null,
    })) : [],
  };
}

function feedbackRecord(feedback) {
  record(feedback, 'feedback');
  return {
    recommendation_id: String(feedback.recommendation_id || ''),
    value: feedback.value || null,
    created_at: feedback.created_at ?? null,
  };
}

function assertNoExcludedFields(value) {
  const encoded = JSON.stringify(value);
  for (const field of excludedFields) {
    if (encoded.includes('"' + field + '"')) throw syncValidationError('sync payload hassas alan iceriyor: ' + field);
  }
}

export function buildSyncStatus({ provider = 'anonymous' } = {}) {
  return {
    schema_version: SYNC_SCHEMA_VERSION,
    status: 'account_required',
    provider,
    cloud_sync: false,
    cross_device_sync: false,
    account_required: true,
    consent_required: true,
    upload_enabled: false,
    download_enabled: false,
    token_storage: 'not_enabled',
    sensitive_data: { fit_profile_included: false, health_data_included: false, market_data_included: false },
    excluded_fields: [...excludedFields],
  };
}

export function buildSyncEnvelope({ state, consent } = {}) {
  record(state, 'state');
  const selected = consentProjection(consent);
  const base = {
    schema_version: SYNC_SCHEMA_VERSION,
    sync_status: selected.sync ? 'ready_for_account_sync' : 'consent_required',
    cloud_sync: false,
    persisted: false,
    account_required: true,
    consent: selected,
    conflict_policy: {
      record_key: 'id_or_recommendation_id',
      merge: 'updated_at_last_write_wins',
      equal_timestamp: 'user_review_required',
    },
    excluded_fields: [...excludedFields],
    payload: null,
  };
  if (!selected.sync) return base;
  const payload = {};
  if (selected.scopes.includes('pantry')) payload.pantry = (Array.isArray(state.pantry) ? state.pantry : []).map(pantryItem);
  if (selected.scopes.includes('plans')) payload.plans = (Array.isArray(state.plans) ? state.plans : []).map(planRecord);
  if (selected.scopes.includes('feedback')) payload.feedback = (Array.isArray(state.feedback) ? state.feedback : []).map(feedbackRecord);
  assertNoExcludedFields(payload);
  return { ...base, payload };
}

export const SYNC_EXCLUDED_FIELDS = excludedFields;
