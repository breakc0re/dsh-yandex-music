/**
 * Host half of the Yandex Music player.
 *
 * Owns the OAuth confirmation-code flow and the token store. The browser half
 * never receives a token: it asks for an authorize URL, submits the 7-digit
 * code, and reads a status projection.
 *
 * @see https://yandex.ru/dev/id/doc/ru/codes/screen-code
 */

import { randomUUID } from 'node:crypto';
import {
  applyTokenResponse,
  buildAuthorizeUrl,
  createPkce,
  exchangeCode,
  needsRefresh,
  refreshAccessToken,
} from './lib/oauth.js';
import { publicStatus, readAuth, resolveDataDir, writeAuth } from './lib/store.js';
import { readAccount } from './lib/yandex.js';

const PREFIX = '/api/plugins/yandex-music';
const ROUTE_KEY = Symbol.for('dsh.yandex-music.routes');
/** A confirmation code lives 10 minutes; drop pending PKCE state after that. */
const PENDING_TTL_MS = 10 * 60_000;
const MAX_BODY_BYTES = 8 * 1024;

export const inject = ['webServer'];

function sendJson(response, status, body) {
  const text = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(text),
  });
  response.end(text);
}

function fail(response, status, code, message) {
  sendJson(response, status, { ok: false, error: { code, message } });
}

/** Read a small JSON body; anything larger or malformed is a client error. */
async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('body too large');
      error.code = 'body';
      throw error;
    }
    chunks.push(chunk);
  }
  if (size === 0) return {};
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return parsed !== null && typeof parsed === 'object' ? parsed : {};
  } catch {
    const error = new Error('invalid json');
    error.code = 'body';
    throw error;
  }
}

function text(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function apply(ctx) {
  const dir = resolveDataDir(ctx);
  /** state → { verifier, at }; in-memory only, so a restart just asks again. */
  const pending = new Map();

  const prunePending = () => {
    const now = Date.now();
    for (const [key, value] of pending) {
      if (now - value.at > PENDING_TTL_MS) pending.delete(key);
    }
  };

  /** Renew the access token when it is about to expire. */
  async function freshAuth() {
    const auth = await readAuth(dir);
    if (!needsRefresh(auth)) return auth;
    try {
      const response = await refreshAccessToken({
        clientId: auth.clientId,
        clientSecret: auth.clientSecret,
        refreshToken: auth.refreshToken,
      });
      return await writeAuth(dir, applyTokenResponse(auth, response));
    } catch {
      // A dead refresh token means the user has to sign in again.
      return auth;
    }
  }

  const handlers = {
    'auth/status': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const auth = await freshAuth();
      return sendJson(response, 200, { ok: true, value: publicStatus(auth) });
    },

    'auth/config': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const clientId = text(body.clientId, 200);
      if (clientId === '') return fail(response, 400, 'client-id', 'client_id is required');
      const auth = await readAuth(dir);
      const next = await writeAuth(dir, {
        ...auth,
        clientId,
        clientSecret: text(body.clientSecret, 200),
      });
      return sendJson(response, 200, { ok: true, value: publicStatus(next) });
    },

    'auth/start': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      prunePending();
      const auth = await readAuth(dir);
      if (auth.clientId === '') return fail(response, 400, 'client-id', 'client_id is required');
      const deviceId = auth.deviceId !== '' ? auth.deviceId : randomUUID();
      if (deviceId !== auth.deviceId) await writeAuth(dir, { ...auth, deviceId });
      const { verifier, challenge } = createPkce();
      const state = randomUUID();
      pending.set(state, { verifier, at: Date.now() });
      const url = buildAuthorizeUrl({
        clientId: auth.clientId,
        state,
        challenge,
        deviceId,
        deviceName: 'DSH NEXT',
      });
      return sendJson(response, 200, { ok: true, value: { url, state } });
    },

    'auth/complete': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      // Two shapes are valid here: the 7-digit code Yandex shows on the
      // verification_code page, and the longer alphanumeric `code` from a
      // redirect URL when the application registered a real Redirect URI.
      const code = text(body.code, 512).replace(/\s+/gu, '');
      if (!/^[A-Za-z0-9._~-]{4,512}$/u.test(code)) {
        return fail(response, 400, 'code', 'confirmation code is missing or malformed');
      }
      const state = text(body.state, 64);
      const entry = pending.get(state);
      if (entry === undefined) return fail(response, 400, 'state', 'authorization session expired, start again');
      pending.delete(state);
      const auth = await readAuth(dir);
      let response2;
      try {
        response2 = await exchangeCode({
          clientId: auth.clientId,
          clientSecret: auth.clientSecret,
          code,
          verifier: entry.verifier,
          deviceId: auth.deviceId,
          deviceName: 'DSH NEXT',
        });
      } catch (error) {
        const code2 = typeof error?.code === 'string' ? error.code : 'exchange';
        return fail(response, 400, code2, error instanceof Error ? error.message : 'token exchange failed');
      }
      let next = applyTokenResponse(auth, response2);
      const account = await readAccount(next.accessToken);
      if (account !== null) {
        next = { ...next, uid: account.uid, login: account.login !== '' ? account.login : account.displayName };
      }
      next = await writeAuth(dir, next);
      return sendJson(response, 200, { ok: true, value: publicStatus(next) });
    },

    'auth/logout': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const auth = await readAuth(dir);
      const next = await writeAuth(dir, {
        ...auth,
        accessToken: '',
        refreshToken: '',
        expiresAt: 0,
        scope: '',
        login: '',
        uid: null,
      });
      return sendJson(response, 200, { ok: true, value: publicStatus(next) });
    },
  };

  ctx.effect(() => {
    // HMR can re-apply the plugin before the previous effect is torn down.
    const previous = globalThis[ROUTE_KEY];
    if (Array.isArray(previous)) {
      for (const dispose of previous) {
        try {
          dispose();
        } catch {
          /* route was already disposed */
        }
      }
    }

    const disposers = [];
    for (const [name, handler] of Object.entries(handlers)) {
      disposers.push(ctx.webServer.register({
        kind: 'exact',
        path: `${PREFIX}/${name}`,
        handler: async (request, response) => {
          try {
            await handler(request, response);
          } catch (error) {
            if (error?.code === 'body') {
              fail(response, 400, 'body', 'invalid request body');
              return;
            }
            ctx.logger?.warn?.(`yandex-music: ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
            fail(response, 500, 'internal', 'internal error');
          }
        },
      }));
    }
    globalThis[ROUTE_KEY] = disposers;

    return () => {
      if (globalThis[ROUTE_KEY] === disposers) delete globalThis[ROUTE_KEY];
      for (const dispose of disposers) {
        try {
          dispose();
        } catch {
          /* route was already disposed */
        }
      }
    };
  }, 'yandex-music: auth routes');
}
