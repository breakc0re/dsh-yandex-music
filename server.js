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
  needsRefresh,
  refreshAccessToken,
} from './lib/oauth.js';
import { MUSIC_CLIENT_ID, MUSIC_CLIENT_SECRET, pollDeviceToken, requestDeviceCode } from './lib/device.js';
import { addTrackToPlaylist, createPlaylist, listPlaylists, readPlaylist, setTrackLike } from './lib/playlists.js';
import { waveFeedback, waveTracks } from './lib/rotor.js';
import { publicStatus, readAuth, resolveDataDir, writeAuth } from './lib/store.js';
import { readAccount, readAlbum, readArtist, readIdentity, readLyrics, resolveTrackUrl, searchTracks } from './lib/yandex.js';
import { readLyricsExternal } from './lib/lyrics.js';

const PREFIX = '/api/plugins/yandex-music';
const ROUTE_KEY = Symbol.for('dsh.yandex-music.routes');
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
  /** flowId → { deviceCode, at, expiresIn } for the Device Flow. */
  const pendingFlows = new Map();

  /** Renew the access token when it is about to expire, and backfill identity. */
  async function freshAuth() {
    let auth = await readAuth(dir);
    if (needsRefresh(auth)) {
      try {
        const response = await refreshAccessToken({
          clientId: auth.clientId,
          clientSecret: auth.clientSecret,
          refreshToken: auth.refreshToken,
        });
        auth = await writeAuth(dir, applyTokenResponse(auth, response));
      } catch {
        // A dead refresh token means the user has to sign in again.
      }
    }
    // Tokens issued before the identity fix, and any account whose Music
    // response carried no uid, are repaired here instead of forcing a re-login.
    if (typeof auth.accessToken === 'string' && auth.accessToken !== '' && auth.login === '') {
      const identity = await readIdentity(auth.accessToken);
      if (identity !== null) {
        auth = await writeAuth(dir, { ...auth, uid: identity.uid, login: identity.login });
      }
    }
    return auth;
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
      // A token belongs to the application that issued it. Keeping it after the
      // client changed reported "authorized" while every request still used the
      // old token, so a client switch always starts from a clean sign-in.
      const sameClient = clientId === auth.clientId;
      const next = await writeAuth(dir, {
        ...auth,
        clientId,
        clientSecret: text(body.clientSecret, 200),
        ...sameClient ? {} : {
          accessToken: '',
          refreshToken: '',
          expiresAt: 0,
          scope: '',
          login: '',
          uid: null,
          plus: false,
        },
      });
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

    'auth/device/start': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const auth = await readAuth(dir);
      if (auth.clientId === '') return fail(response, 400, 'client-id', 'client_id is required');
      const deviceId = auth.deviceId !== '' ? auth.deviceId : randomUUID();
      if (deviceId !== auth.deviceId) await writeAuth(dir, { ...auth, deviceId });
      let code;
      try {
        code = await requestDeviceCode({ clientId: auth.clientId, deviceId, deviceName: 'DSH NEXT' });
      } catch (error) {
        return fail(response, 502, 'device-code', error instanceof Error ? error.message : 'device code failed');
      }
      const flowId = randomUUID();
      pendingFlows.set(flowId, { deviceCode: code.deviceCode, at: Date.now(), expiresIn: code.expiresIn });
      return sendJson(response, 200, {
        ok: true,
        value: {
          flowId,
          userCode: code.userCode,
          verificationUrl: code.verificationUrl,
          expiresIn: code.expiresIn,
          interval: code.interval,
        },
      });
    },

    'auth/device/poll': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const flow = pendingFlows.get(text(body.flowId, 64));
      if (flow === undefined) return fail(response, 400, 'flow', 'authorization session expired, start again');
      if (Date.now() - flow.at > flow.expiresIn * 1000) {
        pendingFlows.delete(text(body.flowId, 64));
        return fail(response, 408, 'expired', 'the code expired, start again');
      }
      const auth = await readAuth(dir);
      // The Music client's own secret is required for the device grant; PKCE does
      // not waive it. A personal application has to supply its own secret.
      const clientSecret = auth.clientSecret !== ''
        ? auth.clientSecret
        : auth.clientId === MUSIC_CLIENT_ID ? MUSIC_CLIENT_SECRET : '';
      const result = await pollDeviceToken({ clientId: auth.clientId, clientSecret, deviceCode: flow.deviceCode });
      if (result.status === 'pending') return sendJson(response, 200, { ok: true, value: { pending: true } });
      if (result.status === 'error') {
        pendingFlows.delete(text(body.flowId, 64));
        return fail(response, 400, result.code, result.message);
      }
      pendingFlows.delete(text(body.flowId, 64));
      let next = applyTokenResponse(auth, result.token);
      const [identity, account] = await Promise.all([
        readIdentity(next.accessToken),
        readAccount(next.accessToken),
      ]);
      if (identity !== null) next = { ...next, uid: identity.uid, login: identity.login };
      if (account !== null) next = { ...next, plus: account.hasPlus === true };
      next = await writeAuth(dir, next);
      return sendJson(response, 200, { ok: true, value: { pending: false, status: publicStatus(next) } });
    },

    'music/search': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const query = text(new URL(request.url ?? '/', 'http://127.0.0.1').searchParams.get('q') ?? '', 200);
      if (query === '') return fail(response, 400, 'query', 'query is required');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      const result = await searchTracks(auth.accessToken, query);
      if (result === null) return fail(response, 502, 'upstream', 'music search failed');
      return sendJson(response, 200, { ok: true, value: result });
    },

    'music/artist': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const id = text(new URL(request.url ?? '/', 'http://127.0.0.1').searchParams.get('id') ?? '', 32);
      if (!/^\d+$/u.test(id)) return fail(response, 400, 'id', 'artist id is required');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      const result = await readArtist(auth.accessToken, id);
      if (result === null) return fail(response, 502, 'upstream', 'artist is unavailable');
      return sendJson(response, 200, { ok: true, value: result });
    },

    'music/album': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const id = text(new URL(request.url ?? '/', 'http://127.0.0.1').searchParams.get('id') ?? '', 32);
      if (!/^\d+$/u.test(id)) return fail(response, 400, 'id', 'album id is required');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      const result = await readAlbum(auth.accessToken, id);
      if (result === null) return fail(response, 502, 'upstream', 'album is unavailable');
      return sendJson(response, 200, { ok: true, value: result });
    },

    'music/lyrics': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const params = new URL(request.url ?? '/', 'http://127.0.0.1').searchParams;
      const trackId = text(params.get('trackId') ?? '', 32);
      if (!/^\d+$/u.test(trackId)) return fail(response, 400, 'track', 'trackId is required');
      const title = text(params.get('title') ?? '', 200);
      const artist = text(params.get('artist') ?? '', 200);
      const durationRaw = Number(params.get('duration') ?? '');
      const durationMs = Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : 0;
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');

      // Both sources at once: Yandex knows the catalogue, LRCLIB knows the timing.
      const [inner, external] = await Promise.all([
        readLyrics(auth.accessToken, trackId),
        readLyricsExternal({ title, artist, durationMs }),
      ]);

      // A timed text is the only thing that can actually follow the song.
      if (external !== null && external.timed.length > 0) {
        return sendJson(response, 200, {
          ok: true,
          value: { available: true, source: 'lrclib', lines: external.lines, timed: external.timed },
        });
      }
      if (inner !== null && inner.available) {
        return sendJson(response, 200, {
          ok: true,
          value: { available: true, source: 'yandex', lines: inner.lines, timed: [] },
        });
      }
      if (external !== null && external.lines.length > 0) {
        return sendJson(response, 200, {
          ok: true,
          value: { available: true, source: 'lrclib', lines: external.lines, timed: [] },
        });
      }
      return sendJson(response, 200, { ok: true, value: { available: false, source: 'none', lines: [], timed: [] } });
    },

    'music/playlist/create': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const title = text(String(body.title ?? ''), 120);
      if (title === '') return fail(response, 400, 'title', 'title is required');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      if (typeof auth.uid !== 'number') return fail(response, 400, 'uid', 'account uid is unknown');
      const created = await createPlaylist(auth.accessToken, auth.uid, title);
      if (created === null) return fail(response, 502, 'upstream', 'playlist was not created');
      return sendJson(response, 200, { ok: true, value: created });
    },

    'music/playlist/insert': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const kind = Number(String(body.kind ?? ''));
      const trackId = text(String(body.trackId ?? ''), 32);
      if (!Number.isInteger(kind) || kind < 0) return fail(response, 400, 'kind', 'kind is required');
      if (!/^\d+$/u.test(trackId)) return fail(response, 400, 'track', 'trackId is required');
      const albumRaw = String(body.albumId ?? '');
      const albumId = /^\d+$/u.test(albumRaw) ? albumRaw : null;
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      if (typeof auth.uid !== 'number') return fail(response, 400, 'uid', 'account uid is unknown');
      const result = await addTrackToPlaylist(auth.accessToken, auth.uid, kind, trackId, albumId);
      if (result.ok !== true) return fail(response, 502, result.reason ?? 'change', 'the playlist rejected the change');
      return sendJson(response, 200, { ok: true, value: { revision: result.revision } });
    },
    'music/playlists': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      if (typeof auth.uid !== 'number') return fail(response, 400, 'uid', 'account uid is unknown');
      const result = await listPlaylists(auth.accessToken, auth.uid);
      if (result === null) return fail(response, 502, 'upstream', 'playlists are unavailable');
      return sendJson(response, 200, { ok: true, value: result });
    },

    'music/playlist': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const kind = Number(String(body.kind ?? ''));
      if (!Number.isInteger(kind) || kind < 0) return fail(response, 400, 'kind', 'kind is required');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      if (typeof auth.uid !== 'number') return fail(response, 400, 'uid', 'account uid is unknown');
      const result = await readPlaylist(auth.accessToken, auth.uid, kind);
      if (result === null) return fail(response, 502, 'upstream', 'playlist is unavailable');
      return sendJson(response, 200, { ok: true, value: result });
    },

    'music/like': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const trackId = text(String(body.trackId ?? ''), 32);
      if (!/^\d+$/u.test(trackId)) return fail(response, 400, 'track', 'trackId is required');
      const albumRaw = String(body.albumId ?? '');
      const albumId = /^\d+$/u.test(albumRaw) ? albumRaw : null;
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      if (typeof auth.uid !== 'number') return fail(response, 400, 'uid', 'account uid is unknown');
      const result = await setTrackLike(auth.accessToken, auth.uid, trackId, albumId, body.liked === true);
      if (result.ok !== true) return fail(response, 502, 'like', 'like was rejected');
      return sendJson(response, 200, { ok: true, value: { liked: body.liked === true } });
    },

    'music/wave': async (request, response) => {
      if (request.method !== 'GET') return fail(response, 405, 'method', 'GET only');
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      const result = await waveTracks(auth.accessToken, typeof auth.uid === 'number' ? auth.uid : 0);
      if (result === null) return fail(response, 502, 'upstream', 'wave is unavailable');
      return sendJson(response, 200, { ok: true, value: result });
    },

    'music/wave/feedback': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      const result = await waveFeedback(auth.accessToken, text(String(body.station ?? 'user:onyourwave'), 64), {
        type: text(String(body.type ?? ''), 32),
        trackId: text(String(body.trackId ?? ''), 64),
        ...text(String(body.batchId ?? ''), 128) === '' ? {} : { batchId: text(String(body.batchId ?? ''), 128) },
        ...typeof body.totalPlayedSeconds === 'number' ? { totalPlayedSeconds: body.totalPlayedSeconds } : {},
      });
      if (result.ok !== true) return fail(response, 502, 'feedback', 'feedback rejected');
      return sendJson(response, 200, { ok: true, value: { ok: true } });
    },

    'music/track-url': async (request, response) => {
      if (request.method !== 'POST') return fail(response, 405, 'method', 'POST only');
      const body = await readJsonBody(request);
      const trackId = text(String(body.trackId ?? ''), 32);
      if (!/^\d+$/u.test(trackId)) return fail(response, 400, 'track', 'trackId is required');
      const albumRaw = String(body.albumId ?? '');
      const albumId = /^\d+$/u.test(albumRaw) ? albumRaw : null;
      const auth = await freshAuth();
      if (auth.accessToken === '') return fail(response, 401, 'unauthorized', 'sign in first');
      const result = await resolveTrackUrl(auth.accessToken, trackId, albumId);
      if (result.error === 'no-rights') {
        return fail(response, 409, 'no-rights', 'этот трек недоступен для прослушивания на аккаунте');
      }
      if (result.error !== undefined) return fail(response, 502, result.error, 'track is not playable');
      return sendJson(response, 200, { ok: true, value: result });
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
