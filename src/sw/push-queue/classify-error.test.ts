import { describe, expect, it } from 'vitest'
import { classifyPushError } from './classify-error'

describe('classifyPushError', () => {
  it('detects fast-forward rejection', () => {
    expect(classifyPushError(new Error('not a fast-forward'))).toBe(
      'non-fast-forward'
    )
    expect(classifyPushError(new Error('fetch first'))).toBe(
      'non-fast-forward'
    )
  })

  it('detects auth failures', () => {
    expect(classifyPushError(new Error('401 Unauthorized'))).toBe('auth')
    expect(classifyPushError(new Error('403 Forbidden'))).toBe('auth')
    expect(classifyPushError(new Error('Bad credentials'))).toBe('auth')
  })

  it('detects validation failures', () => {
    expect(classifyPushError(new Error('422 Unprocessable Entity'))).toBe(
      'validation'
    )
    expect(classifyPushError(new Error('validation failed'))).toBe(
      'validation'
    )
  })

  it('detects network failures', () => {
    expect(classifyPushError(new Error('Failed to fetch'))).toBe('network')
    expect(classifyPushError(new Error('NetworkError'))).toBe('network')
    expect(classifyPushError(new Error('ENOTFOUND'))).toBe('network')
  })

  it('falls back to unknown', () => {
    expect(classifyPushError(new Error('something weird'))).toBe('unknown')
    expect(classifyPushError('not even an error')).toBe('unknown')
    expect(classifyPushError(undefined)).toBe('unknown')
  })

  it('precedence: fast-forward beats auth when both match', () => {
    expect(
      classifyPushError(new Error('non-fast-forward — 403 Forbidden'))
    ).toBe('non-fast-forward')
  })
})
