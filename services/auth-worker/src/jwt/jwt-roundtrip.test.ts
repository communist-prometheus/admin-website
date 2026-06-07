import { describe, expect, it } from 'vitest'
import { signSessionJwt } from './sign'
import { JWT_AUDIENCE, JWT_ISSUER } from './types'
import { verifySessionJwt } from './verify'

const SECRET = 'test-secret-do-not-reuse'
const NOW_MS = 1_780_000_000_000
const now = () => NOW_MS

describe('jwt roundtrip', () => {
  it('signs + verifies a valid token', async () => {
    const tok = await signSessionJwt({
      login: 'undeadliner',
      teams: ['admins'],
      secret: SECRET,
      now,
    })
    const claims = await verifySessionJwt(tok, { secret: SECRET, now })
    expect(claims?.login).toBe('undeadliner')
    expect(claims?.sub).toBe('undeadliner')
    expect(claims?.teams).toEqual(['admins'])
    expect(claims?.aud).toBe(JWT_AUDIENCE)
    expect(claims?.iss).toBe(JWT_ISSUER)
  })

  it('rejects a tampered body', async () => {
    const tok = await signSessionJwt({
      login: 'a',
      teams: ['admins'],
      secret: SECRET,
      now,
    })
    const [h, b, s] = tok.split('.')
    const tampered = `${h}.${b}aa.${s}`
    const claims = await verifySessionJwt(tampered, { secret: SECRET, now })
    expect(claims).toBeUndefined()
  })

  it('rejects a token signed with a different secret', async () => {
    const tok = await signSessionJwt({
      login: 'a',
      teams: ['admins'],
      secret: 'wrong',
      now,
    })
    const claims = await verifySessionJwt(tok, { secret: SECRET, now })
    expect(claims).toBeUndefined()
  })

  it('rejects an expired token', async () => {
    const tok = await signSessionJwt({
      login: 'a',
      teams: ['admins'],
      secret: SECRET,
      now,
      ttlSeconds: 10,
    })
    const future = () => NOW_MS + 60_000
    const claims = await verifySessionJwt(tok, {
      secret: SECRET,
      now: future,
    })
    expect(claims).toBeUndefined()
  })

  it('rejects a structurally malformed token', async () => {
    const claims = await verifySessionJwt('not.a.jwt', {
      secret: SECRET,
      now,
    })
    expect(claims).toBeUndefined()
  })

  it('rejects a token with only two segments', async () => {
    const claims = await verifySessionJwt('aa.bb', { secret: SECRET, now })
    expect(claims).toBeUndefined()
  })

  it('preserves multi-team membership in the claims', async () => {
    const tok = await signSessionJwt({
      login: 'a',
      teams: ['admins', 'editors'],
      secret: SECRET,
      now,
    })
    const claims = await verifySessionJwt(tok, { secret: SECRET, now })
    expect(claims?.teams).toEqual(['admins', 'editors'])
  })
})
