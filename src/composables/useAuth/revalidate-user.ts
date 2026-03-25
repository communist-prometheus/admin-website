import { Effect, Option, pipe } from 'effect'
import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { saveProfile } from './profile-cache'
import { loadToken } from './token-storage'

const fetchAndCache = (token: string) =>
  Effect.tryPromise(() => fetchGitHubUser(token)).pipe(
    Effect.tap(u =>
      Effect.sync(() =>
        saveProfile({
          username: u.username,
          name: u.name,
          avatar: u.avatar,
        })
      )
    )
  )

/**
 * Revalidate user by fetching fresh profile from GitHub.
 * Updates the profile cache on success.
 * @returns Fresh User or undefined on failure
 */
export const revalidateUser = (): Promise<User | undefined> =>
  pipe(
    Option.fromNullable(loadToken()),
    Option.match({
      onNone: () => Effect.succeed<User | undefined>(undefined),
      onSome: (t: string) =>
        fetchAndCache(t).pipe(
          Effect.catchAll(() => Effect.succeed<User | undefined>(undefined))
        ),
    }),
    Effect.runPromise
  )
