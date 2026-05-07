import { describe, expect, it } from 'vitest'
import { renderHistoryJson, serializeHistory } from './serialize'
import type { ActionEntry } from './types'

const sample: ActionEntry[] = [
  {
    id: '1',
    ts: 1_700_000_000_000,
    kind: 'navigation',
    from: '/',
    to: '/content',
  },
  {
    id: '2',
    ts: 1_700_000_001_000,
    kind: 'save',
    action: 'commit',
    path: 'blog/foo.md',
    status: 'ok',
  },
]

describe('serializeHistory', () => {
  it('emits the v1 schema tag', () => {
    const s = serializeHistory(sample, 1_700_000_002_000)
    expect(s.schema).toBe('admin-action-history/v1')
  })

  it('records the wall-clock time as ISO 8601', () => {
    const s = serializeHistory(sample, 1_700_000_002_000)
    expect(s.capturedAt).toBe(new Date(1_700_000_002_000).toISOString())
  })

  it('reports the entry count', () => {
    const s = serializeHistory(sample, 1_700_000_002_000)
    expect(s.entryCount).toBe(2)
  })

  it('preserves the entries verbatim and in order', () => {
    const s = serializeHistory(sample, 1_700_000_002_000)
    expect(s.entries).toEqual(sample)
  })
})

describe('renderHistoryJson', () => {
  it('produces stable, indented JSON ending with a newline', () => {
    const out = renderHistoryJson(sample, 1_700_000_002_000)
    expect(out.endsWith('\n')).toBe(true)
    expect(JSON.parse(out)).toMatchObject({
      schema: 'admin-action-history/v1',
      entryCount: 2,
    })
  })
})
