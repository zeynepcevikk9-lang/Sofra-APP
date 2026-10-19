import assert from 'node:assert/strict';
import { buildPublicPlanShare, buildPublicRecipeShare, buildSharePreview, SHARE_PRIVATE_FIELDS } from './SOFRA-SHARE-V1.mjs';

const recipe = buildPublicRecipeShare({
  recipe: {
    id: 'recipe_demo',
    title: 'Public tarif',
    minutes: 20,
    tags: ['pratik'],
    fit: true,
    fit_goals: ['balanced'],
    ingredients: ['domates'],
    safety: { allergens: [], verified: false, cross_contamination: 'unknown' },
    fit_profile: { weight: 70 },
    health_summary: { active_calories: 400 },
  },
  detail: {
    ingredients_detail: [{ display_name: 'domates', quantity_text: '2 adet', unit: 'adet' }],
    instructions: ['Dograyip servis et.'],
    step_media: [{ step: 1, type: 'image', provider: 'licensed_partner', asset_id: 'asset_1', alt: 'Domates' }],
    tip: 'Taze kullan.',
  },
});

assert.equal(recipe.resource_type, 'recipe');
assert.equal(recipe.recipe.ingredients[0].quantity_text, '2 adet');
assert.equal('fit_profile' in recipe.recipe, false);
assert.equal('health_summary' in recipe.recipe, false);
assert.equal('pantry' in recipe, false);

const plan = buildPublicPlanShare({
  plan: {
    id: 'plan_private',
    date: '2026-10-19',
    servings: 2,
    custom_meals: [{ slot: 'dinner', title: 'Benim yemegim', note: 'Sadece bana ait not' }],
    pantry: [{ display_name: 'domates' }],
    fit_profile: { goal: 'lose' },
  },
  recipes: [{ id: 'recipe_demo', title: 'Public tarif', minutes: 20, tags: [], content_provenance: null }],
});

assert.equal(plan.plan.custom_meals[0].title, 'Benim yemegim');
assert.equal('note' in plan.plan.custom_meals[0], false);
assert.equal('pantry' in plan.plan, false);
assert.equal('fit_profile' in plan.plan, false);

const preview = buildSharePreview({ resource_type: 'recipe', recipe: recipe.recipe, detail: {} });
assert.equal(preview.share_status, 'preview_only');
assert.equal(preview.live_link, false);
assert.equal(preview.persisted, false);
assert.equal(preview.privacy.health_data_included, false);
assert.equal(preview.privacy.pantry_included, false);
assert.ok(SHARE_PRIVATE_FIELDS.includes('custom_meal.note'));

console.log('SOFRA_SHARE_CONTRACT_TEST_OK');
