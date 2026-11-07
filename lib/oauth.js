/**
 * Yandex OAuth token handling.
 *
 * Sign-in itself lives in `device.js` (Device Flow); this module only owns the
 * token response shape, the expiry check, and the refresh call.
 *
 * @see https://yandex.ru/dev/id/doc/ru/concepts/ya-oauth-intro
 */

const TOKEN_URL = 'https://oauth.yandex.ru/token';
const TIMEOUT_MS = 15_000;
/** Refresh a little before the token actually dies. */
const REFRESH_MARGIN_MS = 60_000;

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
