/**
 * Minimal Yandex client.
 *
 * Two different sources answer two different questions, and a token issued
 * without scopes can only answer the first one:
 *
 * - `login.yandex.ru/info` — who the token belongs to (id + login). Works with
 *   an empty scope list, which is the case for our confirmation-code flow.
 * - `api.music.yandex.net` — what the Music service allows. `/account/status`
 *   returns only region and permissions for such a token, never the identity,
 *   so it is a fallback rather than the primary source.
 *
 * Every call takes the access token explicitly, so nothing here can leak it
 * into a response body.
 */

const LOGIN_URL = 'https://login.yandex.ru/info?format=json';
const API_BASE = 'https://api.music.yandex.net';
const TIMEOUT_MS = 12_000;
const CLIENT_HEADER = 'YandexMusicDesktopAppWindows/5.42.0';

/** GET JSON with the OAuth header; `null` on any failure. */
async function getJson(url, accessToken, extraHeaders) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${accessToken}`,
        accept: 'application/json',
        'accept-language': 'ru',
        ...extraHeaders,
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve the account behind an access token from the Yandex ID endpoint.
 * @param accessToken - Yandex OAuth access token.
 * @returns `{ uid, login }`, or `null` when the token is rejected.
 */
export async function readIdentity(accessToken) {
  const body = await getJson(LOGIN_URL, accessToken);
  if (body === null || typeof body !== 'object') return null;
  const raw = body.id;
  const uid = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d+$/u.test(raw) ? Number(raw) : null;
  const login = typeof body.login === 'string' ? body.login : '';
  if (uid === null && login === '') return null;
  return { uid: Number.isFinite(uid) ? uid : null, login };
}

/**
 * Read what the Music service exposes for this account.
 * @param accessToken - Yandex OAuth access token.
 * @returns `{ uid, login, hasPlus, serviceAvailable }`, or `null` when rejected.
 */
export async function readAccount(accessToken) {
  const body = await getJson(`${API_BASE}/account/about`, accessToken, {
    'x-yandex-music-client': CLIENT_HEADER,
  });
  const result = body !== null && typeof body === 'object' ? body.result : null;
  if (result === null || typeof result !== 'object') return null;
  return {
    uid: null,
    login: '',
    hasPlus: result.hasPlus === true || result.hasMusicSubscription === true,
    serviceAvailable: result.serviceAvailable !== false,
  };
}
