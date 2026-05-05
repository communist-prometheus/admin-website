import { describe, expect, it } from 'vitest'
import { sliceLogByStep, tailLog } from './slice-log'

const SAMPLE = `2026-05-04T20:03:08.6887Z ##[group]Run bun install --frozen-lockfile
2026-05-04T20:03:08.6887Z bun install --frozen-lockfile
2026-05-04T20:03:10.5786Z $ husky
2026-05-04T20:03:10.6717Z 848 packages installed
2026-05-04T20:03:10.6865Z ##[group]Run bun run build
2026-05-04T20:03:10.6865Z $ bun run build
2026-05-04T20:03:11.0249Z $ biome format . && biome check . && eslint . && astro check && astro build
2026-05-04T20:03:16.5731Z bad indentation of a mapping entry
2026-05-04T20:03:16.5732Z   Location: src/content/blog/x/index.it.md:2:439
2026-05-04T20:03:16.5938Z error: script "build" exited with code 1`

describe('sliceLogByStep', () => {
  it('groups lines into the step that started them', () => {
    const out = sliceLogByStep(SAMPLE)

    expect(Object.keys(out)).toEqual([
      'bun install --frozen-lockfile',
      'bun run build',
    ])
    expect(out['bun install --frozen-lockfile']).toContain(
      '848 packages installed'
    )
    expect(out['bun run build']).toContain(
      'bad indentation of a mapping entry'
    )
  })

  it('returns an empty record when the log has no group markers', () => {
    const out = sliceLogByStep('one\ntwo\nthree')
    expect(out).toEqual({})
  })
})

describe('tailLog', () => {
  it('keeps the last N lines', () => {
    const text = Array.from({ length: 50 }, (_, i) => `line-${i}`).join('\n')
    const tail = tailLog(text, 10)
    expect(tail.split('\n')).toHaveLength(10)
    const tailLines = tail.split('\n')
    expect(tailLines[0]).toBe('line-40')
    expect(tailLines[tailLines.length - 1]).toBe('line-49')
  })

  it('returns the whole log when shorter than the limit', () => {
    expect(tailLog('a\nb\nc', 10)).toBe('a\nb\nc')
  })
})
