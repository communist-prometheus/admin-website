import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { checkAuthStatus } from '@/composables/useAuth/check-auth'
import { getInitialUser } from '@/composables/useAuth/get-initial-user'
import { initSWWithToken } from '@/composables/useSWBridge/init-sw'
import type { User } from '@/types/user'

/**
 * Send token to Service Worker when user changes.
 * @param user - Authenticated user or null
 */
const syncTokenToSW = (user: User | null): void => {
  if (user?.accessToken) initSWWithToken(user.accessToken)
}

/**
 * Fetch auth status from server and update user ref.
 * @param user - Reactive user reference
 */
const fetchAndSetUser = async (user: Ref<User | null>): Promise<void> => {
  const data = await checkAuthStatus()
  if (data.authenticated && data.user) user.value = data.user
}

/**
 * Pinia store for authentication state management.
 * @returns Reactive user state and auth methods
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(getInitialUser())
  const loading = ref(false)
  const error = ref<string | null>(null)

  watch(user, syncTokenToSW, { immediate: true })

  const checkAuth = () => {
    if (typeof globalThis.document === 'undefined') return
    if (user.value) return
    fetchAndSetUser(user)
  }

  const setUser = (u: User | null) => {
    user.value = u
  }

  return { user, loading, error, checkAuth, setUser }
})
