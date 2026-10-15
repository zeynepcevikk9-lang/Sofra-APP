import assert from 'node:assert/strict';
import { buildMarketHandoff, buildMarketRequest, estimatedTotal, rankQuotes } from './SOFRA-MARKET-V1.mjs';

assert.equal(estimatedTotal({ subtotal: 331, deliveryFee: 29.9 }), 360.9);
assert.throws(() => buildMarketRequest({ candidateIds: ['candidate_domates'], userConfirmed: false }), /onayı gerekir/);
assert.deepEqual(buildMarketRequest({ candidateIds: ['candidate_domates'], userConfirmed: true }), { candidateIds: ['candidate_domates'], userConfirmed: true, sort: 'total' });
assert.equal(buildMarketRequest({ candidateIds: ['candidate_domates'], userConfirmed: true, sort: 'fast' }).sort, 'fast');
assert.throws(() => buildMarketRequest({ candidateIds: ['candidate_domates'], userConfirmed: true, sort: 'unknown' }), /geçersiz market sıralaması/);
assert.throws(() => buildMarketRequest({ candidateIds: [], userConfirmed: true }), /benzersiz bir dizi/);
assert.throws(() => buildMarketRequest({ candidateIds: ['candidate_domates', 'candidate_domates'], userConfirmed: true }), /benzersiz bir dizi/);
assert.deepEqual(buildMarketHandoff({ provider: 'CarrefourSA', candidateIds: ['candidate_domates'], userConfirmed: true }), {
  schema_version: 1,
  provider: 'CarrefourSA',
  candidate_ids: ['candidate_domates'],
  action: 'open_partner',
  handoff_status: 'not_connected',
  available: false,
  partner_url: null,
  user_confirmed: true,
  disclosure: 'Market bağlantısı ve yönlendirme bu prototipte henüz açık değil.',
});
assert.throws(() => buildMarketHandoff({ provider: 'Bilinmeyen', candidateIds: ['candidate_domates'], userConfirmed: true }), /geçersiz market sağlayıcısı/);

const quotes = rankQuotes([
  {
    retailer: 'CarrefourSA', subtotal: 331, deliveryFee: 29.9, minimumBasket: null,
    quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z', isSponsored: false,
  },
  {
    retailer: 'Migros', subtotal: 348, deliveryFee: 29.9, minimumBasket: 400,
    quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z', isSponsored: false,
  },
  {
    retailer: 'Getir', subtotal: 342.1, deliveryFee: 0, minimumBasket: 350,
    quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z', isSponsored: true,
    partnershipLabel: 'İş birliği',
  },
], { now: '2026-10-14T12:00:00Z' });

assert.equal(quotes[0].retailer, 'CarrefourSA');
assert.equal(quotes[0].estimatedTotal, 360.9);
assert.equal(quotes[0].displayLabel, 'En uygun toplam');
assert.equal(quotes[0].differenceFromBest, 0);
assert.equal(quotes[0].comparisonState, 'comparable');
assert.equal(quotes[1].displayLabel, 'Tahmini toplam');
assert.equal(quotes[1].differenceFromBest, null, 'minimum sepeti karşılanmayan teklif fiyat farkı iddia etmemeli');
assert.equal(quotes[1].comparisonState, 'minimum_basket_not_met');
assert.equal(quotes[2].displayLabel, 'Tahmini toplam');
assert.equal(quotes.find((quote) => quote.retailer === 'Getir').sponsorshipLabel, 'İş birliği');
assert.equal(quotes.find((quote) => quote.retailer === 'Migros').minimumBasketMet, false);
assert.equal(quotes.find((quote) => quote.retailer === 'Migros').comparisonLabel, 'Minimum sepet tamamlanmalı');

const stale = rankQuotes([{
  retailer: 'Old Market', subtotal: 200, deliveryFee: 0, minimumBasket: null,
  quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-12T12:00:00Z', isSponsored: false,
}], { now: '2026-10-14T12:00:00Z' });
assert.equal(stale[0].displayLabel, 'Tahmini toplam');
assert.equal(stale[0].fresh, false);
assert.equal(stale[0].comparisonState, 'stale');

const comparable = rankQuotes([
  { retailer: 'A', subtotal: 100, deliveryFee: 0, quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z' },
  { retailer: 'B', subtotal: 112.5, deliveryFee: 0, quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z' },
], { now: '2026-10-14T12:00:00Z' });
assert.equal(comparable[1].differenceFromBest, 12.5, 'karşılaştırılabilir teklif farkı hesaplanmalı');

const fast = rankQuotes([
  { retailer: 'Slow', subtotal: 100, deliveryFee: 0, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 60, updatedAt: '2026-10-14T11:00:00Z' },
  { retailer: 'Fast', subtotal: 130, deliveryFee: 0, quantityMatch: true, stockState: 'complete', deliveryEtaMinutes: 20, updatedAt: '2026-10-14T11:00:00Z' },
], { now: '2026-10-14T12:00:00Z', sort: 'fast' });
assert.equal(fast[0].retailer, 'Fast');
assert.equal(fast[0].displayLabel, 'En hızlı');
assert.equal(fast[0].differenceFromBest, null, 'hız sıralaması toplam fiyat farkı iddia etmemeli');

const single = rankQuotes([
  { retailer: 'Split', subtotal: 90, deliveryFee: 0, singleStore: false, quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z' },
  { retailer: 'Complete', subtotal: 120, deliveryFee: 0, singleStore: true, quantityMatch: true, stockState: 'complete', updatedAt: '2026-10-14T11:00:00Z' },
], { now: '2026-10-14T12:00:00Z', sort: 'single' });
assert.equal(single[0].retailer, 'Complete');
assert.equal(single[0].displayLabel, 'Tek markette tamamla');

console.log('SOFRA_MARKET_CONTRACT_TEST_OK');
console.log(`best=${quotes[0].retailer} sponsoredLabel=${quotes.find((quote) => quote.retailer === 'Getir').sponsorshipLabel} staleGuard=${stale[0].fresh === false}`);
