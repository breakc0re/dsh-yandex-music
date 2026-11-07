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

/* ------------------------------------------------------------------ */
/* music                                                               */
/* ------------------------------------------------------------------ */

/** Yandex cover URIs carry a `%%` placeholder for the size. */
function coverUrl(uri, size) {
  if (typeof uri !== 'string' || uri === '') return null;
  return `https://${uri.replace('%%', size)}`;
}

/** Yandex sends ids as numbers in some payloads and as strings in others. */
function toId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d{1,15}$/u.test(value)) return Number(value);
  return null;
}

/** Flatten one API track into the shape the popover renders. */
function toTrack(raw) {
  if (raw === null || typeof raw !== 'object') return null;
  const albums = Array.isArray(raw.albums) ? raw.albums : [];
  const artists = Array.isArray(raw.artists) ? raw.artists : [];
  const album = albums[0] !== null && typeof albums[0] === 'object' ? albums[0] : null;
  const artist = artists[0] !== null && typeof artists[0] === 'object' ? artists[0] : null;
  const id = typeof raw.id === 'number' || typeof raw.id === 'string' ? raw.id : null;
  if (id === null) return null;
  return {
    id,
    albumId: album !== null ? toId(album.id) : null,
    albumTitle: album !== null && typeof album.title === 'string' ? album.title : '',
    artistId: artist !== null ? toId(artist.id) : null,
    title: typeof raw.title === 'string' ? raw.title : '',
    artists: artists.map((item) => (item !== null && typeof item.name === 'string' ? item.name : '')).filter(Boolean).join(', '),
    durationMs: typeof raw.durationMs === 'number' ? raw.durationMs : 0,
    cover: coverUrl(album !== null ? album.coverUri : raw.coverUri, '200x200'),
    explicit: raw.explicit === true || (typeof raw.contentWarning === 'string' && raw.contentWarning === 'explicit'),
  };
}

/** One artist as a list row or a chip. */
function toArtist(raw) {
  if (raw === null || typeof raw !== 'object') return null;
  const id = toId(raw.id);
  if (id === null) return null;
  return {
    id,
    name: typeof raw.name === 'string' ? raw.name : '',
    cover: coverUrl(raw.cover?.uri ?? raw.ogImage, '200x200'),
    trackCount: typeof raw.counts?.tracks === 'number' ? raw.counts.tracks : 0,
  };
}

/** One album as a list row or a chip. */
function toAlbum(raw) {
  if (raw === null || typeof raw !== 'object') return null;
  const id = toId(raw.id);
  if (id === null) return null;
  const artists = Array.isArray(raw.artists) ? raw.artists : [];
  const first = artists[0] !== null && typeof artists[0] === 'object' ? artists[0] : null;
  return {
    id,
    title: typeof raw.title === 'string' ? raw.title : '',
    artists: artists.map((item) => (item !== null && typeof item.name === 'string' ? item.name : '')).filter(Boolean).join(', '),
    artistId: first !== null ? toId(first.id) : null,
    cover: coverUrl(raw.coverUri ?? raw.cover?.uri, '200x200'),
    year: typeof raw.year === 'number' ? raw.year : null,
    trackCount: typeof raw.trackCount === 'number' ? raw.trackCount : 0,
  };
}

const list = (items, mapper) => (Array.isArray(items) ? items.map(mapper).filter((item) => item !== null) : []);

/**
 * Search tracks, artists and albums in one request.
 * @param accessToken - Yandex OAuth access token.
 * @param query - Free-text query.
 * @returns `{ tracks, artists, albums }`, or `null` when the request failed.
 */
export async function searchTracks(accessToken, query) {
  const url = `${API_BASE}/search?text=${encodeURIComponent(query)}&type=all&page=0&nocorrect=false`;
  const body = await getJson(url, accessToken, { 'x-yandex-music-client': CLIENT_HEADER });
  if (body === null || typeof body !== 'object') return null;
  const result = body.result ?? {};
  return {
    tracks: list(result.tracks?.results, toTrack),
    artists: list(result.artists?.results, toArtist).slice(0, 8),
    albums: list(result.albums?.results, toAlbum).slice(0, 8),
  };
}

/**
 * One artist page: the artist, their albums and their most popular tracks.
 * @returns `{ artist, albums, tracks, total }`, or `null` when nothing answered.
 */
export async function readArtist(accessToken, artistId) {
  const headers = { 'x-yandex-music-client': CLIENT_HEADER };
  const [brief, albumBody, trackBody] = await Promise.all([
    getJson(`${API_BASE}/artists/${artistId}/brief-info`, accessToken, headers),
    getJson(`${API_BASE}/artists/${artistId}/direct-albums?page=0&page-size=24`, accessToken, headers),
    getJson(`${API_BASE}/artists/${artistId}/tracks?page=0&page-size=100`, accessToken, headers),
  ]);
  if (brief === null && albumBody === null && trackBody === null) return null;
  const artist = toArtist(brief?.result?.artist) ?? { id: artistId, name: '', cover: null, trackCount: 0 };
  const albums = list(albumBody?.result?.albums ?? brief?.result?.albums, toAlbum);
  const tracks = list(trackBody?.result?.tracks, toTrack);
  const total = typeof trackBody?.result?.pager?.total === 'number' ? trackBody.result.pager.total : tracks.length;
  return { artist, albums, tracks, total };
}

/**
 * One album page. The API keeps the running order in `volumes`, not `tracks`.
 * @returns `{ album, tracks }`, or `null` when the album is unavailable.
 */
export async function readAlbum(accessToken, albumId) {
  const body = await getJson(`${API_BASE}/albums/${albumId}/with-tracks`, accessToken, { 'x-yandex-music-client': CLIENT_HEADER });
  if (body === null || typeof body !== 'object' || body.result === null || typeof body.result !== 'object') return null;
  const raw = body.result;
  const album = toAlbum(raw);
  if (album === null) return null;
  const volumes = Array.isArray(raw.volumes) ? raw.volumes.flat() : [];
  const tracks = list(volumes, toTrack).map((track) => (track.albumId === null ? { ...track, albumId: album.id } : track));
  return { album, tracks };
}

/**
 * Lyrics for one track. The same supplement call also carries videos and clips,
 * which is why only the lyrics object is read out of it: Yandex exposes the
 * plain text, while the time-synced variant stays behind a server-side signature.
 * @returns `{ available, lines, language }`, or `null` when the request failed.
 */
export async function readLyrics(accessToken, trackId) {
  const body = await getJson(`${API_BASE}/tracks/${trackId}/supplement`, accessToken, { 'x-yandex-music-client': CLIENT_HEADER });
  if (body === null || typeof body !== 'object') return null;
  const lyrics = body.result?.lyrics;
  const text = typeof lyrics?.fullLyrics === 'string' && lyrics.fullLyrics.trim() !== ''
    ? lyrics.fullLyrics
    : typeof lyrics?.lyrics === 'string' ? lyrics.lyrics : '';
  const lines = text.split('\n').map((line) => line.trimEnd());
  return {
    available: lines.some((line) => line.trim() !== ''),
    lines,
    language: typeof lyrics?.textLanguage === 'string' ? lyrics.textLanguage : '',
  };
}

/** XML tags the download-info document carries. */
function tag(xml, name) {
  const match = new RegExp(`<${name}>([^<]+)</${name}>`, 'u').exec(xml);
  return match === null ? '' : match[1];
}

/**
 * Resolve a playable URL for one track.
 *
 * Yandex hands out a signed `get-mp3` link derived from the download-info XML:
 * `md5(secret + path.slice(1) + s)` over `https://<host>/get-mp3/<sign>/<ts><path>`.
 * The signing scheme is reverse-engineered and may change without notice.
 *
 * @param accessToken - Yandex OAuth access token.
 * @param trackId - Track id.
 * @param albumId - Album id, when known.
 * @returns `{ url, preview }`, `null` on failure, or `{ error }` for a known refusal.
 */
export async function resolveTrackUrl(accessToken, trackId, albumId) {
  const downloadInfo = async (key) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${API_BASE}/tracks/${encodeURIComponent(key)}/download-info`, {
        method: 'GET',
        headers: {
          authorization: `OAuth ${accessToken}`,
          accept: 'application/json',
          'accept-language': 'ru',
          'x-yandex-music-client': CLIENT_HEADER,
        },
        signal: controller.signal,
      });
      if (response.ok) {
        const body = await response.json();
        const variants = body !== null && typeof body === 'object' ? body.result : null;
        return Array.isArray(variants) ? { variants } : { error: 'unavailable' };
      }
      let message = '';
      try {
        const body = await response.json();
        message = body?.result?.message ?? body?.error?.name ?? '';
      } catch {
        message = '';
      }
      return { error: message === 'no-rights' ? 'no-rights' : `http-${response.status}` };
    } catch {
      return { error: 'network' };
    } finally {
      clearTimeout(timer);
    }
  };

  let key = albumId === null || albumId === undefined ? String(trackId) : `${trackId}:${albumId}`;
  let info = await downloadInfo(key);

  // A liked track can arrive without an album id; ask the metadata for one.
  if (info.error !== undefined && (albumId === null || albumId === undefined)) {
    const meta = await getJson(`${API_BASE}/tracks/${encodeURIComponent(String(trackId))}`, accessToken, {
      'x-yandex-music-client': CLIENT_HEADER,
    });
    // `albums` can be an empty array, so the chain must survive a missing [0].
    const album = meta?.result?.[0]?.albums?.[0]?.id;
    if (typeof album === 'number') {
      key = `${trackId}:${album}`;
      info = await downloadInfo(key);
    }
  }

  if (info.error !== undefined) return { error: info.error };
  const variants = info.variants;
  if (!Array.isArray(variants) || variants.length === 0) return { error: 'unavailable' };
  const variant = variants.find((row) => row !== null && typeof row.downloadInfoUrl === 'string');
  if (variant === undefined) return { error: 'unavailable' };
  const xml = await (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(variant.downloadInfoUrl, {
        headers: { authorization: `OAuth ${accessToken}`, 'x-yandex-music-client': CLIENT_HEADER },
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
  if (xml === null) return { error: 'unavailable' };
  const host = tag(xml, 'host');
  const filePath = tag(xml, 'path');
  const ts = tag(xml, 'ts');
  const s = tag(xml, 's');
  if (host === '' || filePath === '' || ts === '' || s === '') return { error: 'unavailable' };
  const { createHash } = await import('node:crypto');
  const sign = createHash('md5').update(`XGRlBW9FXlekgbPrRHuSiA${filePath.slice(1)}${s}`).digest('hex');
  return {
    url: `https://${host}/get-mp3/${sign}/${ts}${filePath}`,
    preview: variant.preview === true,
  };
}
