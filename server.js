/**
 * Host half of the Yandex Music player.
 *
 * The plugin currently ships only its browser half: the sidebar footer entry
 * and its popover. This module keeps the Loader row alive and reserves the
 * place where the token store and the api.music.yandex.net proxy will live
 * (see docs/plan.json, stories S3-S7).
 */

/** No Host service is required yet. */
export const inject = [];

/**
 * Keep the Loader row registered without touching routes or secrets.
 * @param _ctx - Host root context.
 */
export function apply(_ctx) {
  // Intentionally empty: the browser half owns the whole surface for now.
}
