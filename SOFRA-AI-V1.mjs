/** Provider-neutral AI boundary. Live model output is never written directly to the pantry. */

export const AI_SCHEMA_VERSION = 1;
export const AI_TASKS = Object.freeze(['pantry_note', 'recipe_normalization', 'recommendation_explanation']);
const stockStates = new Set(['available', 'low', 'finished', 'unknown']);

export class AiContractError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AiContractError';
    this.status = 422;
  }
}

function normalize(value) {
  return String(value ?? '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/İ/g, 'i').trim();
}

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new AiContractError(`${field} zorunlu`);
  return value.trim();
}

function normalizeConfidence(value) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new AiContractError('confidence 0 ile 1 arasında olmalı');
  return Number(value.toFixed(3));
}

export function buildPantryModelRequest(text, { locale = 'tr-TR' } = {}) {
  const input = requireText(text, 'text');
  if (typeof locale !== 'string' || !locale.trim()) throw new AiContractError('locale zorunlu');
  return {
    schema_version: AI_SCHEMA_VERSION,
    task: 'pantry_note',
    locale: locale.trim(),
    input: { text: input },
    output_rules: {
      known_item_required: true,
      preserve_unknown_text: true,
      auto_save: false,
      user_confirmation_required: true,
      never_infer_allergen_or_nutrition: true,
    },
  };
}

export function normalizeAiPantryResult(input = {}, { knownNames = [] } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AiContractError('geçersiz AI sonucu');
  if (!Array.isArray(input.items)) throw new AiContractError('AI sonucu items dizisi içermeli');
  const known = new Set(knownNames.map(normalize).filter(Boolean));
  const items = [];
  const rejectedItems = [];
  for (const raw of input.items) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new AiContractError('geçersiz AI ürün kaydı');
    const canonicalName = normalize(raw.canonical_name);
    const displayName = requireText(raw.display_name || raw.canonical_name, 'display_name');
    const confidence = normalizeConfidence(raw.confidence);
    const stockState = raw.stock_state || 'unknown';
    if (!canonicalName) throw new AiContractError('canonical_name zorunlu');
    if (!stockStates.has(stockState)) throw new AiContractError('geçersiz AI stock_state');
    const isKnown = raw.known === true || known.has(canonicalName);
    if (!isKnown) {
      rejectedItems.push({ display_name: displayName, reason: 'known_item_required' });
      continue;
    }
    items.push({
      canonical_name: canonicalName,
      display_name: displayName,
      quantity_text: raw.quantity_text == null ? null : requireText(raw.quantity_text, 'quantity_text'),
      stock_state: stockState,
      confidence,
      needs_confirmation: true,
      source: 'ai_preview',
    });
  }
  return {
    schema_version: AI_SCHEMA_VERSION,
    task: 'pantry_note',
    items,
    rejected_items: rejectedItems,
    unparsed_text: typeof input.unparsed_text === 'string' ? input.unparsed_text.trim() : '',
    requires_user_confirmation: true,
    auto_saved: false,
  };
}
