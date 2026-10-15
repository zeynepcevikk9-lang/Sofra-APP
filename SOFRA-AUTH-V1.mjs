/** Provider-neutral account boundary; OAuth is intentionally not connected in the prototype. */

export const AUTH_SCHEMA_VERSION = 1;
export const AUTH_PROVIDERS = Object.freeze(['anonymous', 'google', 'apple']);

export function buildAuthStatus({ provider = 'anonymous', userId = 'usr_anonymous_demo' } = {}) {
  if (!AUTH_PROVIDERS.includes(provider)) throw new Error('geçersiz hesap sağlayıcısı');
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('userId zorunlu');
  return {
    schema_version: AUTH_SCHEMA_VERSION,
    session: { user_id: userId, provider, status: provider === 'anonymous' ? 'anonymous' : 'not_connected' },
    account_linking: {
      available: false,
      requires_external_oauth: true,
      token_storage: 'not_enabled',
      confirmation_required: true,
    },
    providers: [
      { id: 'google', status: 'not_connected', available: false },
      { id: 'apple', status: 'not_connected', available: false },
    ],
    data_rights: { export_endpoint: '/v1/me/export', delete_endpoint: '/v1/me/data' },
  };
}
