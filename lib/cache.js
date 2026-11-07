/**
 * Tiny on-disk cache for the reads that are slow and rarely change.
 *
 * The plugin lives in a desktop shell that restarts, and every restart used to
 * mean a fresh round of catalogue and playlist requests. A JSON file per key
 * with a timestamp is enough: a miss, a corrupt file or a full disk all degrade
 * to "just fetch it", never to an error.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

function fileFor(dir, key) {
  return path.join(dir, 'cache', `${key}.json`);
}

/**
 * @param dir - Plugin data directory.
 * @param key - Cache key, also the file name.
 * @param ttlMs - How long a value stays usable.
 * @returns The cached value, or `null` when missing, stale or unreadable.
 */
export async function readCache(dir, key, ttlMs) {
  try {
    const raw = await fs.readFile(fileFor(dir, key), 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return null;
    if (typeof parsed.at !== 'number') return null;
    if (Date.now() - parsed.at > ttlMs) return null;
    return parsed.value === undefined ? null : parsed.value;
  } catch {
    return null;
  }
}

export async function writeCache(dir, key, value) {
  try {
    await fs.mkdir(path.join(dir, 'cache'), { recursive: true });
    await fs.writeFile(fileFor(dir, key), JSON.stringify({ at: Date.now(), value }), 'utf8');
  } catch {
    /* a cache that cannot be written is simply a cache miss next time */
  }
}

export async function dropCache(dir, key) {
  try {
    await fs.rm(fileFor(dir, key), { force: true });
  } catch {
    /* nothing to drop is fine */
  }
}
