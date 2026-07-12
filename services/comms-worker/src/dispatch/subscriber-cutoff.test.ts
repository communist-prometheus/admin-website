import { describe, expect, it } from 'vitest'
import type { Subscriber } from '../subscribers/types'
import { subscriberCutoffMs } from './subscriber-cutoff'

const sub = (lastSentAt: string | undefined): Subscriber => ({
  id: 1,
  email: 'a@b.c',
  langs: ['ru'],
  messageLang: 'ru',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastSentAt,
  unsubscribedAt: undefined,
})

const GLOBAL = Date.parse('2026-07-04T00:00:00.000Z')

describe('subscriberCutoffMs', () => {
  /*
   * The watermark is per address now. A subscriber added mid-cycle is
   * seeded with the cutoff of the day they joined, and one whose send
   * failed keeps their old watermark — so the next tick replays exactly
   * what they missed, and nobody else is dragged back with them.
   */
  it('prefers the subscriber own last-sent stamp', () => {
    const own = '2026-07-11T09:00:00.000Z'
    expect(subscriberCutoffMs(sub(own), GLOBAL)).toBe(Date.parse(own))
  })

  it('falls back to the shared cutoff when the address was never mailed', () => {
    expect(subscriberCutoffMs(sub(undefined), GLOBAL)).toBe(GLOBAL)
  })

  it('falls back to the shared cutoff when the stamp is unparseable', () => {
    expect(subscriberCutoffMs(sub('not-a-date'), GLOBAL)).toBe(GLOBAL)
  })

  it('returns undefined when there is no watermark anywhere', () => {
    expect(subscriberCutoffMs(sub(undefined), undefined)).toBeUndefined()
  })
})
