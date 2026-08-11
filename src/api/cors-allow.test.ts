import { describe, expect, it } from 'vitest'
import { isAllowedOrigin, isAllowedTarget } from './cors-allow'

describe('isAllowedOrigin', () => {
  it('allows every admin origin — prod, dev, and dev-admin-v2 (redesign)', () => {
    for (const origin of [
      'https://admin.comprom.org',
      'https://dev-admin.comprom.org',
      'https://dev-admin-v2.comprom.org',
    ])
      expect(isAllowedOrigin(origin)).toBe(true)
  })

  it('allows localhost / 127.0.0.1 for local dev + e2e', () => {
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('http://127.0.0.1:4321')).toBe(true)
  })

  it('rejects any other origin (no open proxy)', () => {
    for (const origin of [
      'https://evil.com',
      'https://comprom.org',
      'https://dev-admin-v2.comprom.org.evil.com',
      'http://admin.comprom.org',
    ])
      expect(isAllowedOrigin(origin)).toBe(false)
  })
})

describe('isAllowedTarget', () => {
  it('permits only github.com git smart-HTTP endpoints', () => {
    for (const path of [
      'github.com/communist-prometheus/public-website-content/info/refs',
      'github.com/communist-prometheus/public-website-content/git-upload-pack',
      'github.com/communist-prometheus/public-website-content/git-receive-pack',
    ])
      expect(isAllowedTarget(path)).toBe(true)
  })

  it('rejects non-git and non-github targets (SSRF guard)', () => {
    for (const path of [
      'api.github.com/repos/communist-prometheus/tickets',
      'github.com/communist-prometheus/tickets/contents/settings/secrets.json',
      'evil.com/steal',
      'github.com/o/r/info/refs/../../etc',
    ])
      expect(isAllowedTarget(path)).toBe(false)
  })
})
