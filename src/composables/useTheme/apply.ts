import { Match } from 'effect'
import type { ThemeMode } from './types'

const ATTR = 'data-theme'

/**
 * Reflect the current theme choice on the document root.
 *
 * - `system` removes the attribute so `prefers-color-scheme` rules
 *   in `_variables.scss` take over.
 * - `light` / `dark` sets `data-theme="light|dark"` to override.
 *
 * Safe to call before app mount — runs synchronously against
 * `document.documentElement`. Becomes a no-op outside the browser.
 *
 * @param mode - The mode to apply
 */
export const applyTheme = (mode: ThemeMode): void => {
  const root = globalThis.document?.documentElement
  void Match.value(mode).pipe(
    Match.when('system', () => root?.removeAttribute(ATTR)),
    Match.orElse(m => root?.setAttribute(ATTR, m))
  )
}
