/**
 * Machine translation of lyrics.
 *
 * Uses the public Google endpoint the browser widgets use: no key, one request
 * for the whole text, and the response keeps the source line breaks — which is
 * what lets a translated line stay attached to the line it belongs to.
 */

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const TIMEOUT_MS = 8_000;

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) dsh-yandex-music/0.5',
        accept: 'application/json',
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
 * Translate every non-empty line, keeping the original indexing.
 * @param lines - Source lines.
 * @param to - Target language code.
 * @returns `{ language, mode, lines }` — `mode: 'lines'` when the result stayed
 *   line-aligned, `mode: 'block'` when the engine merged lines (then `lines` is
 *   `null` and `text` holds the whole translation), or `null` on failure.
 */
export async function machineTranslate(lines, to = 'ru') {
  if (!Array.isArray(lines)) return null;
  const indexes = [];
  const payload = [];
  for (let index = 0; index < lines.length; index += 1) {
    const value = String(lines[index] ?? '').trim();
    if (value === '') continue;
    if (value.length > 900) continue;
    indexes.push(index);
    payload.push(value);
  }
  if (payload.length === 0) return null;

  const query = new URLSearchParams({ client: 'gtx', sl: 'auto', tl: to, dt: 't', q: payload.join('\n') });
  const body = await getJson(`${ENDPOINT}?${query}`);
  if (!Array.isArray(body)) return null;
  const segments = Array.isArray(body[0]) ? body[0] : [];
  const joined = segments.map((segment) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : '')).join('');
  if (joined.trim() === '') return null;

  const split = joined.split('\n').map((line) => line.trim());
  while (split.length > 0 && split[split.length - 1] === '') split.pop();
  const language = typeof body[2] === 'string' ? body[2] : '';

  if (split.length === payload.length) {
    const aligned = new Array(lines.length).fill(null);
    indexes.forEach((target, position) => {
      aligned[target] = split[position];
    });
    return { language, mode: 'lines', lines: aligned, text: '' };
  }
  return { language, mode: 'block', lines: null, text: split.join(' ').trim() };
}
