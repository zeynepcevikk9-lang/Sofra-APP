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

const searchAliasGroups = Object.freeze([
  ['domates', 'domatesli', 'tomat', 'tomato'],
  ['patlican', 'patlicanli', 'eggplant', 'aubergine'],
  ['yogurt', 'yogurtlu', 'yoğurt'],
  ['makarna', 'pasta'],
  ['mantar', 'mantarli', 'mushroom'],
  ['patates', 'potato'],
  ['yumurta', 'egg'],
  ['sogan', 'onion'],
  ['marul', 'lettuce'],
  ['roka', 'arugula'],
  ['elma', 'apple'],
  ['avokado', 'avocado'],
]);

// Tarif metni ayrı tutulur: öneri sıralaması bu içeriğe bağımlı değildir;
// besin ve alerjen doğrulaması yapılmadan kesin sağlık iddiası üretilmez.
export const recipeDetails = Object.freeze({
  recipe_pasta_mushroom: { servings: 2, ingredients: [['200 g', 'makarna'], ['250 g', 'mantar'], ['50 g', 'peynir'], ['1 yemek kaşığı', 'zeytinyağı']], instructions: ['Makarnayı paketin üzerindeki süreye göre haşla ve yarım su bardağı suyunu ayır.', 'Mantarları zeytinyağında suyunu çekene kadar sotele.', 'Makarnayı mantarla karıştır, ayırdığın sudan ekle ve peynirle servis et.'], tip: 'Peyniri eklemeden önce ocağı kısarsan sos daha pürüzsüz olur.' },
  recipe_vegetable_bowl: { servings: 2, ingredients: [['1/2 adet', 'marul'], ['1 avuç', 'roka'], ['2 adet', 'domates'], ['1 yemek kaşığı', 'zeytinyağı']], instructions: ['Marul ve rokayı yıka, iyice kurula.', 'Domatesleri doğrayıp yeşilliklerle karıştır.', 'Zeytinyağı ve istediğin baharatlarla servis et.'], tip: 'Sosu servis anında eklemek sebzelerin diri kalmasına yardımcı olur.' },
  recipe_oven_vegetables: { servings: 2, ingredients: [['3 adet', 'patates'], ['2 adet', 'domates'], ['60 g', 'peynir'], ['1 yemek kaşığı', 'zeytinyağı']], instructions: ['Patatesleri ince dilimle ve yağla harmanla.', 'Patatesleri 200°C fırında yumuşayana kadar pişir.', 'Domates ve peyniri ekleyip peynir eriyene kadar fırınla.'], tip: 'Dilimleri benzer kalınlıkta kesmek pişme süresini dengeler.' },
  recipe_pizza: { servings: 2, ingredients: [['1 adet', 'pizza hamuru'], ['1 adet', 'domates'], ['80 g', 'peynir'], ['1 adet', 'yumurta']], instructions: ['Hamuru tepsiye açıp üzerine domatesi yay.', 'Peyniri serpiştir ve yumurtayı tarifin merkezine kır.', '220°C fırında kenarları kızarana kadar pişir.'], tip: 'Hamurun ortasını çok kalın bırakma; böylece taban daha iyi pişer.' },
  recipe_yogurt_bowl: { servings: 1, ingredients: [['150 g', 'yoğurt'], ['1/2 adet', 'elma'], ['2 yemek kaşığı', 'yulaf']], instructions: ['Elmayı yıka ve küçük küpler halinde doğra.', 'Yoğurdu kaseye alıp yulafla karıştır.', 'Elmayı üzerine ekleyip hemen servis et.'], tip: 'İlave şeker yerine meyvenin kendi tatlılığını kullanabilirsin.' },
  recipe_noodle: { servings: 2, ingredients: [['150 g', 'noodle'], ['150 g', 'mantar'], ['1 avuç', 'marul'], ['1 adet', 'domates']], instructions: ['Noodle’ı yumuşayana kadar haşla ve süz.', 'Mantarları tavada sotele, doğranmış domatesi ekle.', 'Noodle’ı karıştırıp marulla birlikte servis et.'], tip: 'Noodle çeşidinin içerik ve gluten bilgisini paketten kontrol et.' },
  recipe_avocado_egg_toast: { servings: 1, ingredients: [['1 dilim', 'ekmek'], ['1 adet', 'yumurta'], ['1/2 adet', 'avokado']], instructions: ['Ekmeği kızart.', 'Yumurtayı istediğin kıvamda pişir.', 'Avokadoyu ekmeğe ezerek sür ve yumurtayı üzerine koy.'], tip: 'Ekmek ve yumurtanın alerjen bilgisini ambalajdan kontrol et.' },
  recipe_eggplant_olive_oil: { servings: 2, ingredients: [['2 adet', 'patlıcan'], ['2 adet', 'domates'], ['1 adet', 'soğan'], ['2 yemek kaşığı', 'zeytinyağı']], instructions: ['Patlıcanları alacalı soyup küp doğra; acısını almak istersen kısa süre tuzlu suda beklet.', 'Soğanı zeytinyağında yumuşat, domatesi ekleyip birkaç dakika pişir.', 'Patlıcanı ekle, kapağı kapat ve kısık ateşte yumuşayana kadar pişir.'], tip: 'Tarifin suyu azalırsa az miktarda sıcak su ekleyebilirsin.' },
});

// Tarif adimlarina baglanan gercek gorsel varliklari ayri tutuyoruz.
// Asset id'leri gorsel kaynagini belirtir; dogrulanmis besin veya saglik iddiasi degildir.
export const recipeStepMedia = Object.freeze({
  recipe_pasta_mushroom: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1551183053-bf91a1d81141', alt: 'Makarnanin haslanmasi' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1504674900247-0877df9cc836', alt: 'Mantarin tavada sotelenmesi' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1473093295043-cdd812d0e601', alt: 'Kremali mantarli makarnanin servisi' },
  ],
  recipe_vegetable_bowl: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1512621776951-a57141f2eefd', alt: 'Yikanan yesillikler' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1540189549336-e6e99c3679fe', alt: 'Dogranmis sebzeler' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1512621776951-a57141f2eefd', alt: 'Sebze kasesinin servisi' },
  ],
  recipe_oven_vegetables: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1518977676601-b53f82aba655', alt: 'Dilimlenmis patatesler' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1572453800999-e8d2d1589b7c', alt: 'Firinda sebzeler' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1547592180-85f173990554', alt: 'Peynirli sebze tabagi' },
  ],
  recipe_pizza: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1579751626657-72bc17010498', alt: 'Pizza hamurunun acilmasi' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1574071318508-1cdbab80d002', alt: 'Pizzaya malzeme eklenmesi' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1565299624946-b28f40a0ae38', alt: 'Pizzanin firindan cikmasi' },
  ],
  recipe_yogurt_bowl: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1490474418585-ba9bad8fd0ea', alt: 'Dogranmis elma' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1488477181946-6428a0291777', alt: 'Yogurt ve yulaf kasesi' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1546069901-ba9599a7e63c', alt: 'Meyveli yogurt kasesi' },
  ],
  recipe_noodle: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1569718212165-3a8278d5f624', alt: 'Noodle haslanmasi' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1512058564366-18510be2db19', alt: 'Sebzelerin tavada sotelenmesi' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1551183053-bf91a1d81141', alt: 'Sebzeli noodle servisi' },
  ],
  recipe_avocado_egg_toast: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1525351484163-7529414344d8', alt: 'Kizarmis ekmek' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1525351484163-7529414344d8', alt: 'Pismis yumurta' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1525351484163-7529414344d8', alt: 'Avokadolu yumurta tost' },
  ],
  recipe_eggplant_olive_oil: [
    { step: 1, type: 'image', provider: 'unsplash', asset_id: 'photo-1634546865062-ed3eb17643f6', alt: 'Dogranmis patlican' },
    { step: 2, type: 'image', provider: 'unsplash', asset_id: 'photo-1592924357228-91a4daadcfea', alt: 'Domatesli soganli sos' },
    { step: 3, type: 'image', provider: 'unsplash', asset_id: 'photo-1634546865062-ed3eb17643f6', alt: 'Zeytinyagli patlican servisi' },
  ],
});

export function matchesRecipeSearch(recipe, query) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;
  const haystack = [recipe.title, ...(recipe.ingredients || []), ...(recipe.tags || [])]
    .map(normalize)
    .join(' ');
  return tokens.every((token) => {
    const aliases = searchAliasGroups.find((group) => group.some((alias) => normalize(alias) === token)) || [token];
    return aliases.some((alias) => haystack.includes(normalize(alias)));
  });
}

export function normalize(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function toInventoryItem(item) {
  if (Array.isArray(item)) {
    return { name: normalize(item[1]), label: item[1], status: item[3] || 'var', expiry: item[4] || '', addedAt: item[5] || '' };
  }
  return {
    name: normalize(item.canonical_name || item.display_name),
    label: item.display_name || item.canonical_name,
    status: item.stock_state || item.status || 'available',
    expiry: item.expiry_date || item.expiry || '',
    addedAt: item.added_at || item.addedAt || item.updated_at || '',
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

export function recentAddBoost(item, now = new Date()) {
  if (!item.addedAt) return 0;
  const added = new Date(item.addedAt);
  const reference = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(added.getTime()) || Number.isNaN(reference.getTime())) return 0;
  const hours = (reference - added) / 3600000;
  return hours >= 0 && hours <= 24 ? 42 : 0;
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

function fitEligible(recipe, fitGoal) {
  if (!recipe.fit) return false;
  return !fitGoal || (Array.isArray(recipe.fitGoals) && recipe.fitGoals.includes(fitGoal));
}

export function recommend({ mode = 'sofra', maxMinutes = 0, inventory = [], feedback = [], recentRecipeIds = [], safetyProfile = {}, fitGoal = null, now = new Date() } = {}) {
  const pantry = activeInventory(inventory);
  const normalizedSafetyProfile = normalizeSafetyProfile(safetyProfile);
  const candidates = mode === 'fit' ? catalog.filter((recipe) => fitEligible(recipe, fitGoal)) : catalog;
  return candidates
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
        + matches.reduce((sum, item) => sum + statusLowBoost(item) + expiryBoost(item, now) + recentAddBoost(item, now), 0)
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
        recentAddBoost: matches.reduce((sum, item) => sum + recentAddBoost(item, now), 0),
        reasonCode: fitGoalBoostValue > 0 ? 'fit_goal' : matches.some((item) => recentAddBoost(item, now) > 0) ? 'recent_inventory_add' : matches.some((item) => expiryBoost(item, now) > 0) ? 'expiry_priority' : matchedIngredients.length ? 'inventory_match' : 'general',
        scoreVersion: 'deterministic-v1.3',
      };
    })
    .filter((item) => item && (!maxMinutes || item.mins <= maxMinutes || item.matchedCount > 0))
    .sort((a, b) => b.score - a.score || a.mins - b.mins);
}

export function top(options = {}) {
  return recommend(options)[0] || null;
}
