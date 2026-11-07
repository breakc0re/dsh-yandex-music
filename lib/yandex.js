/**
 * Minimal Yandex Music API client.
 *
 * Only the account probe lives here for now; search, playlists and the rotor
 * arrive with the player stories. Every call takes the access token explicitly
 * so nothing in this module can leak it into a response body.
 */

const API_BASE = 'https://api.music.yandex.net';
const TIMEOUT_MS = 12_000;

/**
 * Read the account behind an access token.
 * @param accessToken - Yandex OAuth access token.
 * @returns `{ uid, login, displayName }`, or `null` when the token is rejected.
 */
export async function readAccount(accessToken) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/account/status`, {
      method: 'GET',
      headers: {
        authorization: `OAuth ${accessToken}`,
        accept: 'application/json',
        'accept-language': 'ru',
        'x-yandex-music-client': 'YandexMusicDesktopAppWindows/5.42.0',
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const body = await response.json();
    const account = body?.result?.account;
    if (account === null || typeof account !== 'object') return null;
    return {
      uid: typeof account.uid === 'number' ? account.uid : null,
      login: typeof account.login === 'string' ? account.login : '',
      displayName: typeof account.displayName === 'string' ? account.displayName : '',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
