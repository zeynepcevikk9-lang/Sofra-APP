import assert from 'node:assert/strict';
import { buildPantryModelRequest, normalizeAiPantryResult, AiContractError } from './SOFRA-AI-V1.mjs';

const request = buildPantryModelRequest('6 yumurta aldım, bilinmeyen ürün');
assert.equal(request.schema_version, 1);
assert.equal(request.task, 'pantry_note');
assert.equal(request.output_rules.auto_save, false);
assert.equal(request.output_rules.user_confirmation_required, true);

const normalized = normalizeAiPantryResult({
  items: [
    { canonical_name: 'yumurta', display_name: 'Yumurta', quantity_text: '6 adet', stock_state: 'available', confidence: 0.98 },
    { canonical_name: 'bilinmeyen', display_name: 'Bilinmeyen ürün', quantity_text: null, stock_state: 'available', confidence: 0.99 },
  ],
  unparsed_text: 'başka bir not',
}, { knownNames: ['yumurta'] });
assert.equal(normalized.items.length, 1);
assert.equal(normalized.items[0].needs_confirmation, true);
assert.equal(normalized.items[0].source, 'ai_preview');
assert.equal(normalized.rejected_items[0].reason, 'known_item_required');
assert.equal(normalized.auto_saved, false);

assert.throws(() => normalizeAiPantryResult({ items: [{ canonical_name: 'yumurta', display_name: 'Yumurta', confidence: 1.2 }] }, { knownNames: ['yumurta'] }), AiContractError);
const unknownOnly = normalizeAiPantryResult({ items: [{ canonical_name: 'yumurta', display_name: 'Yumurta', confidence: 0.8, stock_state: 'available' }] });
assert.equal(unknownOnly.items.length, 0);
assert.equal(unknownOnly.rejected_items[0].reason, 'known_item_required');
console.log('SOFRA_AI_CONTRACT_TEST_OK');
console.log('schema=1 confirmation=required unknownGuard=ok');
