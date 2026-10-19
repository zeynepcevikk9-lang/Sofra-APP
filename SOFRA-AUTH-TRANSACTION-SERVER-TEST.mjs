import assert from 'node:assert/strict';
import { createSofraServer } from './SOFRA-API-SERVER.mjs';

const configured = createSofraServer({
  oauthConfig: {
    clientIds: { google: 'google-client-id', apple: 'apple-client-id' },
    allowedRedirectUris: ['sofra://auth/callback'],
  },
});
await new Promise((resolve) => configured.server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + configured.server.address().port;
const request = async (path, options = {}) => {
  const response = await fetch(base + path, { headers: { 'content-type': 'application/json' }, ...options });
  return { response, body: await response.json() };
};

try {
  let result = await request('/v1/auth/authorize', { method: 'POST', body: JSON.stringify({ provider: 'google', redirect_uri: 'sofra://auth/callback', code_challenge: 'c'.repeat(43) }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.transaction_storage, 'server_only');
  const state = new URL(result.body.authorization.url).searchParams.get('state');
  assert.ok(state && state.length >= 32);
  assert.equal(new URL(result.body.authorization.url).searchParams.get('redirect_uri'), 'sofra://auth/callback');

  result = await request('/v1/auth/callback', { method: 'POST', body: JSON.stringify({ provider: 'google', state, code: 'one-time-code' }) });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.status, 'token_exchange_required');
  assert.equal(result.body.session, null);
  assert.doesNotMatch(JSON.stringify(result.body), /access_token|refresh_token|client_secret/i);

  result = await request('/v1/auth/callback', { method: 'POST', body: JSON.stringify({ provider: 'google', state, code: 'replay' }) });
  assert.equal(result.response.status, 422);
  result = await request('/v1/auth/authorize', { method: 'POST', body: JSON.stringify({ provider: 'google', redirect_uri: 'https://evil.example/callback', code_challenge: 'c'.repeat(43) }) });
  assert.equal(result.response.status, 422);

  result = await request('/v1/auth/authorize', { method: 'POST', body: JSON.stringify({ provider: 'apple', redirect_uri: 'sofra://auth/callback', code_challenge: 'd'.repeat(43) }) });
  const appleState = new URL(result.body.authorization.url).searchParams.get('state');
  result = await request('/v1/auth/callback', { method: 'POST', body: JSON.stringify({ provider: 'apple', state: appleState, error: 'access_denied' }) });
  assert.equal(result.body.status, 'provider_error');
} finally {
  await new Promise((resolve) => configured.server.close(resolve));
}

const unconfigured = createSofraServer();
await new Promise((resolve) => unconfigured.server.listen(0, '127.0.0.1', resolve));
try {
  const response = await fetch('http://127.0.0.1:' + unconfigured.server.address().port + '/v1/auth/authorize', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ provider: 'google', redirect_uri: 'sofra://auth/callback', code_challenge: 'c'.repeat(43) }),
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'auth_not_configured');
} finally {
  await new Promise((resolve) => unconfigured.server.close(resolve));
}

console.log('SOFRA_AUTH_TRANSACTION_SERVER_TEST_OK');
