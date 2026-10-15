/** Provider-neutral market quote rules. Live retailer adapters come later. */

export const marketProviders = Object.freeze(['CarrefourSA', 'Getir', 'Migros']);

export function estimatedTotal({ subtotal = 0, deliveryFee = 0, mandatoryFees = 0 } = {}) {
  return Number((Number(subtotal) + Number(deliveryFee) + Number(mandatoryFees)).toFixed(2));
}

export function normalizeQuote(input = {}, now = Date.now()) {
  const total = estimatedTotal(input);
  const minimumBasket = input.minimumBasket == null ? null : Number(input.minimumBasket);
  const minimumBasketMet = minimumBasket == null || total >= minimumBasket;
  const quantityMatch = input.quantityMatch !== false;
  const stockKnown = input.stockState === 'complete';
  const updatedAt = input.updatedAt ? new Date(input.updatedAt) : null;
  const reference = new Date(now).getTime();
  const fresh = updatedAt && !Number.isNaN(updatedAt.getTime()) ? (reference - updatedAt.getTime()) < 86400000 : false;
  const comparisonState = !fresh
    ? 'stale'
    : !quantityMatch
      ? 'quantity_mismatch'
      : !stockKnown
        ? 'stock_unknown'
        : !minimumBasketMet
          ? 'minimum_basket_not_met'
          : 'comparable';
  const comparisonLabel = {
    comparable: 'Karşılaştırılabilir',
    stale: 'Fiyat güncellenmeli',
    quantity_mismatch: 'Miktar farklı',
    stock_unknown: 'Stok doğrulanmalı',
    minimum_basket_not_met: 'Minimum sepet tamamlanmalı',
  }[comparisonState];
  return {
    ...input,
    estimatedTotal: total,
    minimumBasket,
    minimumBasketMet,
    quantityMatch,
    stockKnown,
    fresh,
    comparisonState,
    comparisonLabel,
    eligibleForBestTotal: minimumBasketMet && quantityMatch && stockKnown && fresh,
    displayLabel: 'Tahmini toplam',
  };
}

export function rankQuotes(inputs = [], { now = Date.now() } = {}) {
  const normalized = inputs.map((input) => normalizeQuote(input, now));
  const eligible = normalized.filter((quote) => quote.eligibleForBestTotal).sort((a, b) => a.estimatedTotal - b.estimatedTotal);
  const best = eligible[0] || null;
  const quotes = [
    ...(best ? [best] : []),
    ...normalized.filter((quote) => quote !== best).sort((a, b) => a.estimatedTotal - b.estimatedTotal),
  ];
  return quotes.map((quote) => ({
    ...quote,
    displayLabel: best && quote === best ? 'En uygun toplam' : 'Tahmini toplam',
    differenceFromBest: best && quote.eligibleForBestTotal
      ? Number((quote.estimatedTotal - best.estimatedTotal).toFixed(2))
      : null,
    sponsorshipLabel: quote.isSponsored ? (quote.partnershipLabel || 'Sponsorlu') : null,
  }));
}

export function buildMarketRequest(input = {}) {
  const candidateIds = input?.candidateIds;
  const userConfirmed = input?.userConfirmed;
  if (userConfirmed !== true) throw Object.assign(new Error('Market teklifleri için alışveriş listesi onayı gerekir'), { status: 409 });
  if (!Array.isArray(candidateIds) || candidateIds.length === 0 || candidateIds.some((id) => typeof id !== 'string' || !id.trim()) || new Set(candidateIds).size !== candidateIds.length) {
    throw Object.assign(new Error('candidateIds boş olmayan ve benzersiz bir dizi olmalı'), { status: 422 });
  }
  return { candidateIds: [...candidateIds], userConfirmed: true };
}

export function buildMarketHandoff(input = {}) {
  const request = buildMarketRequest(input);
  const provider = typeof input.provider === 'string' ? input.provider.trim() : '';
  if (!marketProviders.includes(provider)) throw Object.assign(new Error('geçersiz market sağlayıcısı'), { status: 422 });
  return {
    schema_version: 1,
    provider,
    candidate_ids: request.candidateIds,
    action: 'open_partner',
    handoff_status: 'not_connected',
    available: false,
    partner_url: null,
    user_confirmed: true,
    disclosure: 'Market bağlantısı ve yönlendirme bu prototipte henüz açık değil.',
  };
}
