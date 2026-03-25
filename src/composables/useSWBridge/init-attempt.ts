import { Effect } from 'effect'
import type { SWAuthor } from './build-sw-config'
import { buildSWConfig } from './build-sw-config'
import { initViaMessage } from './init-via-message'
import { tryFetchInit } from './try-fetch-init'

/**
 * Single init attempt: try fetch path, fall back to message.
 * @param token - GitHub access token
 * @param author - Optional git commit author info
 * @returns Effect that succeeds on init or fails to retry
 */
export const initAttempt = (
  token: string,
  author?: SWAuthor
): Effect.Effect<void, Error> =>
  Effect.tryPromise({
    try: async () => {
      const cfg = buildSWConfig(token, author)
      const hasCtr = !!navigator.serviceWorker.controller
      const ok = hasCtr && (await tryFetchInit(cfg))
      return ok ? undefined : initViaMessage(cfg)
    },
    catch: e => (e instanceof Error ? e : new Error(String(e))),
  }).pipe(Effect.asVoid)
