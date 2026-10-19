import { randomBytes } from 'node:crypto';
import { buildOAuthAuthorizationRequest, OAUTH_PROVIDERS } from './SOFRA-AUTH-V1.mjs';

export const AUTH_TRANSACTION_SCHEMA_VERSION = 1;
export const AUTH_TRANSACTION_TTL_SECONDS = 600;

function authTransactionError(message) {
  return Object.assign(new Error(message), { status: 422 });
}

function requireText(value, label, min = 1) {
  if (typeof value !== 'string' || value.length < min || value.length > 512) throw authTransactionError(label + ' gecersiz');
  return value;
}

export function createOAuthTransactionStore({ now = () => Date.now(), stateFactory = () => randomBytes(32).toString('base64url') } = {}) {
  const transactions = new Map();
  return {
    issue({ provider, clientId, redirectUri, allowedRedirectUris, codeChallenge, scopes } = {}) {
      if (!OAUTH_PROVIDERS[provider]) throw authTransactionError('gecersiz OAuth saglayicisi');
      requireText(clientId, 'clientId');
      requireText(redirectUri, 'redirectUri');
      requireText(codeChallenge, 'codeChallenge', 43);
      if (!Array.isArray(allowedRedirectUris)) throw authTransactionError('redirectUri allowlist gerekli');
      const state = requireText(stateFactory(), 'state', 32);
      const issuedAt = now();
      const expiresAt = issuedAt + AUTH_TRANSACTION_TTL_SECONDS * 1000;
      const authorization = buildOAuthAuthorizationRequest({ provider, clientId, redirectUri, allowedRedirectUris, state, codeChallenge, scopes });
      transactions.set(state, { provider, redirectUri, issuedAt, expiresAt });
      return {
        schema_version: AUTH_TRANSACTION_SCHEMA_VERSION,
        status: 'authorization_ready',
        provider,
        expires_at: new Date(expiresAt).toISOString(),
        transaction_storage: 'server_only',
        authorization,
      };
    },
    consume({ provider, state } = {}) {
      requireText(state, 'state', 32);
      const transaction = transactions.get(state);
      if (!transaction || transaction.provider !== provider) throw authTransactionError('OAuth state bulunamadi');
      transactions.delete(state);
      if (now() > transaction.expiresAt) throw authTransactionError('OAuth state suresi doldu');
      return { ...transaction, state };
    },
    size() { return transactions.size; },
  };
}

export function buildOAuthCallbackResult({ transaction, code, error } = {}) {
  if (!transaction || typeof transaction !== 'object') throw authTransactionError('OAuth islemi gerekli');
  if (error) return { schema_version: AUTH_TRANSACTION_SCHEMA_VERSION, status: 'provider_error', provider: transaction.provider, token_exchange: 'server_only' };
  requireText(code, 'code');
  return {
    schema_version: AUTH_TRANSACTION_SCHEMA_VERSION,
    status: 'token_exchange_required',
    provider: transaction.provider,
    authorization_code_present: true,
    token_exchange: 'server_only',
    session: null,
  };
}
