import type { LogCategory } from '../protocol'
import { log } from './logger'

/**
 * Fire-and-forget a promise and **log** anything that escapes its
 * own internal handlers. The previous in-line `.catch(() => {})`
 * idiom did three damaging things at once:
 *
 *   1. discarded the rejection silently (no telemetry, no console),
 *   2. claimed at the call site that errors were "expected" when
 *      the inner function had no error handling at all,
 *   3. let the linter relax — empty arrow bodies are now banned by
 *      `noEmptyBlockStatements`, this helper is the only sanctioned
 *      escape hatch for genuinely background work.
 *
 * Use ONLY when the caller cannot await the promise (background
 * refresh during another async flow). For everything else, just
 * `await` and propagate.
 * @param p - The promise to detach from the call stack
 * @param cat - Logger category for the rejection (typed enum)
 */
export const fireAndLog = (p: Promise<unknown>, cat: LogCategory): void => {
  p.then(undefined, e => {
    const msg = e instanceof Error ? e.message : String(e)
    log('error', cat, `unhandled in fire-and-forget: ${msg}`)
  })
}
