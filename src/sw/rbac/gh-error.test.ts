import { describe, expect, it } from 'vitest'
import { readGhError } from './gh-error'

describe('readGhError', () => {
  it('returns the message from a plain GH error envelope', () => {
    const raw = JSON.stringify({ message: 'Not Found' })
    expect(readGhError(raw)).toBe('Not Found')
  })

  it('joins message + first errors[].message for validation failures', () => {
    const raw = JSON.stringify({
      message: 'Validation Failed',
      errors: [
        {
          resource: 'Invitation',
          code: 'invalid',
          message: 'email is invalid',
        },
      ],
    })
    expect(readGhError(raw)).toBe('Validation Failed: email is invalid')
  })

  it('falls through to the raw text when JSON parse fails', () => {
    expect(readGhError('not json')).toBe('not json')
  })

  it('returns the raw text when the parsed object has no message', () => {
    expect(readGhError('{}')).toBe('{}')
  })

  it('handles errors[] with no message field', () => {
    const raw = JSON.stringify({
      message: 'Validation Failed',
      errors: [{ resource: 'Invitation', code: 'invalid' }],
    })
    expect(readGhError(raw)).toBe('Validation Failed')
  })
})
