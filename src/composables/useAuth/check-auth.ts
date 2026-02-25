import { Effect, pipe } from 'effect'
import type { User } from '@/types/user'

export const checkAuthStatus = () =>
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
