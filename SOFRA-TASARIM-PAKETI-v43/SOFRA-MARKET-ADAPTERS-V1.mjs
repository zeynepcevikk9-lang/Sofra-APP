/** Provider adapters for future live retailer integrations. */
import { marketProviders, normalizeQuote } from './SOFRA-MARKET-V1.mjs';

const forbiddenFields = ['health', 'health_summary', 'fit_profile', 'activeCalories', 'steps', 'weightKg', 'calories'];

function validationError(message) { return Object.assign(new Error(message), { status: 422 }); }

function rejectSensitiveFields(payload) {
  const keys = Object.keys(payload);
  const forbidden = keys.find((key) => forbiddenFields.some((field) => key.toLocaleLowerCase('en-US').includes(field.toLocaleLowerCase('en-US'))));
  if (forbidden) throw validationError(`market teklifinde sağlık alanı olamaz: ${forbidden}`);
}

function adaptQuote(provider, payload = {}, now = Date.now()) {
  if (!marketProviders.includes(provider)) throw validationError('geçersiz market sağlayıcısı');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw validationError('geçersiz market teklifi');
  rejectSensitiveFields(payload);
  return normalizeQuote({
    ...payload,
    provider,
    retailer: payload.retailer || payload.provider || provider,
    subtotal: payload.subtotal ?? payload.sub_total ?? 0,
    deliveryFee: payload.deliveryFee ?? payload.delivery_fee ?? 0,
    mandatoryFees: payload.mandatoryFees ?? payload.mandatory_fees ?? 0,
    minimumBasket: payload.minimumBasket ?? payload.minimum_basket ?? null,
    quantityMatch: payload.quantityMatch ?? payload.quantity_match,
    stockState: payload.stockState ?? payload.stock_state,
    deliveryEtaMinutes: payload.deliveryEtaMinutes ?? payload.delivery_eta_minutes ?? null,
    singleStore: payload.singleStore ?? payload.single_store ?? false,
    updatedAt: payload.updatedAt ?? payload.updated_at,
    isSponsored: payload.isSponsored ?? payload.is_sponsored ?? false,
    partnershipLabel: payload.partnershipLabel ?? payload.partnership_label ?? null,
    source: payload.source || 'partner',
    adapterVersion: 'provider-adapter-v1',
  }, now);
}

export function adaptCarrefourSAQuote(payload = {}, options = {}) { return adaptQuote('CarrefourSA', payload, options.now); }
export function adaptGetirQuote(payload = {}, options = {}) { return adaptQuote('Getir', payload, options.now); }
export function adaptMigrosQuote(payload = {}, options = {}) { return adaptQuote('Migros', payload, options.now); }

export function adaptRetailerQuote(provider, payload = {}, options = {}) {
  return adaptQuote(provider, payload, options.now);
}

