import { Match } from 'effect'
import { ref } from 'vue'
import { applyTheme } from './apply'
import { readStoredTheme, writeStoredTheme } from './storage'
import type { ThemeMode } from './types'

const mode = ref<ThemeMode>(readStoredTheme())

const cycle = (current: ThemeMode): ThemeMode =>
  Match.value(current).pipe(
    Match.when('system', () => 'light' as const),
    Match.when('light', () => 'dark' as const),
    Match.orElse(() => 'system' as const)
  )

const set = (next: ThemeMode): void => {
  mode.value = next
  writeStoredTheme(next)
  applyTheme(next)
}

/**
 * Read/write the admin's three-state theme preference. Backed by
 * localStorage; reflected on the document root via `data-theme`.
 *
 * @returns The reactive mode plus setter and cycler
 */
export const useTheme = () => ({
  mode,
  set,
  next: () => set(cycle(mode.value)),
})
