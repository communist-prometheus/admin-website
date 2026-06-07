import { describe, expect, it } from 'vitest'
import {
  buildLogoutCookie,
  buildSessionCookie,
  readSessionCookie,
  SESSION_COOKIE,
} from './cookie'

describe('buildSessionCookie', () => {
  it('emits every required attribute', () => {
    const value = buildSessionCookie('TOKEN', {
      domain: '.comprom.org',
      maxAgeSeconds: 86_400,
    })
    expect(value).toContain(`${SESSION_COOKIE}=TOKEN`)
    expect(value).toContain('Domain=.comprom.org')
    expect(value).toContain('Path=/')
    expect(value).toContain('HttpOnly')
    expect(value).toContain('Secure')
    expect(value).toContain('SameSite=Lax')
    expect(value).toContain('Max-Age=86400')
  })

  it('puts attributes in a fixed order so snapshot diffs stay stable', () => {
    const value = buildSessionCookie('T', {
      domain: '.example.com',
      maxAgeSeconds: 60,
    })
    expect(value).toBe(
      'comprom_session=T; Domain=.example.com; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=60'
    )
  })
})

describe('buildLogoutCookie', () => {
  it('uses Max-Age=0 to invalidate the cookie on the client', () => {
    const value = buildLogoutCookie('.comprom.org')
    expect(value).toContain('Max-Age=0')
    expect(value).toContain('Domain=.comprom.org')
    expect(value).toContain(`${SESSION_COOKIE}=`)
    expect(value).toContain('HttpOnly')
    expect(value).toContain('Secure')
  })
})

describe('readSessionCookie', () => {
  it('returns undefined when the header is missing', () => {
    expect(readSessionCookie(undefined)).toBeUndefined()
  })

  it('returns undefined when the header is empty', () => {
    expect(readSessionCookie('')).toBeUndefined()
  })

  it('returns undefined when the session cookie is not present', () => {
    expect(readSessionCookie('foo=bar; baz=qux')).toBeUndefined()
  })

  it('extracts the session value alone', () => {
    expect(readSessionCookie('comprom_session=ABC123')).toBe('ABC123')
  })

  it('extracts the session value when it is alongside other cookies', () => {
    expect(readSessionCookie('foo=bar; comprom_session=XYZ; other=zzz')).toBe(
      'XYZ'
    )
  })
})
