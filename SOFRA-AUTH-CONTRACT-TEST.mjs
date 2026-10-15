import assert from 'node:assert/strict';
import { AUTH_SCHEMA_VERSION, buildAuthStatus, buildOAuthAuthorizationRequest, validateOAuthCallback } from './SOFRA-AUTH-V1.mjs';

const status = buildAuthStatus();
assert.equal(status.schema_version, AUTH_SCHEMA_VERSION);
assert.equal(status.session.provider, 'anonymous');
assert.equal(status.session.status, 'anonymous');
assert.equal(status.account_linking.available, false);
assert.equal(status.account_linking.requires_external_oauth, true);
assert.equal(status.account_linking.token_storage, 'not_enabled');
assert.equal(status.account_linking.pkce, 'required');
assert.equal(status.account_linking.callback_exchange, 'server_only');
assert.equal(status.account_linking.redirect_uri_allowlist, 'required');
assert.deepEqual(status.providers.map((provider) => provider.id), ['google', 'apple']);
assert.equal(status.data_rights.export_endpoint, '/v1/me/export');
assert.throws(() => buildAuthStatus({ provider: 'facebook' }), /sağlayıcısı/);
assert.throws(() => buildAuthStatus({ userId: '' }), /userId/);

const oauth = buildOAuthAuthorizationRequest({
  provider: 'google',
  clientId: 'google-client-id',
  redirectUri: 'sofra://auth/callback',
  allowedRedirectUris: ['sofra://auth/callback'],
  state: 's'.repeat(32),
  codeChallenge: 'c'.repeat(43),
});
const oauthUrl = new URL(oauth.url);
assert.equal(oauthUrl.searchParams.get('response_type'), 'code');
assert.equal(oauthUrl.searchParams.get('code_challenge_method'), 'S256');
assert.equal(oauth.pkce.verifier_storage, 'server_only');
assert.doesNotMatch(oauth.url, /client_secret|access_token|refresh_token/i);
assert.equal(validateOAuthCallback({ provider: 'google', code: 'one-time-code', state: 's'.repeat(32), expectedState: 's'.repeat(32) }).ok, true);
assert.equal(validateOAuthCallback({ provider: 'apple', error: 'access_denied' }).reason, 'provider_error');
assert.throws(() => buildOAuthAuthorizationRequest({ provider: 'google', clientId: 'x', redirectUri: 'https://evil.example/callback', allowedRedirectUris: ['sofra://auth/callback'], state: 's'.repeat(32), codeChallenge: 'c'.repeat(43) }), /allowlist/);
assert.throws(() => validateOAuthCallback({ provider: 'google', code: 'one-time-code', state: 'wrong', expectedState: 'right' }), /state/);

console.log('SOFRA_AUTH_CONTRACT_TEST_OK');
console.log('anonymous=ok oauthBoundary=pkce_state_server_only dataRights=linked');
