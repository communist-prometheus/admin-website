import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getInitialUser } from '@/composables/useAuth/get-initial-user'
import { clearToken } from '@/composables/useAuth/token-storage'
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
 * Pinia store for authentication state management.
 * @returns Reactive user state and auth methods
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  watch(user, syncTokenToSW, { immediate: true })

  const checkAuth = async () => {
    if (typeof globalThis.document === 'undefined') return
    if (user.value) return
    loading.value = true
    try {
      user.value = await getInitialUser()
    } finally {
      loading.value = false
    }
  }

  const setUser = (u: User | null) => {
    user.value = u
  }

  const logout = () => {
    clearToken()
    user.value = null
  }

  return { user, loading, error, checkAuth, setUser, logout }
})
