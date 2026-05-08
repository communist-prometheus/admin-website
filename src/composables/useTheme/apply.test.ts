import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyTheme } from './apply'

describe('applyTheme', () => {
  const root = globalThis.document.documentElement

  beforeEach(() => {
    root.removeAttribute('data-theme')
  })

  afterEach(() => {
    root.removeAttribute('data-theme')
  })

  it('removes data-theme on "system"', () => {
    root.setAttribute('data-theme', 'light')
    applyTheme('system')
    expect(root.hasAttribute('data-theme')).toBe(false)
  })

  it('sets data-theme="light" on "light"', () => {
    applyTheme('light')
    expect(root.getAttribute('data-theme')).toBe('light')
  })

  it('sets data-theme="dark" on "dark"', () => {
    applyTheme('dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
  })
})
