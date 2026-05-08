import { beforeEach, describe, expect, it } from 'vitest'
import { readStoredTheme, writeStoredTheme } from './storage'

describe('useTheme storage', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  it('returns "system" when nothing stored', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('round-trips a stored value', () => {
    writeStoredTheme('dark')
    expect(readStoredTheme()).toBe('dark')
  })

  it('falls back to "system" on a malformed value', () => {
    globalThis.localStorage.setItem('admin_theme', 'neon-pink')
    expect(readStoredTheme()).toBe('system')
  })
})
