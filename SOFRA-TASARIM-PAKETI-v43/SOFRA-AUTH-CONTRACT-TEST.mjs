import assert from 'node:assert/strict';
import { AUTH_SCHEMA_VERSION, buildAuthStatus } from './SOFRA-AUTH-V1.mjs';

const status = buildAuthStatus();
assert.equal(status.schema_version, AUTH_SCHEMA_VERSION);
assert.equal(status.session.provider, 'anonymous');
assert.equal(status.session.status, 'anonymous');
assert.equal(status.account_linking.available, false);
assert.equal(status.account_linking.requires_external_oauth, true);
assert.equal(status.account_linking.token_storage, 'not_enabled');
assert.deepEqual(status.providers.map((provider) => provider.id), ['google', 'apple']);
assert.equal(status.data_rights.export_endpoint, '/v1/me/export');
assert.throws(() => buildAuthStatus({ provider: 'facebook' }), /sağlayıcısı/);
assert.throws(() => buildAuthStatus({ userId: '' }), /userId/);

console.log('SOFRA_AUTH_CONTRACT_TEST_OK');
console.log('anonymous=ok oauthBoundary=explicit dataRights=linked');
