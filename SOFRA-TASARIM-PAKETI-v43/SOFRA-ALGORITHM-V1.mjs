/**
 * Sofra'nın deterministik öneri motorunun backend'e taşınabilir V1 karşılığı.
 *
 * Bu modül gerçek AI değildir. Aynı girdilerle aynı sıralamayı üretir; kullanıcı
 * tarafından eklenmeyen ürünleri var kabul etmez ve açıklama sinyallerini korur.
 */

import { assessRecipeSafety, normalizeSafetyProfile } from './SOFRA-SAFETY-V1.mjs';

export const catalog = [
  { id: 'recipe_pasta_mushroom', title: 'Kremalı mantarlı makarna', mins: 25, emoji: '🍝', ingredients: ['mantar', 'makarna', 'peynir'], tags: ['sofra', 'dunya', 'pratik'], fit: false, safety: { allergens: ['milk', 'gluten'], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_vegetable_bowl', title: 'Renkli sebze bowl', mins: 20, emoji: '🥗', ingredients: ['marul', 'roka', 'domates'], tags: ['sofra', 'fit', 'mevsim'], fit: true, fitGoals: ['balanced', 'lose'], safety: { allergens: [], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_oven_vegetables', title: 'Fırında sebzeli tabak', mins: 35, emoji: '🥘', ingredients: ['patates', 'domates', 'peynir'], tags: ['sofra', 'mevsim'], fit: true, fitGoals: ['balanced', 'lose'], safety: { allergens: ['milk'], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_pizza', title: 'Ev yapımı pizza', mins: 45, emoji: '🍕', ingredients: ['yumurta', 'peynir', 'domates'], tags: ['sofra', 'dunya'], fit: false, safety: { allergens: ['egg', 'milk', 'gluten'], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_yogurt_bowl', title: 'Yoğurtlu meyve kasesi', mins: 10, emoji: '🍓', ingredients: ['yoğurt', 'süt', 'elma'], tags: ['tatli', 'fit', 'pratik'], fit: true, fitGoals: ['balanced', 'lose'], safety: { allergens: ['milk'], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_noodle', title: 'Sebzeli noodle', mins: 25, emoji: '🍜', ingredients: ['mantar', 'marul', 'domates'], tags: ['sofra', 'dunya', 'pratik'], fit: true, fitGoals: ['balanced', 'gain'], safety: { allergens: ['gluten'], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_avocado_egg_toast', title: 'Avokadolu yumurta tost', mins: 12, emoji: '🥑', ingredients: ['yumurta', 'ekmek', 'avokado'], tags: ['fit', 'pratik'], fit: true, fitGoals: ['balanced', 'gain'], safety: { allergens: ['egg', 'gluten'], verified: false, crossContamination: 'unknown' } },
  { id: 'recipe_eggplant_olive_oil', title: 'Zeytinyağlı patlıcan', mins: 30, emoji: '🍆', ingredients: ['patlıcan', 'domates', 'soğan'], tags: ['sofra', 'mevsim', 'sebze'], fit: true, fitGoals: ['balanced', 'lose'], safety: { allergens: [], verified: false, crossContamination: 'unknown' } },
];

export function normalize(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .trim();
}

function toInventoryItem(item) {
  if (Array.isArray(item)) {
    return { name: normalize(item[1]), label: item[1], status: item[3] || 'var', expiry: item[4] || '' };
  }
  return {
    name: normalize(item.canonical_name || item.display_name),
    label: item.display_name || item.canonical_name,
    status: item.stock_state || item.status || 'available',
    expiry: item.expiry_date || item.expiry || '',
  };
}

export function activeInventory(items = []) {
  return items.map(toInventoryItem).filter((item) => !['yok', 'finished'].includes(item.status));
}

export function expiryBoost(item, now = new Date()) {
  if (!item.expiry) return 0;
  const date = new Date(`${item.expiry}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 0;
  const reference = now instanceof Date ? now : new Date(now);
  const days = (date - reference) / 86400000;
  return days >= 0 && days <= 3 ? 16 : days >= 0 && days <= 7 ? 8 : 0;
}

function statusLowBoost(item) {
  return item.status === 'az' || item.status === 'low' ? 8 : 0;
}

function feedbackBoost(recipeId, feedback = []) {
  const raw = feedback.reduce((sum, event) => {
    const eventRecipeId = event.recipe_id || event.recipeId || String(event.recommendation_id || '').replace(/^recommendation_/, '');
    if (eventRecipeId !== recipeId) return sum;
    return sum + (event.value === 'helpful' ? 6 : event.value === 'not_helpful' ? -6 : 0);
  }, 0);
  return Math.max(-12, Math.min(12, raw));
}

function preferenceBoost(recipe, feedback = []) {
  const raw = feedback.reduce((sum, event) => {
    const eventRecipeId = event.recipe_id || event.recipeId || String(event.recommendation_id || '').replace(/^recommendation_/, '');
    if (!eventRecipeId || eventRecipeId === recipe.id) return sum;
    const source = catalog.find((candidate) => candidate.id === eventRecipeId);
    if (!source) return sum;
    const sharedTags = source.tags.filter((tag) => recipe.tags.includes(tag)).length;
    const direction = event.value === 'helpful' ? 2 : event.value === 'not_helpful' ? -2 : 0;
    return sum + sharedTags * direction;
  }, 0);
  return Math.max(-6, Math.min(6, raw));
}

function repeatPenalty(recipeId, recentRecipeIds = []) {
  const repeats = recentRecipeIds.filter((id) => id === recipeId).length;
  return -Math.min(18, repeats * 8);
}

function fitGoalBoost(recipe, fitGoal) {
  if (!fitGoal) return 0;
  return recipe.fitGoals?.includes(fitGoal) ? 20 : -10;
}

export function recommend({ mode = 'sofra', maxMinutes = 0, inventory = [], feedback = [], recentRecipeIds = [], safetyProfile = {}, fitGoal = null, now = new Date() } = {}) {
  const pantry = activeInventory(inventory);
  const normalizedSafetyProfile = normalizeSafetyProfile(safetyProfile);
  return catalog
    .map((recipe) => {
      const safety = assessRecipeSafety(recipe, normalizedSafetyProfile);
      if (safety.blocked) return null;
      const matches = pantry.filter((item) => recipe.ingredients.some((ingredient) => item.name.includes(normalize(ingredient)) || normalize(ingredient).includes(item.name)));
      const matchedIngredients = [...new Set(matches.flatMap((item) => recipe.ingredients.filter((ingredient) => item.name.includes(normalize(ingredient)) || normalize(ingredient).includes(item.name))))];
      const missing = recipe.ingredients.filter((ingredient) => !matchedIngredients.includes(ingredient));
      const learningBoost = feedbackBoost(recipe.id, feedback);
      const preferenceBoostValue = preferenceBoost(recipe, feedback);
      const repeatPenaltyValue = repeatPenalty(recipe.id, recentRecipeIds);
      const fitGoalBoostValue = mode === 'fit' ? fitGoalBoost(recipe, fitGoal) : 0;
      const score = matchedIngredients.length * 28
        + matches.reduce((sum, item) => sum + statusLowBoost(item) + expiryBoost(item, now), 0)
        + learningBoost
        + preferenceBoostValue
        + repeatPenaltyValue
        + (mode === 'fit' ? (recipe.fit ? 42 : -12) : 0)
        + fitGoalBoostValue
        + (mode === 'tatli' ? (recipe.tags.includes('tatli') ? 55 : -20) : 0)
        + (mode === 'sofra' && recipe.tags.includes('sofra') ? 12 : 0)
        + (maxMinutes ? (recipe.mins <= maxMinutes ? 18 : -18) : 0)
        - missing.length * 2;
      return {
        ...recipe,
        score,
        matchedIngredients,
        missing,
        matchedCount: matchedIngredients.length,
        timeFit: !maxMinutes || recipe.mins <= maxMinutes,
        expiryBoost: matches.some((item) => expiryBoost(item, now) > 0),
        learningBoost,
        preferenceBoost: preferenceBoostValue,
        repeatPenalty: repeatPenaltyValue,
        fitGoalBoost: fitGoalBoostValue,
        safety,
        reasonCode: fitGoalBoostValue > 0 ? 'fit_goal' : matches.some((item) => expiryBoost(item, now) > 0) ? 'expiry_priority' : matchedIngredients.length ? 'inventory_match' : 'general',
        scoreVersion: 'deterministic-v1.2',
      };
    })
    .filter((item) => item && (!maxMinutes || item.mins <= maxMinutes || item.matchedCount > 0))
    .sort((a, b) => b.score - a.score || a.mins - b.mins);
}

export function top(options = {}) {
  return recommend(options)[0] || null;
}
