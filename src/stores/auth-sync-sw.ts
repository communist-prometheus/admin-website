import { initSWWithToken } from '@/composables/useSWBridge/init-sw'
import type { User } from '@/types/user'
import { fireAndForward } from '@/utils/fire-and-forward'
import { loadRoleAfterInit } from './role-init'

/**
 * Send token to Service Worker when user changes.
 *
 * Init failures must surface — they used to be swallowed by a
 * silent `.then(loadRoleAfterInit, () => {})` rejection handler,
 * which is exactly the kind of "user clicks save, nothing happens"
 * scenario we got bitten by. fireAndForward routes the rejection
 * through the unhandled-rejection event so DevTools shows it.
 * @param user - Authenticated user or null
 */
export const syncTokenToSW = (user: User | null): void => {
  if (!user?.accessToken) return
  fireAndForward(
    initSWWithToken(user.accessToken, {
      name: user.name,
      username: user.username,
    }).then(loadRoleAfterInit)
  )
}
