import type { ThemeMode } from './types'

const KEY = 'admin_theme'

const isMode = (v: string): v is ThemeMode =>
  v === 'system' || v === 'light' || v === 'dark'

/**
 * Read the stored theme preference from localStorage.
 * @returns The stored mode, or `system` if absent or malformed
 */
export const readStoredTheme = (): ThemeMode => {
  const raw = globalThis.localStorage?.getItem(KEY) ?? undefined
  return raw !== undefined && isMode(raw) ? raw : 'system'
}

/**
 * Persist the theme preference to localStorage.
 * @param mode - The mode to store
 */
export const writeStoredTheme = (mode: ThemeMode): void => {
  globalThis.localStorage?.setItem(KEY, mode)
}
