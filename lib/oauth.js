/**
 * Yandex OAuth 2.0 — confirmation-code flow with PKCE.
 *
 * The desktop app cannot receive a redirect, so the application is registered
 * with `https://oauth.yandex.ru/verification_code` as its Redirect URI: Yandex
 * shows a 7-digit code in the browser and the user types it into the app.
 * PKCE means no client secret has to be stored at all.
 *
 * @see https://yandex.ru/dev/id/doc/ru/codes/screen-code
 */

import { createHash, randomBytes } from 'node:crypto';

const AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize';
const TOKEN_URL = 'https://oauth.yandex.ru/token';
/** Registered Redirect URI for applications that show the code to the user. */
export const REDIRECT_URI = 'https://oauth.yandex.ru/verification_code';
const TIMEOUT_MS = 15_000;
/** Refresh a little before the token actually dies. */
const REFRESH_MARGIN_MS = 60_000;

/**
 * Build a PKCE verifier/challenge pair.
 * @returns `{ verifier, challenge }`, both base64url strings.
 */
export function createPkce() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/**
 * Compose the URL the user opens in a browser.
 * @param options - Application id, CSRF state, PKCE challenge and device identity.
 * @returns Absolute authorize URL.
 */
export function buildAuthorizeUrl({ clientId, state, challenge, deviceId, deviceName }) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  if (typeof state === 'string' && state !== '') url.searchParams.set('state', state);
  if (typeof challenge === 'string' && challenge !== '') {
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
  }
  if (typeof deviceId === 'string' && deviceId !== '') url.searchParams.set('device_id', deviceId);
  if (typeof deviceName === 'string' && deviceName !== '') url.searchParams.set('device_name', deviceName);
  url.searchParams.set('force_confirm', 'yes');
  return url.toString();
}

/** POST a form body to the token endpoint and normalize failures. */
async function postToken(body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams(body).toString(),
      signal: controller.signal,
    });
    const text = await response.text();
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
    if (parsed === null || typeof parsed.access_token !== 'string') {
      const code = parsed !== null && typeof parsed.error === 'string' ? parsed.error : `http-${response.status}`;
      const message = parsed !== null && typeof parsed.error_description === 'string'
        ? parsed.error_description
        : text.slice(0, 200);
      const error = new Error(message === '' ? code : message);
      error.code = code;
      throw error;
    }
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      const timeout = new Error('timeout');
      timeout.code = 'timeout';
      throw timeout;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Exchange the confirmation code for tokens.
 * @param options - Application credentials, the code, and the PKCE verifier.
 * @returns The token response.
 */
export function exchangeCode({ clientId, clientSecret, code, verifier, deviceId, deviceName }) {
  const body = { grant_type: 'authorization_code', code };
  if (clientId) body.client_id = clientId;
  if (clientSecret) body.client_secret = clientSecret;
  if (verifier) body.code_verifier = verifier;
  if (deviceId) body.device_id = deviceId;
  if (deviceName) body.device_name = deviceName;
  return postToken(body);
}

/**
 * Renew an expired access token.
 * @param options - Application credentials and the refresh token.
 * @returns The token response.
 */
export function refreshAccessToken({ clientId, clientSecret, refreshToken }) {
  const body = { grant_type: 'refresh_token', refresh_token: refreshToken };
  if (clientId) body.client_id = clientId;
  if (clientSecret) body.client_secret = clientSecret;
  return postToken(body);
}

/** Whether the stored access token is close enough to expiry to renew it. */
export function needsRefresh(auth) {
  if (typeof auth.accessToken !== 'string' || auth.accessToken === '') return false;
  if (typeof auth.refreshToken !== 'string' || auth.refreshToken === '') return false;
  const expiresAt = typeof auth.expiresAt === 'number' ? auth.expiresAt : 0;
  if (expiresAt === 0) return false;
  return Date.now() >= expiresAt - REFRESH_MARGIN_MS;
}

/** Turn a token response into the persisted fields. */
export function applyTokenResponse(auth, response) {
  const expiresIn = typeof response.expires_in === 'number' ? response.expires_in : 0;
  return {
    ...auth,
    accessToken: response.access_token,
    refreshToken: typeof response.refresh_token === 'string' && response.refresh_token !== ''
      ? response.refresh_token
      : auth.refreshToken,
    expiresAt: expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0,
    scope: typeof response.scope === 'string' ? response.scope : auth.scope,
  };
}
