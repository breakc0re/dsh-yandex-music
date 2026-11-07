/**
 * "My Wave" (rotor) — the personal infinite station of Yandex Music.
 *
 * Every detail below is pinned to what the live API actually answers, not to
 * the public documentation:
 *
 * - `GET /rotor/station/user:onyourwave/tracks?settings2=true` replies
 *   `{ invocationInfo, result: { id, sequence, batchId, pumpkin, radioSessionId } }`.
 *   Tracks live in `result.sequence[].track`; `result.batchId` is the string
 *   token a feedback call has to echo back. `result.id` is not a station name
 *   but `{ type: 'my', tag: 'station' }`, so the station string is returned
 *   instead of anything taken from the payload. The `settings2` flag changes
 *   nothing observable in the response; it is kept because official clients
 *   send it.
 * - `POST /rotor/station/{station}/feedback` accepts a JSON body only — form
 *   encoding is rejected with `400 condition is not met` — and *requires* a
 *   `timestamp` (a Joda `Instant`), otherwise it answers `400` with
 *   "Some parts were not parsed and have not default values ... SessionEvent.timestamp".
 *   ISO-8601 text and epoch milliseconds as a JSON *number* both parse; a
 *   numeric *string* does not. Success is `200 { result: 'ok' }`, and the
 *   endpoint is deliberately forgiving: a bogus `batchId` or an unknown
 *   station still answers `ok`, so a green status means "accepted", not
 *   "meaningful".
 * - A track carries no `explicit` flag: the signal is
 *   `contentWarning === 'explicit'` (absent otherwise). `track.id` is a
 *   *string*, `albums[].id` a number, `durationMs` a number, and `coverUri`
 *   arrives without a scheme and with a `%%` size placeholder.
 *
 * Both helpers take the access token explicitly, so nothing here can leak it
 * into a response body.
 */

const API_BASE = 'https://api.music.yandex.net';
const TIMEOUT_MS = 12_000;
const CLIENT_HEADER = 'YandexMusicDesktopAppWindows/5.42.0';

/** The station id of the personal wave; the same one official clients use. */
const WAVE_STATION = 'user:onyourwave';

/** Feedback types the rotor unmarshaller knows; anything else is a `400`. */
const FEEDBACK_TYPES = new Set(['trackStarted', 'trackFinished', 'skip']);

/** Thumbnail edge requested from the avatar CDN. */
const COVER_SIZE = '400x400';

/** Headers every request needs. */
function buildHeaders(accessToken) {
  return {
    authorization: `OAuth ${accessToken}`,
    accept: 'application/json',
    'accept-language': 'ru',
    'x-yandex-music-client': CLIENT_HEADER,
  };
}

/**
 * Turn `coverUri` into a ready-to-render URL.
 *
 * The field is host-relative (`avatars.yandex.net/.../%%`), so the scheme and
 * the size placeholder are filled in here. Falls back to `ogImage` and the
 * album cover, which carry the same opaque string.
 */
function coverUrl(track) {
  const raw = track?.coverUri || track?.ogImage || track?.albums?.[0]?.coverUri;
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const sized = raw.replace('%%', COVER_SIZE);
  if (sized.startsWith('//')) return `https:${sized}`;
  if (/^https?:\/\//i.test(sized)) return sized;
  return `https://${sized}`;
}

/** Join the artist objects into the single line the sidebar shows. */
function artistLine(artists) {
  if (!Array.isArray(artists)) return '';
  return artists
    .map((artist) => (artist && typeof artist.name === 'string' ? artist.name : ''))
    .filter(Boolean)
    .join(', ');
}

/**
 * Flatten one rotor track into the shape the player UI uses.
 *
 * @param {object} track Raw track from `result.sequence[].track`.
 * @returns {{ id: string, albumId: number|null, title: string, artists: string, durationMs: number, cover: string|null, explicit: boolean }|null}
 */
function normalizeTrack(track) {
  if (!track || track.id === undefined || track.id === null) return null;
  const album = Array.isArray(track.albums) ? track.albums[0] : null;
  const albumId = album && Number.isFinite(Number(album.id)) ? Number(album.id) : null;
  return {
    id: String(track.id),
    albumId,
    title: typeof track.title === 'string' ? track.title : '',
    artists: artistLine(track.artists),
    durationMs: Number.isFinite(track.durationMs) ? track.durationMs : 0,
    cover: coverUrl(track),
    explicit: track.contentWarning === 'explicit',
  };
}

/**
 * First batch of the personal wave.
 *
 * @param {string} accessToken OAuth access token.
 * @param {string|number} uid Owner id. Accepted for signature symmetry only:
 *   the rotor binds `user:onyourwave` to the token owner, so nothing about it
 *   goes on the wire.
 * @param {{ settings2?: boolean, timeoutMs?: number }} [options] `settings2`
 *   keeps official-client parity (the API answers the same with or without
 *   it); `timeoutMs` overrides the default request budget.
 * @returns {Promise<{ station: string, batchId: string|null, tracks: Array<object> }|null>}
 *   `null` on any transport failure, non-2xx status, or a payload without a
 *   `result.sequence` array. Individual sequence entries without a `track`
 *   (the rotor inserts those for other client builds) are skipped.
 */
export async function waveTracks(accessToken, uid, options = {}) {
  if (!accessToken) return null;
  const { settings2 = true, timeoutMs = TIMEOUT_MS } = options || {};
  const url = `${API_BASE}/rotor/station/${encodeURIComponent(WAVE_STATION)}/tracks${settings2 ? '?settings2=true' : ''}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let payload;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(accessToken),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    payload = await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }

  const result = payload?.result;
  if (!result || !Array.isArray(result.sequence)) return null;

  const tracks = [];
  for (const entry of result.sequence) {
    const normalized = normalizeTrack(entry?.track);
    if (normalized) tracks.push(normalized);
  }

  return {
    station: WAVE_STATION,
    batchId: typeof result.batchId === 'string' ? result.batchId : null,
    tracks,
  };
}

/**
 * Report playback of a wave track back to the station.
 *
 * The body is sent as JSON because the form-encoded variant is refused, and a
 * fresh ISO-8601 `timestamp` is always attached because the parser rejects the
 * event without it. `batchId` and `totalPlayedSeconds` are optional on the
 * wire; they are forwarded when present. For a `skip`, `seconds` defaults to
 * `totalPlayedSeconds` — the endpoint treats the two as the same quantity and
 * accepts the short form.
 *
 * @param {string} accessToken OAuth access token.
 * @param {string} station Station id, e.g. `user:onyourwave`. Defaults to the
 *   personal wave when empty; the segment is URL-encoded, which the API accepts.
 * @param {{ type: 'trackStarted'|'trackFinished'|'skip', trackId: string|number, batchId?: string, totalPlayedSeconds?: number, seconds?: number }} feedback
 * @returns {Promise<{ ok: true }|{ ok: false, status: number }>} `status` is
 *   the HTTP status, or `0` when nothing was sent (missing token, unknown
 *   `type`, missing `trackId`, network error).
 */
export async function waveFeedback(accessToken, station, feedback) {
  if (!accessToken) return { ok: false, status: 0 };

  const type = feedback?.type;
  if (!FEEDBACK_TYPES.has(type)) return { ok: false, status: 0 };

  const trackId = feedback?.trackId;
  if (trackId === undefined || trackId === null || trackId === '') return { ok: false, status: 0 };

  const body = { type, trackId, timestamp: new Date().toISOString() };
  if (feedback.batchId) body.batchId = String(feedback.batchId);

  const played = Number(feedback.totalPlayedSeconds);
  if (Number.isFinite(played) && played >= 0) body.totalPlayedSeconds = Math.round(played);

  if (type === 'skip') {
    const seconds = Number(feedback.seconds);
    if (Number.isFinite(seconds) && seconds >= 0) body.seconds = Math.round(seconds);
    else if (body.totalPlayedSeconds !== undefined) body.seconds = body.totalPlayedSeconds;
  }

  const target = station || WAVE_STATION;
  const url = `${API_BASE}/rotor/station/${encodeURIComponent(target)}/feedback`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...buildHeaders(accessToken), 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      // Drain the body so the socket is released; the error text is not
      // surfaced because a 200 "ok" for a stale batch means the payload is
      // not worth interpreting downstream.
      await response.text().catch(() => '');
      return { ok: false, status: response.status };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}
