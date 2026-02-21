import { Effect, pipe } from 'effect'
import { inject, onMounted, ref } from 'vue'
import type { InitialState, User } from '@/types/user'

const getInitialUser = (): User | null => {
  const ssrState = inject<InitialState | null>('initialState', null)
  if (ssrState?.user) return ssrState.user
  if (typeof window !== 'undefined') {
    const initialState = (
      globalThis as unknown as { __INITIAL_STATE__?: InitialState }
    ).__INITIAL_STATE__
    return initialState?.user || null
  }
  return null
}

const checkAuthStatus = () =>
  pipe(
    Effect.tryPromise({
      try: () => fetch('/api/auth/user'),
      catch: () => new Error('Failed to check auth'),
    }),
    Effect.flatMap(res =>
      Effect.tryPromise(
        () => res.json() as Promise<{ authenticated: boolean; user?: User }>
      )
    )
  )

/**
 * Vue composable for managing user authentication state.
 * Provides user data, loading state, and auth checking functionality.
 * @returns Auth state and methods
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
