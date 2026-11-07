/**
 * Plugin-private auth store.
 *
 * The OAuth tokens never leave the Host: the browser half only ever sees
 * `{ configured, authorized, login, expiresAt }`. The file is written
 * atomically with 0600 so a crash cannot leave a half-written token behind.
 */

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PLUGIN_ID = 'dsh-yandex-music';
const FILE = 'auth.json';

/** Shape of the persisted document; every field has a safe default. */
const EMPTY = Object.freeze({
  clientId: '',
  clientSecret: '',
  accessToken: '',
  refreshToken: '',
  expiresAt: 0,
  scope: '',
  login: '',
  uid: null,
  deviceId: '',
});

/**
 * Resolve the plugin data directory.
 * @param ctx - Host root context; `homePaths` is optional.
 * @returns Absolute directory path.
 */
export function resolveDataDir(ctx) {
  let home = null;
  try {
    const paths = ctx?.get?.('homePaths');
    if (paths !== null && typeof paths === 'object' && typeof paths.home === 'string') home = paths.home;
  } catch {
    home = null;
  }
  if (home === null) home = process.env.DSH_HOME ?? path.join(os.homedir(), '.dsh');
  return path.join(home, 'plugin-data', PLUGIN_ID);
}

/**
 * Read the persisted document, falling back to defaults.
 * @param dir - Plugin data directory.
 * @returns The auth document.
 */
export async function readAuth(dir) {
  try {
    const text = await fs.readFile(path.join(dir, FILE), 'utf8');
    const parsed = JSON.parse(text);
    if (parsed === null || typeof parsed !== 'object') return { ...EMPTY };
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

/**
 * Persist the document atomically.
 * @param dir - Plugin data directory.
 * @param value - Complete auth document.
 * @returns The written document.
 */
export async function writeAuth(dir, value) {
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, FILE);
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file);
  return value;
}

/** Public projection: what the browser half is allowed to know. */
export function publicStatus(auth) {
  return {
    configured: typeof auth.clientId === 'string' && auth.clientId !== '',
    authorized: typeof auth.accessToken === 'string' && auth.accessToken !== '',
    login: typeof auth.login === 'string' ? auth.login : '',
    uid: typeof auth.uid === 'number' ? auth.uid : null,
    expiresAt: typeof auth.expiresAt === 'number' ? auth.expiresAt : 0,
  };
}
