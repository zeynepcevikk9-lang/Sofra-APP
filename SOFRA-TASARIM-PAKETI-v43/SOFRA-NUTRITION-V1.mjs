/** Provider-neutral nutrition gate with source-backed ingredient conversion. */

export const nutritionFields = Object.freeze(['kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g']);
const verifiedSources = new Set(['food_database_v1', 'verified_recipe_database']);
const verifiedLicenses = new Set(['public_domain', 'odc_by', 'cc_by', 'licensed_partner']);

const validNumber = (value) => Number.isFinite(value) && value >= 0;
const positiveNumber = (value) => Number.isFinite(value) && value > 0;
const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : null;
const normalizeName = (value) => String(value ?? '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

function validNutrientValues(value) {
  return value && typeof value === 'object' && nutritionFields.every((field) => validNumber(Number(value[field])));
}

function normalizeCoverage(input) {
  if (!Array.isArray(input) || input.length === 0) return null;
  const coverage = input.map((item) => ({
    canonical_name: text(item?.canonical_name),
    quantity_value: Number(item?.quantity_value),
    unit: text(item?.unit),
    grams: Number(item?.grams),
    source_record_id: text(item?.source_record_id),
    conversion_source: text(item?.conversion_source),
  }));
  return coverage.every((item) => item.canonical_name && positiveNumber(item.quantity_value) && item.unit && positiveNumber(item.grams) && item.source_record_id && item.conversion_source)
    ? coverage
    : null;
}

function minimalUnverified() {
  return { fit_verification: 'unverified', nutrition: null, source: null, basis: 'not_verified' };
}

export function normalizeNutrition(input = {}) {
  const source = text(input.source);
  const verification = input.fit_verification === 'verified' ? 'verified' : 'unverified';
  const raw = input.nutrition;
  const valid = validNutrientValues(raw);
  const recordIds = [...new Set([
    ...(Array.isArray(input.source_record_ids) ? input.source_record_ids : []),
    ...(text(input.source_record_id) ? [input.source_record_id] : []),
  ].map(text).filter(Boolean))];
  const coverage = normalizeCoverage(input.ingredient_coverage);
  const license = text(input.source_license);
  const servingSize = Number(input.serving_size_g);
  const method = text(input.calculation_method);
  if (
    verification !== 'verified'
    || !source
    || !verifiedSources.has(source)
    || !valid
    || !recordIds.length
    || !license
    || !verifiedLicenses.has(license)
    || !positiveNumber(servingSize)
    || !coverage
    || method !== 'ingredient_weighted_per_100g'
  ) return minimalUnverified();
  return {
    fit_verification: 'verified',
    nutrition: Object.fromEntries(nutritionFields.map((field) => [field, Number(Number(raw[field]).toFixed(2))])),
    source,
    basis: 'per_serving',
    nutrition_provenance: {
      source_record_ids: recordIds,
      source_license: license,
      serving_size_g: Number(servingSize.toFixed(2)),
      calculation_method: method,
      ingredient_coverage: coverage,
      coverage_status: 'complete',
    },
  };
}

function gramsForIngredient(ingredient, sourceRecord) {
  const quantity = Number(ingredient?.quantity_value);
  const unit = text(ingredient?.unit);
  if (!positiveNumber(quantity) || !unit) return null;
  if (unit === 'g') return quantity;
  if (unit === 'kg') return quantity * 1000;
  const gramsPerUnit = Number(sourceRecord?.grams_per_unit?.[unit]);
  return positiveNumber(gramsPerUnit) ? quantity * gramsPerUnit : null;
}

/** Calculates per-serving nutrition only with complete source-backed coverage. */
export function buildNutritionFromIngredients({ servings, ingredients = [], nutrientTable = {}, source = 'food_database_v1', sourceLicense = 'public_domain' } = {}) {
  const servingCount = Number(servings);
  if (!Number.isInteger(servingCount) || servingCount < 1 || !Array.isArray(ingredients) || !ingredients.length) return minimalUnverified();
  const totals = Object.fromEntries(nutritionFields.map((field) => [field, 0]));
  const coverage = [];
  let totalGrams = 0;
  for (const ingredient of ingredients) {
    const canonicalName = normalizeName(ingredient?.canonical_name);
    const sourceRecord = nutrientTable[canonicalName];
    const grams = gramsForIngredient(ingredient, sourceRecord);
    if (!sourceRecord || !text(sourceRecord.source_record_id) || !grams || !validNutrientValues(sourceRecord.per_100g)) return minimalUnverified();
    for (const field of nutritionFields) totals[field] += Number(sourceRecord.per_100g[field]) * grams / 100;
    totalGrams += grams;
    coverage.push({
      canonical_name: canonicalName,
      quantity_value: Number(ingredient.quantity_value),
      unit: text(ingredient.unit),
      grams,
      source_record_id: text(sourceRecord.source_record_id),
      conversion_source: `ingredient_table:${sourceRecord.source_record_id}:${ingredient.unit}`,
    });
  }
  return normalizeNutrition({
    fit_verification: 'verified',
    source,
    source_license: sourceLicense,
    source_record_ids: coverage.map((item) => item.source_record_id),
    serving_size_g: totalGrams / servingCount,
    calculation_method: 'ingredient_weighted_per_100g',
    ingredient_coverage: coverage,
    nutrition: Object.fromEntries(nutritionFields.map((field) => [field, totals[field] / servingCount])),
  });
}

export function recipeNutrition(recipe = {}) {
  return normalizeNutrition({
    fit_verification: recipe.fit_verification,
    nutrition: recipe.nutrition,
    source: recipe.nutrition_source,
    ...(recipe.nutrition_provenance || {}),
  });
}
