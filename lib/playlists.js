/**
 * Playlists and track likes for the sidebar player.
 *
 * Everything here is read with the OAuth token passed in by the caller, so a
 * token never shows up in a response body or a log line.
 *
 * Three facts about the live API are worth knowing before changing this file:
 *
 * - `GET /users/{uid}/playlists/list` only reports playlists the account owns.
 *   An account that never created one answers `{ result: [] }` even though its
 *   "Мне нравится" playlist exists and can be read by kind (kind 3).
 * - A playlist's `tracks` is an array of wrappers `{ id, track, ... }`; the
 *   playable object is embedded as `track`, and its own `id` is a string while
 *   the wrapper's `id` is a number. We normalize both to a number so ids
 *   compare strictly with search results, whose ids are numeric.
 * - Removing a like is `POST .../likes/tracks/remove`, not `remove-multiple`:
 *   `remove-multiple` answers 404 "Requested action ... was not found".
 */

const API_BASE = 'https://api.music.yandex.net';
const TIMEOUT_MS = 12_000;
const CLIENT_HEADER = 'YandexMusicDesktopAppWindows/5.42.0';

/**
 * One request against the Music API.
 * @param accessToken - Yandex OAuth access token.
 * @param path - Path below the API root, already URL-encoded.
 * @param init - Extra fetch options (method, body, headers).
 * @returns `{ status, ok, body }`; `status` is `0` for a network failure and
 *   `body` is `null` when the response carried no JSON.
 */
async function request(accessToken, path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        authorization: `OAuth ${accessToken}`,
        accept: 'application/json',
        'accept-language': 'ru',
        'x-yandex-music-client': CLIENT_HEADER,
        ...init.headers,
      },
      signal: controller.signal,
    });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { status: response.status, ok: response.ok, body };
  } catch {
    return { status: 0, ok: false, body: null };
  } finally {
    clearTimeout(timer);
  }
}

/** Coerce an API id to a number; `null` when it is not a positive integer. */
function numericId(value) {
  const id = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/u.test(value) ? Number(value) : NaN;
  return Number.isFinite(id) ? id : null;
}

/**
 * Yandex cover URIs carry a `%%` placeholder for the size, and usually no
 * scheme. The size is substituted, not appended, so `?version` suffixes keep
 * working.
 */
function coverUrl(uri, size) {
  if (typeof uri !== 'string' || uri === '') return null;
  const sized = uri.replace('%%', size);
  if (/^https?:\/\//u.test(sized)) return sized;
  return sized.startsWith('//') ? `https:${sized}` : `https://${sized}`;
}

/** Flatten one API track into the shape the popover renders. */
function toTrack(raw, fallbackId) {
  if (raw === null || typeof raw !== 'object') return null;
  const id = numericId(raw.id) ?? numericId(raw.realId) ?? numericId(fallbackId);
  if (id === null) return null;
  const albums = Array.isArray(raw.albums) ? raw.albums : [];
  const artists = Array.isArray(raw.artists) ? raw.artists : [];
  const album = albums[0] !== null && typeof albums[0] === 'object' ? albums[0] : null;
  return {
    id,
    albumId: album === null ? null : numericId(album.id),
    title: typeof raw.title === 'string' ? raw.title : '',
    artists: artists
      .map((artist) => (artist !== null && typeof artist.name === 'string' ? artist.name : ''))
      .filter(Boolean)
      .join(', '),
    durationMs: typeof raw.durationMs === 'number' ? raw.durationMs : 0,
    cover: coverUrl(album !== null && typeof album.coverUri === 'string' ? album.coverUri : raw.coverUri, '200x200'),
    explicit: raw.explicit === true || (typeof raw.contentWarning === 'string' && raw.contentWarning === 'explicit'),
  };
}

/** Flatten one playlist list row into the shape the popover renders. */
function toPlaylist(raw) {
  if (raw === null || typeof raw !== 'object') return null;
  const kind = numericId(raw.kind);
  if (kind === null) return null;
  const owner = raw.owner !== null && typeof raw.owner === 'object' ? raw.owner : null;
  const ownerName =
    owner !== null && typeof owner.name === 'string' && owner.name !== ''
      ? owner.name
      : owner !== null && typeof owner.login === 'string'
        ? owner.login
        : '';
  return {
    kind,
    title: typeof raw.title === 'string' ? raw.title : '',
    trackCount: typeof raw.trackCount === 'number' ? raw.trackCount : 0,
    owner: ownerName,
    cover: coverUrl(raw.cover?.uri ?? raw.coverUri, '400x400'),
  };
}

/**
 * List the playlists owned by an account.
 *
 * `GET /users/{uid}/playlists/list` returns a bare `{ result: [...] }` array
 * without the `tracks` arrays; entries are already the full playlist objects
 * (owner, kind, title, trackCount, cover). The likes playlist is not part of
 * this list, so an account with no playlists of its own gets `{ playlists: [] }`.
 *
 * @param accessToken - Yandex OAuth access token.
 * @param uid - Account uid the token belongs to.
 * @returns `{ playlists: [{ kind, title, trackCount, owner, cover }] }`, where
 *   `owner` is the display name and `cover` a 400x400 https URL or `null`;
 *   `null` when the request failed.
 */
export async function listPlaylists(accessToken, uid) {
  const { body } = await request(accessToken, `/users/${encodeURIComponent(uid)}/playlists/list`);
  const rows = body !== null && typeof body === 'object' && Array.isArray(body.result) ? body.result : null;
  if (rows === null) return null;
  return { playlists: rows.map(toPlaylist).filter((playlist) => playlist !== null) };
}

/**
 * Read one playlist's tracks.
 *
 * `GET /users/{uid}/playlists/{kind}` answers `{ result: { ..., tracks } }`.
 * Each entry of `tracks` is a wrapper `{ id, track, originalIndex, timestamp }`,
 * and a wrapper may carry a `track: null` for an unavailable row; such rows are
 * skipped, as are tracks without any usable id.
 *
 * @param accessToken - Yandex OAuth access token.
 * @param uid - Account uid the playlist belongs to.
 * @param kind - Playlist kind (numeric id inside the account, e.g. `3` for likes).
 * @returns `{ tracks: [{ id, albumId, title, artists, durationMs, cover, explicit }] }`
 *   with numeric ids, `artists` as `"A, B"`, `cover` a 200x200 https URL or
 *   `null`; `null` when the request failed or the playlist is missing.
 */
export async function readPlaylist(accessToken, uid, kind) {
  const { body } = await request(
    accessToken,
    `/users/${encodeURIComponent(uid)}/playlists/${encodeURIComponent(kind)}`,
  );
  const playlist = body !== null && typeof body === 'object' ? body.result : null;
  if (playlist === null || typeof playlist !== 'object') return null;
  const rows = Array.isArray(playlist.tracks) ? playlist.tracks : null;
  if (rows === null) return null;
  const tracks = rows
    .map((row) => {
      if (row === null || typeof row !== 'object') return null;
      const raw = row.track !== null && typeof row.track === 'object' ? row.track : row;
      return toTrack(raw, row.id);
    })
    .filter((track) => track !== null);
  return { tracks };
}

/**
 * Add or remove one track from the account's likes.
 *
 * Adding uses `POST /users/{uid}/likes/tracks/add-multiple`, removing uses
 * `POST /users/{uid}/likes/tracks/remove` — the live API has no
 * `remove-multiple` action and answers 404 for it. Both take a form body with
 * `track-ids=<trackId>:<albumId>`; a track without an album is sent as
 * `<trackId>` alone. Both answer `{ result: { revision } }` and the call is
 * idempotent, so re-liking a liked track still succeeds.
 *
 * @param accessToken - Yandex OAuth access token.
 * @param uid - Account uid the token belongs to.
 * @param trackId - Track id, as returned by `readPlaylist` or a search.
 * @param albumId - Album id, or `null` when unknown.
 * @param liked - `true` to like, `false` to unlike.
 * @returns `{ ok: true }` on a 2xx answer, otherwise
 *   `{ ok: false, status }` (`status` is `0` for a network failure).
 */
export async function setTrackLike(accessToken, uid, trackId, albumId, liked) {
  const key =
    albumId === null || albumId === undefined || albumId === '' ? String(trackId) : `${trackId}:${albumId}`;
  const action = liked === true ? 'add-multiple' : 'remove';
  const { ok, status } = await request(accessToken, `/users/${encodeURIComponent(uid)}/likes/tracks/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `track-ids=${encodeURIComponent(key)}`,
  });
  return ok ? { ok: true } : { ok: false, status };
}

/* ------------------------------------------------------------------ */
/* playlist editing                                                    */
/* ------------------------------------------------------------------ */

/**
 * Create an empty playlist.
 * @param accessToken - Yandex OAuth access token.
 * @param uid - Account uid.
 * @param title - Visible name.
 * @param visibility - `private` or `public`.
 * @returns `{ kind, title }`, or `null` on failure.
 */
export async function createPlaylist(accessToken, uid, title, visibility = 'private') {
  const body = new URLSearchParams({ title, visibility });
  const response = await request(accessToken, `/users/${uid}/playlists/create`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const raw = response?.body?.result ?? null;
  if (raw === null || typeof raw !== 'object') return null;
  const kind = typeof raw.kind === 'number' ? raw.kind : null;
  if (kind === null) return null;
  return { kind, title: typeof raw.title === 'string' ? raw.title : title };
}

/** Read the raw playlist document, which carries the `revision` an edit needs. */
async function readPlaylistRaw(accessToken, uid, kind) {
  const response = await request(accessToken, `/users/${uid}/playlists/${kind}`);
  const raw = response?.body?.result ?? null;
  if (raw === null || typeof raw !== 'object') return null;
  const revision = typeof raw.revision === 'number' ? raw.revision : 1;
  const tracks = Array.isArray(raw.tracks) ? raw.tracks.filter((row) => row !== null) : [];
  return { revision, trackCount: tracks.length };
}

/**
 * Append one track to a playlist.
 *
 * Yandex edits are revision-based: read the current revision, post a `diff`
 * describing the insert, and the server rejects the write if the playlist moved
 * underneath us. That is why the read and the write are one call here.
 *
 * @param accessToken - Yandex OAuth access token.
 * @param uid - Account uid.
 * @param kind - Playlist kind.
 * @param trackId - Track id.
 * @param albumId - Album id, or null when the track carries none.
 * @returns `{ ok: true, revision }` or `{ ok: false, status, reason }`.
 */
export async function addTrackToPlaylist(accessToken, uid, kind, trackId, albumId) {
  const current = await readPlaylistRaw(accessToken, uid, kind);
  if (current === null) return { ok: false, status: 0, reason: 'read' };
  // Yandex diff shape: `tracks` (not `items`) and `albumId` (not `album_id`).
  // A wrong shape is accepted with 200 and silently ignored, so the revision
  // check after the write is the only way to tell.
  const item = albumId === null || albumId === undefined
    ? { id: Number(trackId) }
    : { id: Number(trackId), albumId: Number(albumId) };
  const diff = JSON.stringify([{ op: 'insert', at: current.trackCount, tracks: [item] }]);
  const body = new URLSearchParams({ kind: String(kind), revision: String(current.revision), diff });
  const response = await request(accessToken, `/users/${uid}/playlists/${kind}/change`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const raw = response?.body?.result ?? null;
  if (raw === null || typeof raw !== 'object') return { ok: false, status: response?.status ?? 0, reason: 'change' };
  return { ok: true, revision: typeof raw.revision === 'number' ? raw.revision : current.revision + 1 };
}

/**
 * Drop a playlist.
 * @param accessToken - Yandex OAuth access token.
 * @param uid - Account uid.
 * @param kind - Playlist kind.
 * @returns True when the server accepted the deletion.
 */
export async function deletePlaylist(accessToken, uid, kind) {
  const response = await request(accessToken, `/users/${uid}/playlists/${kind}/delete`, { method: 'POST' });
  return response?.ok === true;
}