import { describe, expect, it } from 'vitest'
import { filesFromError } from './files-from-error'

describe('filesFromError', () => {
  it('returns the filepaths array carried on data', () => {
    const error = { data: { filepaths: ['a.md', 'b.md'] } }
    expect(filesFromError(error)).toEqual(['a.md', 'b.md'])
  })

  it('drops non-string entries', () => {
    const error = { data: { filepaths: ['a.md', 42, undefined, 'b.md'] } }
    expect(filesFromError(error)).toEqual(['a.md', 'b.md'])
  })

  it('returns [] when data is missing', () => {
    expect(filesFromError(new Error('boom'))).toEqual([])
    expect(filesFromError(undefined)).toEqual([])
    expect(filesFromError({ no: 'data-here' })).toEqual([])
  })

  it('returns [] when filepaths is not an array', () => {
    expect(filesFromError({ data: { filepaths: 'hello' } })).toEqual([])
    expect(filesFromError({ data: 'hello' })).toEqual([])
  })
})
