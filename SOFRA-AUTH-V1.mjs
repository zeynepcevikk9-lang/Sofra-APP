/** Provider-neutral account boundary; OAuth is intentionally not connected in the prototype. */

export const AUTH_SCHEMA_VERSION = 1;
export const AUTH_PROVIDERS = Object.freeze(['anonymous', 'google', 'apple']);
export const OAUTH_PROVIDERS = Object.freeze({
  google: Object.freeze({ authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth', response_mode: 'query', scopes: ['openid', 'email', 'profile'] }),
  apple: Object.freeze({ authorization_endpoint: 'https://appleid.apple.com/auth/authorize', response_mode: 'form_post', scopes: ['name', 'email'] }),
});

function authValidationError(message) { return Object.assign(new Error(message), { status: 422 }); }

function requireText(value, label, min = 1) {
  if (typeof value !== 'string' || value.length < min || value.length > 512) throw authValidationError(`${label} geçersiz`);
  return value;
}

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
      pkce: 'required',
      callback_exchange: 'server_only',
      redirect_uri_allowlist: 'required',
    },
    anonymous_usage: {
      device_only: true,
      cloud_sync: false,
      cross_device_sync: false,
      account_required_for_sync: true,
      prototype_usage_limit: 'not_enforced',
    },
    providers: [
      { id: 'google', status: 'not_connected', available: false },
      { id: 'apple', status: 'not_connected', available: false },
    ],
    data_rights: { export_endpoint: '/v1/me/export', delete_endpoint: '/v1/me/data' },
  };
}

/**
 * Builds an OAuth authorization request without opening a provider or handling tokens.
 * The caller must keep state/code_verifier server-side and provide an exact redirect allowlist.
 */
export function buildOAuthAuthorizationRequest({ provider, clientId, redirectUri, allowedRedirectUris = [], state, codeChallenge, scopes } = {}) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) throw authValidationError('geçersiz OAuth sağlayıcısı');
  requireText(clientId, 'clientId');
  requireText(redirectUri, 'redirectUri');
  if (!Array.isArray(allowedRedirectUris) || !allowedRedirectUris.includes(redirectUri)) throw authValidationError('redirectUri allowlist dışında');
  requireText(state, 'state', 32);
  requireText(codeChallenge, 'codeChallenge', 43);
  if (codeChallenge.length > 128) throw authValidationError('codeChallenge geçersiz');
  const selectedScopes = scopes ?? config.scopes;
  if (!Array.isArray(selectedScopes) || selectedScopes.length === 0 || selectedScopes.some((scope) => typeof scope !== 'string' || !/^[a-z][a-z0-9._:-]*$/i.test(scope))) throw authValidationError('scopes geçersiz');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    response_mode: config.response_mode,
    scope: selectedScopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return {
    provider,
    authorization_endpoint: config.authorization_endpoint,
    pkce: { method: 'S256', challenge_sent: true, verifier_storage: 'server_only' },
    url: `${config.authorization_endpoint}?${params.toString()}`,
  };
}

/** Validates the callback envelope; authorization-code exchange remains server-only. */
export function validateOAuthCallback({ provider, code, state, expectedState, error } = {}) {
  if (!OAUTH_PROVIDERS[provider]) throw authValidationError('geçersiz OAuth sağlayıcısı');
  if (error) return { ok: false, provider, reason: 'provider_error', token_exchange: 'server_only' };
  requireText(code, 'code');
  requireText(state, 'state');
  requireText(expectedState, 'expectedState');
  if (state !== expectedState) throw authValidationError('OAuth state eşleşmedi');
  return { ok: true, provider, authorization_code_present: true, token_exchange: 'server_only' };
}
