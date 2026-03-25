import type { Ref } from 'vue'
import { saveProfile } from '@/composables/useAuth/profile-cache'
import { clearToken } from '@/composables/useAuth/token-storage'
import type { User } from '@/types/user'

/**
 * Create user setter that persists profile to cache.
 * @param user - Reactive user ref
 * @returns Function to set user
 */
export const createSetUser =
  (user: Ref<User | null>) =>
  (u: User | null): void => {
    user.value = u
    if (u) {
      saveProfile({
        username: u.username,
        name: u.name,
        avatar: u.avatar,
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
    user.value = null
    loading.value = false
  }
