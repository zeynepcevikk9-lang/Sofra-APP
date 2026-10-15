import assert from 'node:assert/strict';
import { recommend, recentAddBoost } from './SOFRA-ALGORITHM-V1.mjs';

const now = new Date('2026-10-15T12:00:00.000Z');
const inventory = [
  { display_name: 'Yumurta', canonical_name: 'yumurta', stock_state: 'available' },
  { display_name: 'Patates', canonical_name: 'patates', stock_state: 'available' },
  { display_name: 'Peynir', canonical_name: 'peynir', stock_state: 'low' },
  { display_name: 'Patlıcan', canonical_name: 'patlıcan', stock_state: 'available', added_at: '2026-10-15T08:00:00.000Z' },
];

const ranked = recommend({ mode: 'sofra', inventory, now });
assert.equal(ranked[0].id, 'recipe_eggplant_olive_oil', 'yeni eklenen patlıcan öneriyi görünür biçimde yönlendirmeli');
assert.equal(ranked[0].reasonCode, 'recent_inventory_add');
assert.equal(ranked[0].recentAddBoost, 42);
assert.equal(recentAddBoost({ addedAt: '2026-10-13T08:00:00.000Z' }, now), 0, '24 saatten eski ekleme boost almamalı');

console.log('SOFRA_ALGORITHM_CONTRACT_OK');
