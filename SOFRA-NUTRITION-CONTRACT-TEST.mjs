import assert from 'node:assert/strict';
import { normalizeNutrition, recipeNutrition } from './SOFRA-NUTRITION-V1.mjs';

const verified = normalizeNutrition({
  fit_verification: 'verified', source: 'food_database_v1',
  nutrition: { kcal: 420, protein_g: 24, carbs_g: 38, fat_g: 18, fiber_g: 7 },
});
assert.equal(verified.fit_verification, 'verified');
assert.equal(verified.nutrition.kcal, 420);
assert.equal(verified.basis, 'per_serving');

const missingField = normalizeNutrition({
  fit_verification: 'verified', source: 'food_database_v1',
  nutrition: { kcal: 420, protein_g: 24, carbs_g: 38, fat_g: 18 },
});
assert.equal(missingField.fit_verification, 'unverified');
assert.equal(missingField.nutrition, null);

const invented = normalizeNutrition({ fit_verification: 'verified', source: 'unknown', nutrition: { kcal: 1, protein_g: 1, carbs_g: 1, fat_g: 1, fiber_g: 1 } });
assert.equal(invented.nutrition, null, 'kaynağı belirsiz veri kalori iddiasına dönüşmemeli');

const recipe = recipeNutrition({ title: 'Örnek tarif' });
assert.equal(recipe.fit_verification, 'unverified');
assert.equal(recipe.nutrition, null);

console.log('SOFRA_NUTRITION_CONTRACT_TEST_OK');
