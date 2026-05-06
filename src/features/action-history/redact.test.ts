import { describe, expect, it } from 'vitest'
import { redactEntry, stampEntry } from './redact'
import type { NavigationEntry, RecordableEntry, SaveEntry } from './types'

describe('redactEntry', () => {
  it('truncates long error message on save entries', () => {
    const long = 'x'.repeat(700)
    const entry: Omit<SaveEntry, 'id' | 'ts'> = {
      kind: 'save',
      action: 'save',
      path: 'blog/foo.md',
      status: 'failed',
      errorMessage: long,
    }
    const out = redactEntry(entry) as Omit<SaveEntry, 'id' | 'ts'>
    expect(out.errorMessage?.length).toBe(501)
    expect(out.errorMessage?.endsWith('…')).toBe(true)
  })

  it('truncates sw-error reason at 500 chars', () => {
    const entry: RecordableEntry = {
      kind: 'sw-error',
      reason: 'a'.repeat(800),
    }
    const out = redactEntry(entry) as { reason: string }
    expect(out.reason.length).toBe(501)
  })

  it('does not include any "content" field on save entries', () => {
    const entry: Omit<SaveEntry, 'id' | 'ts'> = {
      kind: 'save',
      action: 'commit',
      path: 'pages/about.en.md',
      status: 'ok',
    }
    const out = redactEntry(entry)
    expect(JSON.stringify(out)).not.toMatch(/content/i)
  })

  it('passes navigation entries through unchanged', () => {
    const entry: Omit<NavigationEntry, 'id' | 'ts'> = {
      kind: 'navigation',
      from: '/a',
      to: '/b',
    }
    expect(redactEntry(entry)).toEqual(entry)
  })
})

describe('stampEntry', () => {
  it('attaches an id and ts to the redacted entry', () => {
    const out = stampEntry(
      { kind: 'auth', action: 'login' },
      1_700_000_000_000,
      () => 'fixed-id'
    )
    expect(out).toEqual({
      kind: 'auth',
      action: 'login',
      id: 'fixed-id',
      ts: 1_700_000_000_000,
    })
  })
})
