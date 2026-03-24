import { Effect, Option, pipe } from 'effect'
import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { loadToken } from './token-storage'

/** Auth status response shape. */
interface AuthStatus {
  readonly authenticated: boolean
  readonly user?: User
}

const unauthenticated: AuthStatus = { authenticated: false }

const fetchUser = (token: string) =>
  Effect.tryPromise(() => fetchGitHubUser(token)).pipe(
    Effect.map((user): AuthStatus => ({ authenticated: true, user })),
    Effect.catchAll(() => Effect.succeed(unauthenticated))
  )

/**
 * Check authentication status via localStorage token.
 * @returns Auth status with optional user
 */
export const checkAuthStatus = (): Promise<AuthStatus> =>
  pipe(
    Option.fromNullable(loadToken()),
    Option.match({
      onNone: () => Effect.succeed(unauthenticated),
      onSome: fetchUser,
    }),
    Effect.runPromise
  )
