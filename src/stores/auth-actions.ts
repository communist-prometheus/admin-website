import type { Ref } from 'vue'
import { saveProfile } from '@/composables/useAuth/profile-cache'
import { clearToken } from '@/composables/useAuth/token-storage'
import { sendSWMessage } from '@/composables/useSWBridge/send-message'
import { recordAction } from '@/features/action-history/recorder'
import type { User } from '@/types/user'
import { clearSsoRolesStorage } from './sso-roles-storage'

/**
 * Create user setter that persists profile to cache.
 * @param user - Reactive user ref
 * @returns Function to set user
 */
export const createSetUser =
  (user: Ref<User | null>) =>
  (u: User | null): void => {
    const wasLoggedIn = user.value !== null
    user.value = u
    if (u) {
      saveProfile({
        username: u.username,
        name: u.name,
        avatar: u.avatar,
      })
      void recordAction({
        kind: 'auth',
        action: wasLoggedIn ? 'token-refresh' : 'login',
      })
    }
  }

/**
 * Create logout action that clears token and user.
 * @param user - Reactive user ref
 * @param loading - Reactive loading ref
 * @returns Logout function
 */
export const createLogout =
  (user: Ref<User | null>, loading: Ref<boolean>): (() => void) =>
  () => {
    clearToken()
    clearSsoRolesStorage()
    // Drop the SW's clone + persisted config so the next account starts
    // clean — otherwise the previous user's token/identity linger in the
    // worker and commits keep going out under the previous account.
    void sendSWMessage({ type: 'SW_INVALIDATE' }).catch(() => undefined)
    user.value = null
    loading.value = false
    void recordAction({ kind: 'auth', action: 'logout' })
  }
