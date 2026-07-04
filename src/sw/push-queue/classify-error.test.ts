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

  it('detects isomorphic-git PushRejectedError wording', () => {
    // The literal message isomorphic-git 1.37.x throws on a
    // non-fast-forward push. The interposed "simple" used to break
    // the /not a fast-?forward/ pattern, misclassifying every NFF
    // push as `unknown` ("Unexpected error").
    expect(
      classifyPushError(
        new Error(
          'Push rejected because it was not a simple fast-forward. ' +
            'Use "force: true" to override.'
        )
      )
    ).toBe('non-fast-forward')
  })

  it('detects auth failures', () => {
    expect(classifyPushError(new Error('401 Unauthorized'))).toBe('auth')
    expect(classifyPushError(new Error('403 Forbidden'))).toBe('auth')
    expect(classifyPushError(new Error('Bad credentials'))).toBe('auth')
  })

  /*
   * GH006 = protected-branch push rejection. Same recovery as auth
   * (broaden access); previously read as `unknown` and the toast said
   * "Unexpected error", which read like a client bug.
   */
  it('detects protected-branch rejection (GH006)', () => {
    expect(
      classifyPushError(
        new Error(
          'GH006: Protected branch update failed for refs/heads/master'
        )
      )
    ).toBe('auth')
    expect(
      classifyPushError(
        new Error('remote: error: GH006: Protected branch update failed')
      )
    ).toBe('auth')
    expect(classifyPushError(new Error('protected branch'))).toBe('auth')
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
