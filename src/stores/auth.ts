import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { getCachedUser } from '@/composables/useAuth/cached-user'
import { getInitialUser } from '@/composables/useAuth/get-initial-user'
import { saveProfile } from '@/composables/useAuth/profile-cache'
import { revalidateUser } from '@/composables/useAuth/revalidate-user'
import { clearToken, loadToken } from '@/composables/useAuth/token-storage'
import { initSWWithToken } from '@/composables/useSWBridge/init-sw'
import type { User } from '@/types/user'

/**
 * Send token to Service Worker when user changes.
 * @param user - Authenticated user or null
 */
const syncTokenToSW = (user: User | null): void => {
  if (user?.accessToken)
    initSWWithToken(user.accessToken, {
      name: user.name,
      username: user.username,
    })
}

/**
 * Pinia store for authentication state management.
 * Uses cached profile for instant rendering on refresh.
 * @returns Reactive user state and auth methods
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(!!loadToken())
  const error = ref<string | null>(null)

  watch(user, syncTokenToSW, { immediate: true })

  const checkAuth = async () => {
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

  const setUser = (u: User | null) => {
    user.value = u
    if (u) {
      saveProfile({
        username: u.username,
        name: u.name,
        avatar: u.avatar,
      })
    }
  }

  const logout = () => {
    clearToken()
    user.value = null
    loading.value = false
  }

  return {
    user,
    loading,
    error,
    checkAuth,
    setUser,
    logout,
  }
})
