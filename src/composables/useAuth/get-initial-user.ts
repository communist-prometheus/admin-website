import type { User } from '@/types/user'
import { ensureFreshToken } from './ensure-fresh-token'
import { fetchGitHubUser, GitHubAuthError } from './fetch-github-user'
import { mintSession } from './mint-session'
import { getMockUser } from './mock-user'
import { saveProfile } from './profile-cache'
import { clearToken, saveToken } from './token-storage'

const isMockAuth = (): boolean => import.meta.env.VITE_MOCK_AUTH === 'true'

const persistDevToken = (): void => {
  const dev = import.meta.env.VITE_DEV_TOKEN
  void (dev ? saveToken(dev) : undefined)
}

const cacheAndMint = (user: User): User => {
  saveProfile({
    username: user.username,
    name: user.name,
    avatar: user.avatar,
  })
  // Refresh the *.comprom.org SSO cookie so cookie-gated workers carry
  // auth. Fire-and-forget — failure only delays the next call by a retry.
  void mintSession(user.accessToken)
  return user
}

/*
 * A GitHubAuthError means the token is dead despite the refresh attempt
 * (revoked authorization, or the refresh token itself expired): clear the
 * corpse so the app treats the user as logged-out instead of looping on a
 * bad token. A transient error (network/5xx) leaves the session intact so a
 * blip at boot does not force a re-login.
 */
const fetchUser = async (token: string): Promise<User | null> => {
  try {
    return cacheAndMint(await fetchGitHubUser(token))
  } catch (error) {
    void (error instanceof GitHubAuthError ? clearToken() : undefined)
    return null
  }
}

const fromRealSession = async (): Promise<User | null> => {
  const token = await ensureFreshToken()
  return token ? fetchUser(token) : null
}

/**
 * Resolve the initial user, guaranteeing a fresh (renewed if needed)
 * access token before hitting GitHub. Returns null when no live session
 * exists so the caller routes to login.
 * @returns The authenticated user, or null
 */
export const getInitialUser = async (): Promise<User | null> => {
  persistDevToken()
  return isMockAuth() ? getMockUser() : fromRealSession()
}
