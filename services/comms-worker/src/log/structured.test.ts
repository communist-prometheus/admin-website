import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { logEvent, maskEmail, scrubTokenQuery } from './structured'

let logSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
})

afterEach(() => {
  logSpy.mockRestore()
})

describe('scrubTokenQuery', () => {
  it('replaces the value of every t= query parameter', () => {
    expect(scrubTokenQuery('https://x/unsubscribe?t=secret&s=42')).toBe(
      'https://x/unsubscribe?t=…&s=42'
    )
  })

  it('keeps URLs without a t= parameter intact', () => {
    expect(scrubTokenQuery('https://x/path?other=1')).toBe(
      'https://x/path?other=1'
    )
  })

  it('handles bare query strings (no scheme)', () => {
    expect(scrubTokenQuery('t=abcd&id=7')).toBe('t=…&id=7')
  })

  it('echoes non-URL strings unchanged', () => {
    expect(scrubTokenQuery('hello world')).toBe('hello world')
  })
})

describe('maskEmail', () => {
  it('redacts the local part but keeps the domain visible', () => {
    expect(maskEmail('reader@example.test')).toBe('…@example.test')
    expect(maskEmail('a@b.c')).toBe('…@b.c')
  })

  it('returns "…" for unparseable input', () => {
    expect(maskEmail('not-an-email')).toBe('…')
    expect(maskEmail('')).toBe('…')
  })
})

describe('logEvent', () => {
  it('emits canonical JSON with the evt key first', () => {
    logEvent('tick.start', { tickAt: '2026-06-06T09:00:00.000Z' })
    expect(logSpy).toHaveBeenCalledTimes(1)
    const printed = (logSpy.mock.calls[0]?.[0] as string) ?? ''
    expect(printed.startsWith('{"evt":"tick.start"')).toBe(true)
    expect(JSON.parse(printed)).toEqual({
      evt: 'tick.start',
      tickAt: '2026-06-06T09:00:00.000Z',
    })
  })

  it('masks `email` fields at any depth', () => {
    logEvent('webhook.applied', {
      subscriberId: 42,
      email: 'reader@example.test',
    })
    const out = JSON.parse(
      (logSpy.mock.calls[0]?.[0] as string) ?? '{}'
    ) as Record<string, unknown>
    expect(out.email).toBe('…@example.test')
    expect(out.subscriberId).toBe(42)
  })

  it('scrubs `t=` from `url` fields', () => {
    logEvent('unsubscribe.rejected', {
      url: 'https://lists.comprom.org/unsubscribe?t=tok',
    })
    const out = JSON.parse(
      (logSpy.mock.calls[0]?.[0] as string) ?? '{}'
    ) as Record<string, string>
    expect(out.url).toBe('https://lists.comprom.org/unsubscribe?t=…')
  })

  it('emits an empty payload as just the evt key', () => {
    logEvent('tick.done')
    expect(JSON.parse((logSpy.mock.calls[0]?.[0] as string) ?? '{}')).toEqual(
      {
        evt: 'tick.done',
      }
    )
  })

  it('round-trips arbitrary non-PII payloads untouched', () => {
    logEvent('tick.done', { sent: 5, failed: 0, skipped: 12, ms: 4231 })
    expect(JSON.parse((logSpy.mock.calls[0]?.[0] as string) ?? '{}')).toEqual(
      {
        evt: 'tick.done',
        sent: 5,
        failed: 0,
        skipped: 12,
        ms: 4231,
      }
    )
  })
})
