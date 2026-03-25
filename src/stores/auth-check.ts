import type { Ref } from 'vue'
import { getCachedUser } from '@/composables/useAuth/cached-user'
import { getInitialUser } from '@/composables/useAuth/get-initial-user'
import { revalidateUser } from '@/composables/useAuth/revalidate-user'
import type { User } from '@/types/user'

/**
 * Create an async auth-check that restores cached user
 * first, then revalidates in background.
 * @param user - Reactive user ref
 * @param loading - Reactive loading ref
 * @param logout - Logout callback
 * @returns Async function that checks authentication
 */
export const createCheckAuth =
  (user: Ref<User | null>, loading: Ref<boolean>, logout: () => void) =>
  async (): Promise<void> => {
    if (typeof globalThis.document === 'undefined') return
    if (user.value) return
    const cached = getCachedUser()
    if (cached) {
      user.value = cached
      loading.value = false
      revalidateUser().then(fresh => {
        if (fresh) user.value = fresh
        else logout()
      })
      return
    }
    loading.value = true
    try {
      user.value = await getInitialUser()
    } finally {
      loading.value = false
    }
  }
