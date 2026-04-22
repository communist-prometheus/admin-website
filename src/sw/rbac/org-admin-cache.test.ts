import { describe, expect, it } from 'vitest'
import { isOrgAdmin, setOrgAdmins } from './org-admin-cache'

describe('org-admin-cache', () => {
  it('returns false when no admins are cached', () => {
    setOrgAdmins([])
    expect(isOrgAdmin('alice')).toBe(false)
  })

  it('returns true for a cached admin', () => {
    setOrgAdmins(['alice', 'bob'])
    expect(isOrgAdmin('alice')).toBe(true)
  })

  it('is case-insensitive', () => {
    setOrgAdmins(['Alice'])
    expect(isOrgAdmin('alice')).toBe(true)
    expect(isOrgAdmin('ALICE')).toBe(true)
  })

  it('replacing the list evicts previous entries', () => {
    setOrgAdmins(['alice'])
    setOrgAdmins(['bob'])
    expect(isOrgAdmin('alice')).toBe(false)
    expect(isOrgAdmin('bob')).toBe(true)
  })
})
