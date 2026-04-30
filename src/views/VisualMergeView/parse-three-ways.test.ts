import { describe, expect, it } from 'vitest'
import { parseThreeWays } from './parse-three-ways'

const sample = [
  'header',
  '<<<<<<< HEAD',
  'mine line',
  '=======',
  'theirs line',
  '>>>>>>> origin/develop',
  'footer',
].join('\n')

describe('parseThreeWays', () => {
  it('returns ours / theirs / merged from a marker file', () => {
    const split = parseThreeWays(sample)
    expect(split.ours.split('\n')).toEqual([
      'header',
      'mine line',
      'footer',
    ])
    expect(split.theirs.split('\n')).toEqual([
      'header',
      'theirs line',
      'footer',
    ])
    expect(split.merged).toBe(split.ours)
  })

  it('passes marker-free content through identically', () => {
    const split = parseThreeWays('plain content')
    expect(split.ours).toBe('plain content')
    expect(split.theirs).toBe('plain content')
    expect(split.merged).toBe('plain content')
  })
})
