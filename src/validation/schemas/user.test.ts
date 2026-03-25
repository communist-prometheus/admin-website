import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { CachedProfileSchema } from './user'

const decode = Schema.decodeUnknownEither(CachedProfileSchema)

/** Tests for CachedProfileSchema validation. */
describe('CachedProfileSchema', () => {
  it('decodes valid profile', () => {
    const input = {
      username: 'alice',
      name: 'Alice',
      avatar: 'https://example.com/a.png',
    }
    const result = decode(input)
    expect(result._tag).toBe('Right')
  })

  it('rejects missing fields', () => {
    const result = decode({ username: 'alice' })
    expect(result._tag).toBe('Left')
  })

  it('rejects wrong types', () => {
    const input = { username: 1, name: true, avatar: null }
    const result = decode(input)
    expect(result._tag).toBe('Left')
  })
})
