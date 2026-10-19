import assert from 'node:assert/strict';
import fs from 'node:fs';
import { catalog, recommend } from './SOFRA-ALGORITHM-V1.mjs';
import { assessRecipeSafety, inspectIngredientSafety, normalizeSafetyProfile, recipeSafetyProvenance, validateSafetySourceRecord, SAFETY_KEYS } from './SOFRA-SAFETY-V1.mjs';

const profile = normalizeSafetyProfile({ selected: ['gluten', 'gluten', 'not-a-real-key'] });
assert.deepEqual(profile.selected, ['gluten']);
assert.deepEqual(SAFETY_KEYS.length, 8);
const ingredientChecks = inspectIngredientSafety([['200 g', 'makarna'], ['50 g', 'peynir'], ['2 adet', 'domates']]);
assert.deepEqual(ingredientChecks[0].potential_allergens, ['gluten']);
assert.deepEqual(ingredientChecks[1].potential_allergens, ['milk']);
assert.equal(ingredientChecks[2].evidence_status, 'unmapped');
assert.equal(ingredientChecks.every((item) => item.label_check_required), true);

const pizza = catalog.find((recipe) => recipe.id === 'recipe_pizza');
assert.equal(assessRecipeSafety(pizza, {}).status, 'not_requested');
assert.equal(assessRecipeSafety(pizza, { selected: ['gluten'] }).status, 'blocked');
assert.deepEqual(assessRecipeSafety(pizza, { selected: ['gluten'] }).conflicts, ['gluten']);

const bowl = catalog.find((recipe) => recipe.id === 'recipe_vegetable_bowl');
const bowlReview = assessRecipeSafety(bowl, { selected: ['gluten'] });
assert.equal(bowlReview.status, 'review_required', 'doğrulamasız tarif çölyak için uygun sayılmamalı');
assert.equal(bowlReview.blocked, true);

const verifiedRecipe = {
  safety: { allergens: [], verified: true, crossContamination: 'controlled' },
};
assert.equal(assessRecipeSafety(verifiedRecipe, { selected: ['gluten'] }).status, 'eligible');
assert.equal(assessRecipeSafety({ safety: { allergens: [], verified: true, crossContamination: 'unknown' } }, { selected: ['gluten'] }).reason, 'cross_contamination_unknown');

const verifiedSource = validateSafetySourceRecord({
  source_id: 'safety-partner-001',
  source_type: 'licensed_partner',
  source_url: 'https://partner.example/safety/001',
  attribution: 'Demo safety partner',
  license: 'licensed_partner',
  license_url: 'https://partner.example/license',
  revision_id: 'safety-001-r2',
  last_verified_at: '2026-10-19T10:00:00Z',
  verified: true,
  cross_contamination: 'controlled',
  ingredients: [
    { canonical_name: 'domates', allergens: [], evidence_status: 'verified', label_check_required: true, cross_contamination: 'controlled' },
    { canonical_name: 'zeytinyagi', allergens: [], evidence_status: 'verified', label_check_required: true, cross_contamination: 'controlled' },
  ],
});
assert.equal(verifiedSource.status, 'verified');
assert.equal(verifiedSource.safety_provenance.cross_contamination, 'controlled');
assert.equal(recipeSafetyProvenance({ safety_source: { source_id: 'missing' } }), null);
const incompleteSource = validateSafetySourceRecord({
  source_id: 'safety-bad',
  source_type: 'licensed_partner',
  source_url: 'https://partner.example/safety/bad',
  attribution: 'Demo',
  license: 'licensed_partner',
  license_url: 'https://partner.example/license',
  revision_id: 'r1',
  last_verified_at: '2026-10-19T10:00:00Z',
  verified: true,
  cross_contamination: 'controlled',
  ingredients: [{ canonical_name: 'domates', allergens: [], evidence_status: 'candidate', label_check_required: true, cross_contamination: 'unknown' }],
});
assert.equal(incompleteSource.status, 'rejected');
assert.ok(incompleteSource.errors.includes('ingredient_0_verification_required'));
assert.ok(incompleteSource.errors.includes('cross_contamination_coverage_incomplete'));

const unrestricted = recommend({ mode: 'sofra', inventory: [] });
const restricted = recommend({ mode: 'sofra', inventory: [], safetyProfile: { selected: ['gluten'] } });
assert.ok(unrestricted.length > 0);
assert.equal(restricted.length, 0, 'mevcut demo tarifleri doğrulanmadan çölyak için önerilmemeli');

for (const file of ['./outputs/sofra-motoru-home-v43.html', './outputs/sofra-motoru-reference-v2.html']) {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(
    html,
    /filter\(item=>recipeSafetyAllowedV46\(item\.title\)&&item\.fit/,
    `${file} Fit önerileri gıda güvenliği filtresini kullanmıyor`,
  );
}

console.log('SOFRA_SAFETY_CONTRACT_TEST_OK');
console.log(`keys=${SAFETY_KEYS.length} unrestricted=${unrestricted.length} restricted=${restricted.length}`);
