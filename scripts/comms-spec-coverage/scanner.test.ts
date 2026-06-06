import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { findOrphans } from './scanner'

describe('findOrphans', () => {
  it('returns an empty list against the current spec (no orphans)', () => {
    expect(findOrphans(process.cwd())).toEqual([])
  })
})
