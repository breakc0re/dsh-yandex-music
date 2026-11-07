/**
 * Literary translations from amalgama-lab.com.
 *
 * The site has no API and its own search is a Yandex widget, so a page is found
 * by building the URL from the artist and song names — both transliterated.
 * Their markup is regular: one `.string_container` per line, with `.original`
 * and `.translate` divs inside, and the whole site is windows-1251.
 *
 * Everything is best-effort: a wrong page, a missing page or a translation that
 * does not line up with our lyrics simply returns `null`, and the caller falls
 * back to machine translation.
 */

import { TextDecoder } from 'node:util';

const BASE = 'https://www.amalgama-lab.com';
const TIMEOUT_MS = 8_000;

/** Russian → latin, the way amalgama spells its directories. */
const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
  ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** `Кукушка` → `kukushka`, `I Got Love` → `i_got_love`. */
export function slug(value) {
  let out = '';
  for (const char of String(value ?? '').toLowerCase()) {
    if (TRANSLIT[char] !== undefined) {
      out += TRANSLIT[char];
      continue;
    }
    if (/[a-z0-9]/u.test(char)) out += char;
    else if (char === ' ' || char === '-' || char === '\u2014' || char === '/' || char === '.') out += '_';
  }
  return out.replace(/_+/gu, '_').replace(/^_+|_+$/gu, '');
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/gu, '"')
    .replace(/&#0?39;/gu, "'")
    .replace(/&apos;/gu, "'")
    .replace(/&nbsp;/gu, ' ')
    .replace(/&laquo;/gu, '«')
    .replace(/&raquo;/gu, '»')
    .replace(/&mdash;/gu, '—')
    .replace(/&ndash;/gu, '–')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&amp;/gu, '&')
    .replace(/&#(\d+);/gu, (whole, code) => {
      const value = Number(code);
      return Number.isFinite(value) && value > 0 && value < 0x10ffff ? String.fromCodePoint(value) : whole;
    });
}

function plain(html) {
  return decodeEntities(html.replace(/<[^>]*>/gu, ' ')).replace(/\s+/gu, ' ').trim();
}

/** Words without case, punctuation or duplicates — the comparison unit. */
function words(text) {
  return new Set(
    String(text ?? '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .split(' ')
      .filter((word) => word.length > 1),
  );
}

function overlap(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / Math.max(left.size, right.size);
}

/** The site is windows-1251; `response.text()` would mangle every vowel. */
async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) dsh-yandex-music/0.5',
        accept: 'text/html',
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return new TextDecoder('windows-1251').decode(buffer);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Find the translation page for a song and align it with our lyrics lines.
 * @param input - `{ title, artist, lines }`.
 * @returns `{ sourceUrl, translated, coverage }` or `null` when nothing lines up.
 */
export async function readAmalgama({ title, artist, lines }) {
  const songSlug = slug(title);
  const artistSlug = slug(artist);
  if (songSlug === '' || artistSlug === '') return null;

  const artistSolo = artistSlug.split('_')[0];
  const candidates = [
    `${BASE}/songs/${artistSlug.slice(0, 1)}/${artistSlug}/${songSlug}.html`,
    `${BASE}/songs/${artistSlug.slice(0, 1)}/${artistSlug}/${songSlug}_1.html`,
  ];
  if (artistSolo !== artistSlug) {
    candidates.push(`${BASE}/songs/${artistSolo.slice(0, 1)}/${artistSolo}/${songSlug}.html`);
  }

  let html = null;
  let sourceUrl = '';
  for (const url of candidates) {
    const page = await fetchPage(url);
    if (page !== null && page.includes('class="original"')) {
      html = page;
      sourceUrl = url;
      break;
    }
  }
  if (html === null) return null;

  // The page must be about the same song: compare its heading with ours.
  const heading = /<h2[^>]*class="original"[^>]*>([\s\S]*?)<\/h2>/u.exec(html);
  if (heading !== null) {
    const headingTitle = words(plain(heading[1]));
    const wantedTitle = words(title);
    if (headingTitle.size > 0 && overlap(headingTitle, wantedTitle) === 0) return null;
  }

  const pairs = [];
  const pattern = /<div class="original">([\s\S]*?)<\/div>\s*<div class="translate">([\s\S]*?)<\/div>/gu;
  for (const match of html.matchAll(pattern)) {
    const original = plain(match[1]);
    const translate = plain(match[2]);
    if (original === '' || translate === '') continue;
    pairs.push({ original, translate, key: words(original) });
  }
  if (pairs.length === 0) return null;

  const used = new Set();
  const translated = new Array(lines.length).fill(null);
  let matched = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const key = words(lines[index]);
    if (key.size < 2) continue;
    let bestIndex = -1;
    let bestScore = 0;
    for (let position = 0; position < pairs.length; position += 1) {
      if (used.has(position)) continue;
      const score = overlap(key, pairs[position].key);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = position;
      }
    }
    if (bestIndex >= 0 && bestScore >= 0.5) {
      used.add(bestIndex);
      translated[index] = pairs[bestIndex].translate;
      matched += 1;
    }
  }

  const playable = lines.filter((line) => String(line ?? '').trim() !== '').length;
  const coverage = playable === 0 ? 0 : matched / playable;
  // A page that barely overlaps is the wrong song, not a translation.
  if (coverage < 0.35) return null;
  return { sourceUrl, translated, coverage };
}
