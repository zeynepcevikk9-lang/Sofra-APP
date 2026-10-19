/**
 * Tarif güvenliği için deterministik profil ve değerlendirme yardımcıları.
 *
 * Bu modül tıbbi doğrulama yapmaz. Kullanıcının alerji/çölyak tercihi varsa
 * yalnızca doğrulanmış içerik ve üretim bilgisi bulunan tarifleri uygun sayar;
 * eksik veriyi güvenli kabul etmez.
 */

export const SAFETY_KEYS = Object.freeze([
  'milk',
  'egg',
  'peanut',
  'nuts',
  'fish',
  'shellfish',
  'soy',
  'gluten',
]);

const safetyKeySet = new Set(SAFETY_KEYS);

const ingredientAllergenHints = new Map([
  ['makarna', ['gluten']],
  ['ekmek', ['gluten']],
  ['noodle', ['gluten']],
  ['pizza hamuru', ['gluten']],
  ['peynir', ['milk']],
  ['yogurt', ['milk']],
  ['sut', ['milk']],
  ['tereyagi', ['milk']],
  ['yumurta', ['egg']],
]);

function normalizeIngredientKey(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function inspectIngredientSafety(ingredients = []) {
  return ingredients.map((entry) => {
    const displayName = Array.isArray(entry) ? entry[1] : entry?.display_name || entry?.canonical_name;
    const canonicalName = normalizeIngredientKey(displayName);
    const potentialAllergens = ingredientAllergenHints.get(canonicalName) || [];
    return {
      canonical_name: canonicalName,
      potential_allergens: potentialAllergens,
      evidence_status: potentialAllergens.length ? 'candidate' : 'unmapped',
      label_check_required: true,
      cross_contamination: 'unknown',
    };
  });
}

export function normalizeSafetyProfile(input = {}) {
  const selected = Array.isArray(input?.selected)
    ? [...new Set(input.selected.filter((key) => safetyKeySet.has(key)))]
    : [];
  return {
    schemaVersion: 1,
    selected,
    source: input?.source === 'user_profile' ? 'user_profile' : 'user_profile',
  };
}

export function assessRecipeSafety(recipe, profile = {}) {
  const normalized = normalizeSafetyProfile(profile);
  const selected = normalized.selected;
  const metadata = recipe?.safety;

  if (!selected.length) {
    return {
      status: 'not_requested',
      blocked: false,
      conflicts: [],
      reason: null,
    };
  }

  if (!metadata || !Array.isArray(metadata.allergens)) {
    return {
      status: 'review_required',
      blocked: true,
      conflicts: [],
      reason: 'allergen_metadata_missing',
    };
  }

  const conflicts = selected.filter((key) => metadata.allergens.includes(key));
  if (conflicts.length) {
    return {
      status: 'blocked',
      blocked: true,
      conflicts,
      reason: 'declared_allergen_conflict',
    };
  }

  if (metadata.verified !== true) {
    return {
      status: 'review_required',
      blocked: true,
      conflicts: [],
      reason: 'allergen_verification_missing',
    };
  }

  if (selected.includes('gluten') && metadata.crossContamination !== 'controlled') {
    return {
      status: 'review_required',
      blocked: true,
      conflicts: [],
      reason: 'cross_contamination_unknown',
    };
  }

  return {
    status: 'eligible',
    blocked: false,
    conflicts: [],
    reason: null,
  };
}
