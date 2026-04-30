import { describe, expect, it } from 'vitest'
import { signJwt } from './jwt'
import { verifyJwt } from './jwt-verify'

const SECRET = 'test-secret-32-chars-long-or-better-1234'

describe('jwt sign + verify', () => {
  it('round-trips a valid token', async () => {
    const token = await signJwt('alice', SECRET)
    const payload = await verifyJwt(token, SECRET)
    expect(payload?.sub).toBe('alice')
    expect(payload?.aud).toBe('log-collector')
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('rejects a token signed with a different secret', async () => {
    const token = await signJwt('alice', SECRET)
    expect(await verifyJwt(token, 'other-secret')).toBeUndefined()
  })

  it('rejects a malformed token', async () => {
    expect(await verifyJwt('garbage', SECRET)).toBeUndefined()
    expect(await verifyJwt('', SECRET)).toBeUndefined()
    expect(await verifyJwt('a.b', SECRET)).toBeUndefined()
  })

  it('rejects a tampered payload', async () => {
    const token = await signJwt('alice', SECRET)
    const parts = token.split('.')
    const tampered = `${parts[0]}.${parts[1]}x.${parts[2]}`
    expect(await verifyJwt(tampered, SECRET)).toBeUndefined()
  })
})
