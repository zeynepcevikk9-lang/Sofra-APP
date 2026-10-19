import assert from 'node:assert/strict';
import { buildOAuthCallbackResult, createOAuthTransactionStore } from './SOFRA-AUTH-TRANSACTION-V1.mjs';

let now = Date.parse('2026-10-19T10:00:00Z');
const store = createOAuthTransactionStore({ now: () => now, stateFactory: () => 's'.repeat(43) });
const start = store.issue({
  provider: 'google',
  clientId: 'google-client-id',
  redirectUri: 'sofra://auth/callback',
  allowedRedirectUris: ['sofra://auth/callback'],
  codeChallenge: 'c'.repeat(43),
});
assert.equal(start.status, 'authorization_ready');
assert.equal(start.transaction_storage, 'server_only');
assert.equal(new URL(start.authorization.url).searchParams.get('code_challenge_method'), 'S256');
assert.doesNotMatch(start.authorization.url, /client_secret|access_token|refresh_token/i);
assert.equal(store.size(), 1);

const state = new URL(start.authorization.url).searchParams.get('state');
const transaction = store.consume({ provider: 'google', state });
const callback = buildOAuthCallbackResult({ transaction, code: 'one-time-code' });
assert.equal(callback.status, 'token_exchange_required');
assert.equal(callback.token_exchange, 'server_only');
assert.equal(callback.session, null);
assert.throws(() => store.consume({ provider: 'google', state }), /bulunamadi/);

store.issue({ provider: 'apple', clientId: 'apple-client-id', redirectUri: 'sofra://auth/callback', allowedRedirectUris: ['sofra://auth/callback'], codeChallenge: 'd'.repeat(43) });
const expiredState = new URL(store.issue({ provider: 'google', clientId: 'google-client-id', redirectUri: 'sofra://auth/callback', allowedRedirectUris: ['sofra://auth/callback'], codeChallenge: 'e'.repeat(43) }).authorization.url).searchParams.get('state');
now += 601000;
assert.throws(() => store.consume({ provider: 'google', state: expiredState }), /suresi/);
assert.throws(() => store.issue({ provider: 'google', clientId: 'google-client-id', redirectUri: 'https://evil.example/callback', allowedRedirectUris: ['sofra://auth/callback'], codeChallenge: 'c'.repeat(43) }), /allowlist/);

console.log('SOFRA_AUTH_TRANSACTION_CONTRACT_TEST_OK');
