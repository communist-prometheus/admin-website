import { Effect, Option, pipe } from 'effect'
import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { mintSession } from './mint-session'
import { getMockUser } from './mock-user'
import { saveProfile } from './profile-cache'
import { loadToken, saveToken } from './token-storage'

/**
 * Resolve auth token from dev env or localStorage.
 * @returns Token Option from dev env or localStorage
 */
const resolveToken = (): Option.Option<string> =>
  pipe(
    Option.fromNullable(import.meta.env.VITE_DEV_TOKEN),
    Option.tap(t => {
      saveToken(t)
      return Option.some(t)
    }),
    Option.orElse(() => Option.fromNullable(loadToken()))
  )

const isMockAuth = () => import.meta.env.VITE_MOCK_AUTH === 'true'

const fetchAndCache = (token: string) =>
  Effect.tryPromise(() => fetchGitHubUser(token)).pipe(
    Effect.tap(u =>
      Effect.sync(() => {
        saveProfile({
          username: u.username,
          name: u.name,
          avatar: u.avatar,
        })
        // Returning visitor with a persisted gh_token: refresh the
        // *.comprom.org SSO cookie in case it was never minted or
        // has since expired. Fire-and-forget — failure here just
        // delays the next cookie-gated worker call by one 401-retry.
        void mintSession(token)
      })
    )
  )

/**
 * Get initial user from token or mock.
 * Saves profile to cache on successful fetch.
 * @returns Promise resolving to User or null
 */
export const getInitialUser = (): Promise<User | null> =>
  pipe(
    resolveToken(),
    Option.match({
      onNone: () => Effect.succeed<User | null>(null),
      onSome: token =>
        isMockAuth()
          ? Effect.sync<User>(() => getMockUser())
          : fetchAndCache(token).pipe(
              Effect.catchAll(() => Effect.succeed<User | null>(null))
            ),
    }),
    Effect.runPromise
  )
