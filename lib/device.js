/**
 * Yandex OAuth Device Flow.
 *
 * The confirmation-code flow needs a registered `redirect_uri`, and Yandex
 * refuses `https://oauth.yandex.ru/verification_code` for the Music client.
 * Device Flow has no redirect at all: Yandex shows a short user code, the user
 * types it at https://ya.ru/device, and the application polls for the token.
 *
 * Only a client registered by Yandex can reach the Music scopes, so the
 * official Music client credentials are the defaults here. They are published
 * in the open-source `yandex-music-api` library and are therefore not secret in
 * any meaningful sense — a personal OAuth application cannot request `music:*`
 * and always receives 30-second previews instead of full tracks.
 *
 * @see https://ym.marshal.dev/examples.device_auth/
 */

const OAUTH_BASE = 'https://oauth.yandex.ru';
const TIMEOUT_MS = 15_000;

/** Official Android Music client, as published by `yandex-music-api`. */
export const MUSIC_CLIENT_ID = '23cabbbdc6cd418abb4b39c32c41195d';
export const MUSIC_CLIENT_SECRET = '53bc75238f0c4d08a118e51fe9203300';
const DEFAULT_DEVICE_NAME = 'DSH NEXT';

/** POST a form body and parse JSON, whatever the status. */
async function postForm(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${OAUTH_BASE}${path}`, {
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
    return { status: response.status, body: parsed };
  } catch (error) {
    const timeout = new Error(error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'network');
    timeout.code = timeout.message;
    throw timeout;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ask Yandex for a user code.
 * @param options - Client id and device identity.
 * @returns The device-code document.
 */
export async function requestDeviceCode({ clientId, deviceId, deviceName }) {
  const { status, body } = await postForm('/device/code', {
    client_id: clientId,
    device_id: deviceId,
    device_name: deviceName === '' || deviceName === undefined ? DEFAULT_DEVICE_NAME : deviceName,
  });
  if (status !== 200 || body === null || typeof body.device_code !== 'string') {
    const error = new Error(typeof body?.error_description === 'string' ? body.error_description : `device-code-${status}`);
    error.code = typeof body?.error === 'string' ? body.error : 'device-code';
    throw error;
  }
  return {
    deviceCode: body.device_code,
    userCode: typeof body.user_code === 'string' ? body.user_code : '',
    verificationUrl: typeof body.verification_url === 'string' ? body.verification_url : 'https://ya.ru/device',
    expiresIn: typeof body.expires_in === 'number' ? body.expires_in : 300,
    interval: typeof body.interval === 'number' ? body.interval : 5,
  };
}

/**
 * Poll once. `authorization_pending` is a normal answer, not a failure.
 * @param options - Client credentials and the device code.
 * @returns `{ status: 'pending' }`, `{ status: 'token', token }`, or `{ status: 'error', code }`.
 */
export async function pollDeviceToken({ clientId, clientSecret, deviceCode }) {
  const body = {
    grant_type: 'device_code',
    code: deviceCode,
    client_id: clientId,
  };
  if (typeof clientSecret === 'string' && clientSecret !== '') body.client_secret = clientSecret;
  const { body: parsed } = await postForm('/token', body);
  if (parsed !== null && typeof parsed.access_token === 'string') {
    return { status: 'token', token: parsed };
  }
  const code = parsed !== null && typeof parsed.error === 'string' ? parsed.error : 'error';
  if (code === 'authorization_pending') return { status: 'pending' };
  return {
    status: 'error',
    code,
    message: parsed !== null && typeof parsed.error_description === 'string' ? parsed.error_description : code,
  };
}
