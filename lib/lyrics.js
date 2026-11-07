/**
 * Lyrics fallback that actually has timestamps.
 *
 * Two gaps make Yandex alone insufficient:
 *
 * - `supplement.lyrics` is returned for a subset of the catalogue only, so
 *   popular tracks routinely come back with no text at all;
 * - the time-synced variant lives behind `sign`/`timeStamp`, a signature the
 *   client cannot compute (`403 Invalid Sign`), so Yandex text is always plain.
 *
 * LRCLIB is a free, key-less lyrics database built around LRC files, which carry
 * real per-line timestamps. That gives karaoke timing for free and covers the
 * tracks Yandex does not answer for. Nothing here throws: a failed lookup simply
 * returns `null` and the caller falls back.
 */

const LRCLIB_GET = 'https://lrclib.net/api/get';
const LRCLIB_SEARCH = 'https://lrclib.net/api/search';
const TIMEOUT_MS = 6_000;
const AGENT = 'dsh-yandex-music/0.5 (+https://github.com/breakc0re/dsh-yandex-music)';

/** GET JSON with a short timeout; `null` on any failure. */
async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': AGENT, accept: 'application/json' },
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
 * Parse LRC into `[{ timeMs, text }]`. Handles `[mm:ss.xx]`, `[mm:ss.xxx]` and
 * the multi-stamp form `[00:10.00][01:10.00] chorus`.
 * @param text - Raw LRC document.
 * @returns Sorted rows; empty when nothing parsed.
 */
export function parseLrc(text) {
  if (typeof text !== 'string') return [];
  const rows = [];
  for (const raw of text.split('\n')) {
    const stamps = [...raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/gu)];
    if (stamps.length === 0) continue;
    const body = raw.replace(/\[[^\]]*\]/gu, '').trim();
    if (body === '') continue;
    for (const stamp of stamps) {
      const minutes = Number(stamp[1]);
      const seconds = Number(stamp[2]);
      const fraction = stamp[3] === undefined ? 0 : Number(`0.${stamp[3].padEnd(3, '0')}`);
      rows.push({ timeMs: Math.round((minutes * 60 + seconds + fraction) * 1000), text: body });
    }
  }
  rows.sort((a, b) => a.timeMs - b.timeMs);
  return rows;
}

/** Loose comparison key: no case, no brackets, no «feat.», no punctuation. */
function clean(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\([^)]*\)/gu, ' ')
    .replace(/\[[^\]]*\]/gu, ' ')
    .replace(/\b(feat|ft|prod)\b.*$/u, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Pick the closest search hit by title, artist and duration. `get` matches the
 * exact duration, which misses remasters and live versions, so search is the
 * safety net.
 */
async function pickCandidate({ title, artist, durationMs }) {
  const wanted = clean(title);
  const who = clean(artist);
  if (wanted === '') return null;
  const list = await getJson(`${LRCLIB_SEARCH}?${new URLSearchParams({ q: `${artist} ${title}`.trim() })}`);
  if (!Array.isArray(list) || list.length === 0) return null;
  const seconds = durationMs > 0 ? durationMs / 1000 : 0;
  let best = null;
  let bestScore = 0;
  for (const item of list) {
    if (item === null || typeof item !== 'object') continue;
    const itemTitle = clean(item.trackName);
    const itemArtist = clean(item.artistName);
    let score = 0;
    if (itemTitle === wanted) score += 4;
    else if (itemTitle.includes(wanted) || wanted.includes(itemTitle)) score += 2;
    if (who !== '' && itemArtist === who) score += 3;
    else if (who !== '' && (itemArtist.includes(who) || who.includes(itemArtist))) score += 1;
    if (seconds > 0 && typeof item.duration === 'number') {
      const diff = Math.abs(item.duration - seconds);
      if (diff <= 3) score += 3;
      else if (diff <= 8) score += 1;
    }
    if (typeof item.syncedLyrics === 'string' && item.syncedLyrics !== '') score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore >= 4 ? best : null;
}

/**
 * Look a track up on LRCLIB.
 * @param input - `{ title, artist, durationMs }`.
 * @returns `{ lines, timed, instrumental }`, or `null` when nothing was found.
 */
export async function readLyricsExternal({ title, artist, durationMs }) {
  if (typeof title !== 'string' || title.trim() === '') return null;
  const safeArtist = typeof artist === 'string' ? artist : '';
  const params = new URLSearchParams({ artist_name: safeArtist, track_name: title });
  if (durationMs > 0) params.set('duration', String(Math.round(durationMs / 1000)));
  let item = safeArtist === '' ? null : await getJson(`${LRCLIB_GET}?${params}`);
  if (item === null || typeof item !== 'object') item = await pickCandidate({ title, artist: safeArtist, durationMs });
  if (item === null || typeof item !== 'object') return null;
  if (item.instrumental === true) return { lines: [], timed: [], instrumental: true };
  const timed = parseLrc(item.syncedLyrics);
  const plain = typeof item.plainLyrics === 'string' ? item.plainLyrics : '';
  if (timed.length === 0 && plain.trim() === '') return null;
  return {
    lines: timed.length > 0 ? timed.map((row) => row.text) : plain.split('\n').map((line) => line.trimEnd()),
    timed,
    instrumental: false,
  };
}
