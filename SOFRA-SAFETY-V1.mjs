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
const safetySourceTypes = new Set(['licensed_partner', 'public_database', 'editorial_owned']);
const safetyLicenses = new Set(['public_domain', 'cc_by', 'odc_by', 'licensed_partner']);

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

function validText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function validHttps(value) {
  return typeof value === 'string' && /^https:\/\//.test(value);
}

function validDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

export function validateSafetySourceRecord(input = {}) {
  const errors = [];
  const sourceId = validText(input.source_id);
  const sourceType = validText(input.source_type);
  const sourceUrl = validText(input.source_url);
  const attribution = validText(input.attribution);
  const license = validText(input.license);
  const licenseUrl = validText(input.license_url);
  const revisionId = validText(input.revision_id);
  const lastVerifiedAt = validText(input.last_verified_at);
  const crossContamination = validText(input.cross_contamination);
  if (!sourceId) errors.push('source_id_required');
  if (!sourceType || !safetySourceTypes.has(sourceType)) errors.push('source_type_invalid');
  if (!validHttps(sourceUrl)) errors.push('https_source_required');
  if (!attribution) errors.push('attribution_required');
  if (!license || !safetyLicenses.has(license)) errors.push('license_invalid');
  if (license !== 'public_domain' && !validHttps(licenseUrl)) errors.push('license_url_required');
  if (!revisionId) errors.push('revision_id_required');
  if (!validDate(lastVerifiedAt)) errors.push('last_verified_at_required');
  if (input.verified !== true) errors.push('verified_required');
  if (!['controlled', 'unknown'].includes(crossContamination)) errors.push('cross_contamination_invalid');
  if (!Array.isArray(input.ingredients) || !input.ingredients.length) errors.push('ingredients_required');
  const seen = new Set();
  const ingredients = Array.isArray(input.ingredients) ? input.ingredients.map((item, index) => {
    const canonicalName = normalizeIngredientKey(item?.canonical_name);
    const allergens = Array.isArray(item?.allergens) ? [...new Set(item.allergens)] : [];
    const evidenceStatus = validText(item?.evidence_status);
    const ingredientCrossContamination = validText(item?.cross_contamination);
    if (!canonicalName) errors.push('ingredient_' + index + '_canonical_name_required');
    if (seen.has(canonicalName)) errors.push('ingredient_' + index + '_duplicate');
    seen.add(canonicalName);
    if (allergens.some((key) => !safetyKeySet.has(key))) errors.push('ingredient_' + index + '_allergen_invalid');
    if (evidenceStatus !== 'verified') errors.push('ingredient_' + index + '_verification_required');
    if (item?.label_check_required !== true) errors.push('ingredient_' + index + '_label_check_required');
    if (!['controlled', 'unknown'].includes(ingredientCrossContamination)) errors.push('ingredient_' + index + '_cross_contamination_invalid');
    return { canonical_name: canonicalName, allergens, evidence_status: evidenceStatus, label_check_required: true, cross_contamination: ingredientCrossContamination };
  }) : [];
  if (crossContamination === 'controlled' && ingredients.some((item) => item.cross_contamination !== 'controlled')) errors.push('cross_contamination_coverage_incomplete');
  if (errors.length) return { schema_version: 1, status: 'rejected', errors, safety_provenance: null };
  return {
    schema_version: 1,
    status: 'verified',
    errors: [],
    safety_provenance: {
      source_id: sourceId,
      source_type: sourceType,
      source_url: sourceUrl,
      attribution,
      license,
      license_url: licenseUrl,
      revision_id: revisionId,
      last_verified_at: lastVerifiedAt,
      cross_contamination: crossContamination,
      ingredients,
    },
  };
}

export function recipeSafetyProvenance(recipe = {}) {
  const result = validateSafetySourceRecord(recipe.safety_source || {});
  return result.status === 'verified' ? result.safety_provenance : null;
}
