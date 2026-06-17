import { loadProfile } from '@/composables/useAuth/profile-cache'
import { loadToken } from '@/composables/useAuth/token-storage'
import type { CachedProfile } from '@/validation/schemas/user'
import type { SWAuthor } from './build-sw-config'
import { initSWWithToken } from './init-sw'

let pending: Promise<boolean> | undefined

/**
 * Map a cached profile to git commit author info, or undefined.
 * @param profile - Cached user profile or undefined
 * @returns SW author info or undefined
 */
const toAuthor = (
  profile: CachedProfile | undefined
): SWAuthor | undefined =>
  profile === undefined
    ? undefined
    : { name: profile.name, username: profile.username }

/**
 * Re-send the stored GitHub token to the Service Worker so it can
 * clone from scratch. Covers the case where the worker has neither
 * in-memory nor persisted config (never initialised on this origin,
 * or evicted with a wiped FS) and so cannot self-recover.
 * @returns true when a token was found and re-init ran
 */
const run = async (): Promise<boolean> => {
  const token = loadToken()
  return token === undefined
    ? false
    : initSWWithToken(token, toAuthor(loadProfile())).then(() => true)
}

/**
 * Re-initialise the Service Worker from the stored token, sharing a
 * single in-flight attempt across concurrent callers.
 * @returns true when a token was found and re-init ran
 */
export const reinitSWFromStorage = (): Promise<boolean> => {
  pending ??= run().finally(() => {
    pending = undefined
  })
  return pending
}
