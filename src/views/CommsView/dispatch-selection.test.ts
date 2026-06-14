import { describe, expect, it } from 'vitest'
import { isAllSelected, toggleAll, toggleId } from './dispatch-selection'

describe('toggleId', () => {
  it('adds an id that is not selected', () => {
    expect(toggleId([1], 2)).toEqual([1, 2])
  })

  it('removes an id that is already selected', () => {
    expect(toggleId([1, 2], 1)).toEqual([2])
  })
})

describe('isAllSelected', () => {
  it('is true when every id is selected', () => {
    expect(isAllSelected([2, 1], [1, 2])).toBe(true)
  })

  it('is false when some id is missing', () => {
    expect(isAllSelected([1], [1, 2])).toBe(false)
  })

  it('is false when there is nothing to select', () => {
    expect(isAllSelected([], [])).toBe(false)
  })
})

describe('toggleAll', () => {
  it('selects every id when not all are selected', () => {
    expect(toggleAll([1], [1, 2, 3])).toEqual([1, 2, 3])
  })

  it('clears the selection when all are already selected', () => {
    expect(toggleAll([1, 2], [1, 2])).toEqual([])
  })
})
