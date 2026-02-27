import { Effect, pipe } from 'effect'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { checkAuthStatus } from '@/composables/useAuth/check-auth'
import { getInitialUser } from '@/composables/useAuth/get-initial-user'
import type { User } from '@/types/user'

/**
 * Pinia store для управления состоянием аутентификации
 * @returns Реактивное состояние пользователя и методы аутентификации
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(getInitialUser())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const checkAuth = () => {
    if (typeof window === 'undefined' || user.value) return
    pipe(
      checkAuthStatus(),
      Effect.map(data =>
        data.authenticated && data.user ? data.user : null
      ),
      Effect.tap(userData =>
        Effect.sync(() => {
          if (userData) user.value = userData
        })
      ),
      Effect.runPromise
    )
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  return { user, loading, error, checkAuth, setUser }
})
