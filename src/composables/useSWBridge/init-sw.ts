import { Duration, Effect, Schedule } from 'effect'
import type { SWAuthor } from './build-sw-config'
import { initAttempt } from './init-attempt'
import { log } from './sw-log'
import { markSWReady } from './sw-ready'

const RETRIES = 4
const DELAY = Duration.seconds(2)

const retrySchedule = Schedule.addDelay(Schedule.recurs(RETRIES), () => DELAY)

/**
 * Build the full init pipeline with retry and logging.
 * @param token - GitHub access token
 * @param author - Optional git commit author info
 * @returns Effect that always resolves (marks SW ready)
 */
const initPipeline = (token: string, author?: SWAuthor) =>
  initAttempt(token, author).pipe(
    Effect.tapError(err =>
      Effect.sync(() => log('warn', `SW init: ${err.message}`))
    ),
    Effect.retry(retrySchedule),
    Effect.tap(() => markSWReady()),
    Effect.catchAll(() =>
      Effect.sync(() => {
        log('error', 'SW init exhausted retries')
        markSWReady()
      })
    )
  )

/**
 * Send git config to the SW with retry.
 * Marks ready on success or after all retries exhaust.
 * @param token - GitHub access token
 * @param author - Optional git commit author info
 */
export const initSWWithToken = async (
  token: string,
  author?: SWAuthor
): Promise<void> => {
  if (typeof globalThis.document === 'undefined') {
    markSWReady()
    return
  }
  await Effect.runPromise(initPipeline(token, author))
}
