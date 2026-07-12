import type { RetryDeps, RetryRefs } from './retry-failed-types'

export type {
  RetryDeps,
  RetryPhase,
  RetryRefs,
} from './retry-failed-types'

const message = (e: unknown, fallback: string): string =>
  e instanceof Error ? e.message : fallback

/**
 * Build the `load` action — fetch the addresses whose most recent attempt
 * failed.
 * @param r Reactive refs.
 * @param d Injected API calls.
 * @returns Async action.
 */
export const createLoadFailed =
  (r: RetryRefs, d: RetryDeps) => async (): Promise<void> => {
    r.loading.value = true
    r.error.value = undefined
    try {
      r.recipients.value = (await d.list()).recipients
    } catch (e) {
      r.error.value = message(e, 'Failed to load the retry list')
    } finally {
      r.loading.value = false
    }
  }

/**
 * Build the `run` action — dispatch to exactly the loaded ids, then
 * reload the set so a delivered address disappears from it.
 * @param r Reactive refs.
 * @param d Injected API calls.
 * @param reload The `load` action to re-run afterwards.
 * @returns Async action.
 */
export const createRunRetry =
  (
    r: RetryRefs,
    d: RetryDeps,
    reload: () => Promise<void>
  ): (() => Promise<void>) =>
  async (): Promise<void> => {
    r.phase.value = 'sending'
    r.error.value = undefined
    try {
      r.result.value = await d.dispatch(r.recipients.value.map(x => x.id))
      r.phase.value = 'done'
      await reload()
      d.onDone()
    } catch (e) {
      r.error.value = message(e, 'Re-send failed')
      r.phase.value = 'error'
    }
  }
