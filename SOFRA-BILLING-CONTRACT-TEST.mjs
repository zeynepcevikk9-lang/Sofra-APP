import assert from 'node:assert/strict';
import { BILLING_SCHEMA_VERSION, buildBillingStatus } from './SOFRA-BILLING-V1.mjs';

const status = buildBillingStatus();
assert.equal(status.schema_version, BILLING_SCHEMA_VERSION);
assert.equal(status.current_plan, 'free');
assert.equal(status.subscription_status, 'inactive');
assert.equal(status.checkout.available, false);
assert.equal(status.checkout.live, false);
assert.equal(status.checkout.provider, 'not_connected');
assert.equal(status.entitlements.advanced_ai, false);
assert.equal(status.plans.find((plan) => plan.id === 'plus')?.available, false);
assert.match(status.disclosure, /ödeme bilgisi istenmez/);

console.log('SOFRA_BILLING_CONTRACT_TEST_OK');
console.log('free=active plus=inactive checkout=not_connected financialSideEffect=none');
