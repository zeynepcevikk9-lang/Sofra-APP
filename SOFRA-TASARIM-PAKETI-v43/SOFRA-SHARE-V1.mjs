/** Public share projection boundary; no live link or persistence is enabled yet. */

export const SHARE_SCHEMA_VERSION = 1;

const privateFields = Object.freeze([
  'pantry',
  'inventory',
  'fit_profile',
  'health_summary',
  'health_context',
  'market_data',
  'feedback',
  'user_id',
  'account_identity',
  'custom_meal.note',
]);

function shareValidationError(message) {
  return Object.assign(new Error(message), { status: 422 });
}

function record(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw shareValidationError(`${label} gecersiz`);
  return value;
}

function text(value, label, max = 1000) {
  if (value == null) return null;
  if (typeof value !== 'string' || value.length > max) throw shareValidationError(`${label} gecersiz`);
  return value;
}

function strings(value, label, maxItems = 40) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > maxItems || value.some((item) => typeof item !== 'string')) throw shareValidationError(`${label} gecersiz`);
  return [...value];
}

function publicMedia(media) {
  if (!Array.isArray(media)) return [];
  return media.map((item) => {
    record(item, 'step_media');
    if (!Number.isInteger(item.step) || item.step < 1 || !['image', 'video'].includes(item.type)) throw shareValidationError('step_media gecersiz');
    return {
      step: item.step,
      type: item.type,
      provider: text(item.provider, 'step_media.provider', 80),
      asset_id: text(item.asset_id, 'step_media.asset_id', 200),
      alt: text(item.alt, 'step_media.alt', 240),
    };
  });
}

function publicIngredients(recipe, detail) {
  const detailed = Array.isArray(detail?.ingredients_detail) ? detail.ingredients_detail : null;
  if (detailed) {
    return detailed.map((item) => ({
      display_name: text(item.display_name || item.canonical_name, 'ingredient.display_name', 160),
      quantity_text: text(item.quantity_text, 'ingredient.quantity_text', 80),
      unit: text(item.unit, 'ingredient.unit', 40),
    }));
  }
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
    return recipe.ingredients.map((item) => ({
      display_name: text(item.display_name || item.canonical_name, 'ingredient.display_name', 160),
      quantity_text: text(item.quantity_text, 'ingredient.quantity_text', 80),
      unit: text(item.unit, 'ingredient.unit', 40),
    }));
  }
  return strings(recipe.ingredients, 'recipe.ingredients').map((name) => ({ display_name: name, quantity_text: null, unit: null }));
}

function publicNutrition(recipe, includeNutrition) {
  if (!includeNutrition || !recipe.nutrition || !recipe.nutrition_provenance) return null;
  return { nutrition: recipe.nutrition, provenance: recipe.nutrition_provenance };
}

export function buildPublicRecipeShare({ recipe, detail = {}, includeNutrition = true } = {}) {
  record(recipe, 'recipe');
  if (typeof recipe.id !== 'string' || !recipe.id.trim() || typeof recipe.title !== 'string' || !recipe.title.trim()) throw shareValidationError('recipe kimligi eksik');
  record(detail, 'detail');
  const instructions = strings(detail.instructions, 'instructions', 40);
  const contentProvenance = recipe.content_provenance && typeof recipe.content_provenance === 'object'
    ? recipe.content_provenance
    : null;
  return {
    resource_type: 'recipe',
    recipe: {
      id: recipe.id,
      title: recipe.title,
      minutes: Number.isInteger(recipe.minutes) ? recipe.minutes : null,
      tags: strings(recipe.tags, 'recipe.tags'),
      fit: recipe.fit === true,
      fit_goals: strings(recipe.fit_goals, 'recipe.fit_goals'),
      ingredients: publicIngredients(recipe, detail),
      instructions,
      tip: text(detail.tip, 'tip', 500),
      step_media: publicMedia(detail.step_media),
      safety: recipe.safety && typeof recipe.safety === 'object' ? {
        allergens: strings(recipe.safety.allergens, 'safety.allergens'),
        verified: recipe.safety.verified === true,
        cross_contamination: text(recipe.safety.cross_contamination, 'safety.cross_contamination', 40),
      } : null,
      content_provenance: contentProvenance,
      nutrition: publicNutrition(recipe, includeNutrition),
    },
  };
}

function publicPlanRecipe(recipe) {
  record(recipe, 'plan.recipe');
  return {
    id: text(recipe.id, 'plan.recipe.id', 200),
    title: text(recipe.title, 'plan.recipe.title', 200),
    minutes: Number.isInteger(recipe.minutes) ? recipe.minutes : null,
    tags: strings(recipe.tags, 'plan.recipe.tags'),
    content_provenance: recipe.content_provenance && typeof recipe.content_provenance === 'object' ? recipe.content_provenance : null,
  };
}

export function buildPublicPlanShare({ plan, recipes = [] } = {}) {
  record(plan, 'plan');
  if (typeof plan.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(plan.date)) throw shareValidationError('plan.date gecersiz');
  if (!Number.isInteger(plan.servings) || plan.servings < 1) throw shareValidationError('plan.servings gecersiz');
  if (!Array.isArray(recipes) || recipes.length > 9) throw shareValidationError('plan.recipes gecersiz');
  const customMeals = Array.isArray(plan.custom_meals) ? plan.custom_meals : [];
  return {
    resource_type: 'plan',
    plan: {
      date: plan.date,
      servings: plan.servings,
      recipes: recipes.map(publicPlanRecipe),
      custom_meals: customMeals.map((meal) => ({
        slot: text(meal.slot, 'custom_meal.slot', 40),
        title: text(meal.title, 'custom_meal.title', 80),
      })),
    },
  };
}

export function buildSharePreview({ resource_type, recipe, detail, plan, recipes, includeNutrition = true } = {}) {
  if (!['recipe', 'plan'].includes(resource_type)) throw shareValidationError('resource_type gecersiz');
  const publicPayload = resource_type === 'recipe'
    ? buildPublicRecipeShare({ recipe, detail, includeNutrition })
    : buildPublicPlanShare({ plan, recipes });
  return {
    schema_version: SHARE_SCHEMA_VERSION,
    share_status: 'preview_only',
    live_link: false,
    persisted: false,
    public_payload: publicPayload,
    excluded_private_fields: [...privateFields],
    privacy: {
      pantry_included: false,
      health_data_included: false,
      fit_profile_included: false,
      market_data_included: false,
      feedback_included: false,
      account_identifiers_included: false,
    },
  };
}

export const SHARE_PRIVATE_FIELDS = privateFields;
