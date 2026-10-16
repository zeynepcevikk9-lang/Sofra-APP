import assert from 'node:assert/strict';
import { adaptCarrefourSAQuote, adaptGetirQuote, adaptRetailerQuote } from './SOFRA-MARKET-ADAPTERS-V1.mjs';

const now = '2026-10-16T12:00:00Z';
const quote = adaptCarrefourSAQuote({
  subtotal: '331',
  delivery_fee: 29.9,
  mandatory_fees: 2.5,
  minimum_basket: null,
  quantity_match: true,
  stock_state: 'complete',
  updated_at: '2026-10-16T11:00:00Z',
  delivery_eta_minutes: 1440,
  single_store: true,
}, { now });
assert.equal(quote.provider, 'CarrefourSA');
assert.equal(quote.estimatedTotal, 363.4);
assert.equal(quote.fresh, true);
assert.equal(quote.eligibleForBestTotal, true);
assert.equal(quote.adapterVersion, 'provider-adapter-v1');
assert.equal(quote.source, 'partner');

const sponsored = adaptGetirQuote({
  sub_total: 342.1,
  delivery_fee: 0,
  stock_state: 'complete',
  quantity_match: true,
  updated_at: now,
  is_sponsored: true,
  partnership_label: 'İş birliği',
}, { now });
assert.equal(sponsored.sponsorshipLabel, undefined);
assert.equal(sponsored.isSponsored, true);
assert.equal(sponsored.partnershipLabel, 'İş birliği');

assert.throws(() => adaptRetailerQuote('Bilinmeyen', {}), /market sağlayıcısı/);
assert.throws(() => adaptRetailerQuote('Migros', { subtotal: 10, fit_profile: { goal: 'lose' } }), /sağlık alanı/);

const stale = adaptRetailerQuote('Migros', { subtotal: 100, updated_at: '2026-10-10T12:00:00Z', stock_state: 'complete' }, { now });
assert.equal(stale.comparisonState, 'stale');
assert.equal(stale.eligibleForBestTotal, false);

console.log('SOFRA_MARKET_ADAPTER_CONTRACT_OK');
console.log('retailers=3 mapping=ok sensitiveFields=blocked stale=guarded');

