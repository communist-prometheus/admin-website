import { describe, expect, it } from 'vitest'
import { payloadBoundKey } from './payload-key'

describe('payloadBoundKey', () => {
  it('keeps the same key for the same request, so a retry replays', async () => {
    const first = await payloadBoundKey('digest:t:0', '[{"to":["a@x.t"]}]')
    const again = await payloadBoundKey('digest:t:0', '[{"to":["a@x.t"]}]')
    expect(again).toBe(first)
  })

  it('never hands one key to two different payloads', async () => {
    const mine = await payloadBoundKey('digest:t:0', '[{"to":["a@x.t"]}]')
    const theirs = await payloadBoundKey('digest:t:0', '[{"to":["b@x.t"]}]')
    expect(theirs).not.toBe(mine)
  })

  it('still tells two requests of one payload apart by their scope', async () => {
    const chunk0 = await payloadBoundKey('digest:t:0', '[]')
    const chunk1 = await payloadBoundKey('digest:t:1', '[]')
    expect(chunk1).not.toBe(chunk0)
  })

  it('stays readable and within the header limit Resend accepts', async () => {
    const key = await payloadBoundKey(
      'digest:2026-10-03T09:00:16.000Z:0',
      '[]'
    )
    expect(key).toMatch(/^digest:2026-10-03T09:00:16\.000Z:0:[0-9a-f]{32}$/)
    expect(key.length).toBeLessThanOrEqual(256)
  })
})
