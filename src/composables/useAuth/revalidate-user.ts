import type { User } from '@/types/user'
import { getCachedUser } from './cached-user'
import { ensureFreshToken } from './ensure-fresh-token'
import { fetchGitHubUser, GitHubAuthError } from './fetch-github-user'
import { saveProfile } from './profile-cache'

const cache = (user: User): User => {
  saveProfile({
    username: user.username,
    name: user.name,
    avatar: user.avatar,
  })
  return user
}

/*
 * Auth failure -> undefined so the caller logs out. Transient failure ->
 * fall back to the cached user so an offline blip on a returning tab does
 * not force a re-login (undefined only if there is no cached user either).
 */
const tryFetch = async (token: string): Promise<User | undefined> => {
  try {
    return cache(await fetchGitHubUser(token))
  } catch (error) {
    return error instanceof GitHubAuthError ? undefined : getCachedUser()
  }
}

/**
 * Revalidate the cached user against GitHub, first renewing the access
 * token if it is near expiry. Returns undefined when the session is dead
 * (the caller then logs out), which keeps a returning tab from running on
 * an expired token.
 * @returns Fresh User, or undefined on a dead session / network failure
 */
export const revalidateUser = async (): Promise<User | undefined> => {
  const token = await ensureFreshToken()
  return token ? tryFetch(token) : undefined
}
