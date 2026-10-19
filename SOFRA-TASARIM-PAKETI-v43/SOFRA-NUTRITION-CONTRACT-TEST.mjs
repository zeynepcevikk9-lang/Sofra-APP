import assert from 'node:assert/strict';
import { buildNutritionFromIngredients, normalizeNutrition, recipeNutrition } from './SOFRA-NUTRITION-V1.mjs';

const table = {
  domates: { source_record_id: 'fdc-tomato-001', grams_per_unit: { adet: 120 }, per_100g: { kcal: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, fiber_g: 1.2 } },
  yumurta: { source_record_id: 'fdc-egg-001', grams_per_unit: { adet: 50 }, per_100g: { kcal: 143, protein_g: 12.6, carbs_g: 0.7, fat_g: 9.5, fiber_g: 0 } },
};

const verified = buildNutritionFromIngredients({
  servings: 2,
  ingredients: [{ canonical_name: 'domates', quantity_value: 2, unit: 'adet' }, { canonical_name: 'yumurta', quantity_value: 1, unit: 'adet' }],
  nutrientTable: table,
});
assert.equal(verified.fit_verification, 'verified');
assert.equal(verified.nutrition.kcal, 57.35);
assert.equal(verified.nutrition.protein_g, 4.23);
assert.equal(verified.basis, 'per_serving');
assert.equal(verified.nutrition_provenance.coverage_status, 'complete');
assert.equal(verified.nutrition_provenance.serving_size_g, 145);
assert.deepEqual(verified.nutrition_provenance.source_record_ids, ['fdc-tomato-001', 'fdc-egg-001']);

const gramAndKg = buildNutritionFromIngredients({
  servings: 1,
  ingredients: [{ canonical_name: 'domates', quantity_value: 0.2, unit: 'kg' }],
  nutrientTable: table,
});
assert.equal(gramAndKg.nutrition.kcal, 36);
assert.equal(gramAndKg.nutrition_provenance.ingredient_coverage[0].grams, 200);

const missingConversion = buildNutritionFromIngredients({
  servings: 1,
  ingredients: [{ canonical_name: 'domates', quantity_value: 1, unit: 'demet' }],
  nutrientTable: table,
});
assert.equal(missingConversion.fit_verification, 'unverified');
assert.equal(missingConversion.nutrition, null);

const missingIngredient = buildNutritionFromIngredients({
  servings: 1,
  ingredients: [{ canonical_name: 'peynir', quantity_value: 50, unit: 'g' }],
  nutrientTable: table,
});
assert.equal(missingIngredient.nutrition, null);

const incomplete = normalizeNutrition({
  fit_verification: 'verified', source: 'food_database_v1',
  nutrition: { kcal: 420, protein_g: 24, carbs_g: 38, fat_g: 18, fiber_g: 7 },
});
assert.equal(incomplete.fit_verification, 'unverified');
assert.equal(incomplete.nutrition, null, 'kayit ve gram kapsami olmayan veri kalori iddiasina donusmemeli');

const invented = normalizeNutrition({ fit_verification: 'verified', source: 'unknown', nutrition: { kcal: 1, protein_g: 1, carbs_g: 1, fat_g: 1, fiber_g: 1 } });
assert.equal(invented.nutrition, null, 'kaynagi belirsiz veri kalori iddiasina donusmemeli');

const recipe = recipeNutrition({ title: 'ornek tarif' });
assert.equal(recipe.fit_verification, 'unverified');
assert.equal(recipe.nutrition, null);

console.log('SOFRA_NUTRITION_CONTRACT_TEST_OK');
console.log('conversion=gram_adet_kg provenance=complete missingCoverage=blocked');
