import assert from 'node:assert/strict';
import { canonicalizeIngredient, parsePantryNote, parseQuantityText } from './SOFRA-INGEST-V1.mjs';

const parsed = parsePantryNote('2 kg patlıcan, 6 adet yumurtalar, 1 paket spagetti, 1,5 kg domates');
assert.deepEqual(parsed.items.map((item) => item.canonical_name), ['patlıcan', 'yumurta', 'makarna', 'domates']);
assert.deepEqual(parsed.items.map((item) => [item.quantity_value, item.quantity_unit]), [[2, 'kg'], [6, 'adet'], [1, 'paket'], [1.5, 'kg']]);
assert.equal(canonicalizeIngredient('spaghetti'), 'makarna');
assert.deepEqual(parseQuantityText('3 kilo'), { text: '3 kg', value: 3, unit: 'kg' });
assert.equal(parsePantryNote('6 yumurta').items[0].quantity_unit, 'adet');
assert.equal(parsePantryNote('bilinmeyen ürün').unparsed_text, 'bilinmeyen ürün');

console.log('SOFRA_INGEST_CONTRACT_OK');
