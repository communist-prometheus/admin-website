import { describe, expect, it } from 'vitest'
import { isMergeConflict, isUnrelatedHistories } from './merge-classify'

const named = (name: string): Error => {
  const e = new Error(name)
  e.name = name
  return e
}

describe('merge-classify', () => {
  it('detects isomorphic-git merge conflicts', () => {
    expect(isMergeConflict(named('MergeConflictError'))).toBe(true)
    expect(isMergeConflict(named('MergeNotSupportedError'))).toBe(false)
    expect(isMergeConflict(new Error('plain'))).toBe(false)
    expect(isMergeConflict('not an error')).toBe(false)
  })

  it('detects unrelated histories (force-pushed remote)', () => {
    expect(isUnrelatedHistories(named('MergeNotSupportedError'))).toBe(true)
    expect(isUnrelatedHistories(named('MergeConflictError'))).toBe(false)
    expect(isUnrelatedHistories(new Error('plain'))).toBe(false)
    expect(isUnrelatedHistories(undefined)).toBe(false)
  })
})
