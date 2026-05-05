import { Data } from 'effect'
import { describe, expect, it } from 'vitest'
import { describeError } from './describe-error'

class TaglessTaggedError extends Data.TaggedError('ConfigMissingError')<
  Record<string, never>
> {}

class WithCause extends Data.TaggedError('GitError')<{
  readonly operation: string
  readonly cause: unknown
}> {}

describe('describeError', () => {
  it('returns the message of a regular Error', () => {
    expect(describeError(new Error('boom'))).toBe('boom')
  })

  it('returns the literal when a string is thrown', () => {
    expect(describeError('boom')).toBe('boom')
  })

  /*
   * The opaque-error regression: Effect's TaggedError without a
   * message field made the runtime fall back to "An error has
   * occurred" — and the editor saw that string with no clue what
   * actually went wrong.
   */
  it('uses _tag when an Effect TaggedError has no message field', () => {
    expect(describeError(new TaglessTaggedError({}))).toBe(
      'ConfigMissingError'
    )
  })

  it('combines _tag with the inner cause for nested Effect errors', () => {
    const cause = new Error('mkdir EEXIST')
    expect(
      describeError(
        new WithCause({
          operation: 'init',
          cause,
        })
      )
    ).toBe('GitError: mkdir EEXIST')
  })

  it('falls back to JSON when the value has no usable fields', () => {
    expect(describeError({ a: 1, b: 'two' })).toBe('{"a":1,"b":"two"}')
  })
})
