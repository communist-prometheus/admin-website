import { describe, expect, it } from 'vitest'
import { signUnsubscribeToken, verifyUnsubscribeToken } from './token'

const SECRET = 'shhh-very-secret-1234567890abcdef'
const OTHER = 'a-different-secret-1234567890abcdef'

describe('signUnsubscribeToken', () => {
  it('produces an <id>.<sig> token of two non-empty parts', async () => {
    const t = await signUnsubscribeToken(42, SECRET)
    const parts = t.split('.')
    expect(parts).toHaveLength(2)
    expect(parts[0]).toBe('42')
    expect(parts[1]?.length).toBeGreaterThan(0)
  })

  it('is deterministic for the same (id, secret)', async () => {
    const a = await signUnsubscribeToken(42, SECRET)
    const b = await signUnsubscribeToken(42, SECRET)
    expect(a).toBe(b)
  })

  it('differs when the id changes', async () => {
    const a = await signUnsubscribeToken(42, SECRET)
    const b = await signUnsubscribeToken(43, SECRET)
    expect(a).not.toBe(b)
  })

  it('differs when the secret changes', async () => {
    const a = await signUnsubscribeToken(42, SECRET)
    const b = await signUnsubscribeToken(42, OTHER)
    expect(a).not.toBe(b)
  })
})

describe('verifyUnsubscribeToken', () => {
  it('round-trips id', async () => {
    const t = await signUnsubscribeToken(7, SECRET)
    expect(await verifyUnsubscribeToken(t, SECRET)).toEqual({ id: 7 })
  })

  it('returns undefined when the secret is wrong', async () => {
    const t = await signUnsubscribeToken(7, SECRET)
    expect(await verifyUnsubscribeToken(t, OTHER)).toBeUndefined()
  })

  it('returns undefined for a tampered signature', async () => {
    const t = await signUnsubscribeToken(7, SECRET)
    const [id, sig] = t.split('.')
    const flipped = `${sig?.[0] === 'a' ? 'b' : 'a'}${sig?.slice(1) ?? ''}`
    expect(
      await verifyUnsubscribeToken(`${id}.${flipped}`, SECRET)
    ).toBeUndefined()
  })

  it('returns undefined when the embedded id is rewritten', async () => {
    const t = await signUnsubscribeToken(7, SECRET)
    const sig = t.split('.')[1]
    expect(await verifyUnsubscribeToken(`8.${sig}`, SECRET)).toBeUndefined()
  })

  it('returns undefined for malformed token shapes', async () => {
    expect(await verifyUnsubscribeToken('', SECRET)).toBeUndefined()
    expect(await verifyUnsubscribeToken('abc', SECRET)).toBeUndefined()
    expect(await verifyUnsubscribeToken('1.2.3', SECRET)).toBeUndefined()
    expect(await verifyUnsubscribeToken('x.sig', SECRET)).toBeUndefined()
  })
})
