import { Match } from 'effect'
import type { PushFailureReason } from './push-failure-types'

const FAILED = 'Push failed'
const REJECTED = 'Push rejected'

/** Title + body copy paired with a push-failure reason. */
export type PushFailureCopy = {
  readonly title: string
  readonly message: string
}

/**
 * Map a push-failure reason to user-facing title and body copy.
 * Returning a record (not just a string) keeps the i18n boundary
 * obvious and lets the caller decorate the message with a target
 * ref without re-deriving the title.
 * @param reason Classified push failure reason.
 * @returns Title + message copy for the notification entry.
 */
export const pushFailureCopy = (reason: PushFailureReason): PushFailureCopy =>
  Match.value(reason).pipe(
    Match.when('network', () => ({
      title: FAILED,
      message: 'Network unreachable',
    })),
    Match.when('auth', () => ({
      title: FAILED,
      message: 'Re-authenticate to retry',
    })),
    Match.when('non-fast-forward', () => ({
      title: REJECTED,
      message: 'Remote moved on; pull or merge first',
    })),
    Match.when('validation', () => ({
      title: REJECTED,
      message: 'Server validation failed',
    })),
    Match.orElse(() => ({
      title: FAILED,
      message: 'Unexpected error',
    }))
  )
