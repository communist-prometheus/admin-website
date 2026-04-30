import { describe, expect, it } from 'vitest'
import { resolveByStrategy } from './parse-markers'

const sample = [
  'before',
  '<<<<<<< HEAD',
  'mine line 1',
  'mine line 2',
  '=======',
  'theirs line 1',
  '>>>>>>> origin/develop',
  'after',
].join('\n')

describe('resolveByStrategy', () => {
  it('keeps "mine" lines when strategy is mine', () => {
    const out = resolveByStrategy(sample, 'mine')
    expect(out.split('\n')).toEqual([
      'before',
      'mine line 1',
      'mine line 2',
      'after',
    ])
  })

  it('keeps "theirs" lines when strategy is theirs', () => {
    const out = resolveByStrategy(sample, 'theirs')
    expect(out.split('\n')).toEqual(['before', 'theirs line 1', 'after'])
  })

  it('treats force-mine identically to mine', () => {
    expect(resolveByStrategy(sample, 'force-mine')).toBe(
      resolveByStrategy(sample, 'mine')
    )
  })

  it('passes content without markers through unchanged', () => {
    const plain = 'no markers here'
    expect(resolveByStrategy(plain, 'mine')).toBe(plain)
  })

  it('handles multiple conflict blocks', () => {
    const multi = [
      'a',
      '<<<<<<< HEAD',
      'mine1',
      '=======',
      'theirs1',
      '>>>>>>> r',
      'b',
      '<<<<<<< HEAD',
      'mine2',
      '=======',
      'theirs2',
      '>>>>>>> r',
      'c',
    ].join('\n')
    expect(resolveByStrategy(multi, 'theirs').split('\n')).toEqual([
      'a',
      'theirs1',
      'b',
      'theirs2',
      'c',
    ])
  })
})
