import assert from 'node:assert/strict';
import { catalog, recommend } from './SOFRA-ALGORITHM-V1.mjs';
import { assessRecipeSafety, normalizeSafetyProfile, SAFETY_KEYS } from './SOFRA-SAFETY-V1.mjs';

const profile = normalizeSafetyProfile({ selected: ['gluten', 'gluten', 'not-a-real-key'] });
assert.deepEqual(profile.selected, ['gluten']);
assert.deepEqual(SAFETY_KEYS.length, 8);

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

const unrestricted = recommend({ mode: 'sofra', inventory: [] });
const restricted = recommend({ mode: 'sofra', inventory: [], safetyProfile: { selected: ['gluten'] } });
assert.ok(unrestricted.length > 0);
assert.equal(restricted.length, 0, 'mevcut demo tarifleri doğrulanmadan çölyak için önerilmemeli');

console.log('SOFRA_SAFETY_CONTRACT_TEST_OK');
console.log(`keys=${SAFETY_KEYS.length} unrestricted=${unrestricted.length} restricted=${restricted.length}`);
