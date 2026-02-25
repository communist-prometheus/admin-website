import { Effect, pipe } from 'effect'
import { onMounted, ref } from 'vue'
import type { User } from '@/types/user'
import { checkAuthStatus } from './useAuth/check-auth'
import { getInitialUser } from './useAuth/get-initial-user'

/**
 * Authentication composable
 * @returns User state and auth methods
 */
export const useAuth = () => {
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

  onMounted(checkAuth)

  return { user, loading, error, checkAuth }
}
