import { parseJsonAs } from '@/validation/decode'
import type { CachedProfile } from '@/validation/schemas/user'
import { CachedProfileSchema } from '@/validation/schemas/user'

export type { CachedProfile } from '@/validation/schemas/user'

const PROFILE_KEY = 'gh_user_profile'

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
  return parseJsonAs(CachedProfileSchema)(raw)
}

/**
 * Remove cached user profile from localStorage.
 */
export const clearProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY)
}
