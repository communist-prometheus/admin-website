import { initSWWithToken } from '@/composables/useSWBridge/init-sw'
import type { User } from '@/types/user'

/**
 * Send token to Service Worker when user changes.
 * @param user - Authenticated user or null
 */
export const syncTokenToSW = (user: User | null): void => {
  if (user?.accessToken)
    initSWWithToken(user.accessToken, {
      name: user.name,
      username: user.username,
    })
}
