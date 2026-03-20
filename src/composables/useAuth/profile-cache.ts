const PROFILE_KEY = 'gh_user_profile'

/**
 * Cached user profile without access token.
 */
export interface CachedProfile {
  readonly username: string
  readonly name: string
  readonly avatar: string
}

/**
 * Save user profile to localStorage.
 * @param profile - User profile to cache
 */
export const saveProfile = (profile: CachedProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

/**
 * Load cached user profile from localStorage.
 * @returns Cached profile or undefined
 */
export const loadProfile = (): CachedProfile | undefined => {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return undefined
  return JSON.parse(raw) as CachedProfile
}

/**
 * Remove cached user profile from localStorage.
 */
export const clearProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY)
}
