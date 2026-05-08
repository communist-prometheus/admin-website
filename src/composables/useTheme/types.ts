/**
 * Three-state theme preference. `system` follows
 * `prefers-color-scheme`, the other two pin a value regardless of OS.
 */
export type ThemeMode = 'system' | 'light' | 'dark'
