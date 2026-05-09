import { fireAndForward } from '@/utils/fire-and-forward'
import { rethrow } from '@/utils/rethrow'
import { useRoleStore } from './role'

const isPiniaUninitialized = (e: unknown): boolean =>
  e instanceof Error && e.message.includes('getActivePinia')

const tryUseRoleStore = (): ReturnType<typeof useRoleStore> | undefined => {
  try {
    return useRoleStore()
  } catch (e) {
    return isPiniaUninitialized(e) ? undefined : rethrow(e)
  }
}

/**
 * Load the user's role from the SW after init completes.
 * Called from syncTokenToSW after SW is ready.
 *
 * Pre-Pinia-mount calls can hit `getActivePinia()`-was-null — that's
 * a harmless lifecycle race, swallow it specifically. Anything else
 * (auth failure, malformed roles.json, network) propagates via
 * {@link fireAndForward}; the silent `.catch(() => {})` we used to
 * have is what kept production save regressions invisible.
 */
export const loadRoleAfterInit = (): void => {
  const store = tryUseRoleStore()
  void (store ? fireAndForward(store.loadRole()) : 0)
}
