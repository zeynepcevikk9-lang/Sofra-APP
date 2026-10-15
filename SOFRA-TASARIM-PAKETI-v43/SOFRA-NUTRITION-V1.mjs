/** Provider-neutral nutrition gate. Unverified recipe data is never exposed as a calorie claim. */

const fields = ['kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g'];
const verifiedSources = new Set(['food_database_v1', 'verified_recipe_database']);

const validNumber = (value) => Number.isFinite(value) && value >= 0;

export function normalizeNutrition(input = {}) {
  const source = typeof input.source === 'string' && input.source.trim() ? input.source.trim() : null;
  const verification = input.fit_verification === 'verified' ? 'verified' : 'unverified';
  const raw = input.nutrition;
  const valid = raw && typeof raw === 'object' && fields.every((field) => validNumber(raw[field]));
  if (verification !== 'verified' || !source || !verifiedSources.has(source) || !valid) {
    return { fit_verification: 'unverified', nutrition: null, source: null, basis: 'not_verified' };
  }
  return {
    fit_verification: 'verified',
    nutrition: Object.fromEntries(fields.map((field) => [field, Number(raw[field])])),
    source,
    basis: 'per_serving',
  };
}

export function recipeNutrition(recipe = {}) {
  return normalizeNutrition({
    fit_verification: recipe.fit_verification,
    nutrition: recipe.nutrition,
    source: recipe.nutrition_source,
  });
}
