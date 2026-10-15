/** Provider-neutral billing boundary; no checkout or payment method is connected. */

export const BILLING_SCHEMA_VERSION = 1;

const plans = [
  { id: 'free', label: 'Sofra ücretsiz', available: true, price_display: 'Ücretsiz', entitlements: ['core_recipes', 'pantry', 'fit_manual_profile'] },
  { id: 'plus', label: 'Sofra Plus', available: false, price_display: null, entitlements: ['advanced_ai', 'expanded_recipe_library', 'market_benefits'] },
];

export function buildBillingStatus() {
  return {
    schema_version: BILLING_SCHEMA_VERSION,
    current_plan: 'free',
    subscription_status: 'inactive',
    checkout: { available: false, provider: 'not_connected', live: false, confirmation_required: true },
    plans,
    entitlements: { advanced_ai: false, expanded_recipe_library: false, market_benefits: false },
    disclosure: 'Sofra Plus ve ödeme altyapısı bu prototipte aktif değildir; ücret veya ödeme bilgisi istenmez.',
  };
}
