import { describe, expect, it } from 'vitest'
import { pushRejection } from './push-rejection'

describe('pushRejection', () => {
  it('passes a clean push (all refs ok)', () => {
    expect(
      pushRejection({ ok: true, refs: { 'refs/heads/master': { ok: true } } })
    ).toBeUndefined()
    expect(pushRejection({ ok: true })).toBeUndefined()
    expect(pushRejection({})).toBeUndefined()
  })

  it('detects a per-ref rejection even when error is absent', () => {
    // The exact silent-loss shape: unpack ok, ref rejected.
    expect(
      pushRejection({
        ok: true,
        error: undefined,
        refs: {
          'refs/heads/master': {
            ok: false,
            error: 'missing necessary objects',
          },
        },
      })
    ).toBe('missing necessary objects')
  })

  it('falls back to a generic message when a ref fails without one', () => {
    expect(
      pushRejection({ refs: { 'refs/heads/master': { ok: false } } })
    ).toBe('ref update rejected')
  })

  it('surfaces the unpack-stage error', () => {
    expect(pushRejection({ error: 'unpack failed' })).toBe('unpack failed')
  })

  it('treats ok:false as a rejection', () => {
    expect(pushRejection({ ok: false })).toBe('ref update rejected')
  })
})
