import type { workerState } from '../state/state'
import { dequeue } from './enqueue'
import type { PushQueueEntry } from './types'

/** Discriminated outcome of a single push attempt. */
export type PushOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: unknown }

/**
 * Attempt to push and dequeue a single queued entry. Returns a
 * discriminated result so the caller can react to the underlying
 * error without losing it to a `.catch(() => false)`.
 * @param entry Queued entry to push and remove on success.
 * @param config SW git configuration with token + remote.
 * @returns `{ ok: true }` on success, `{ ok: false, error }` on failure.
 */
export const pushOnce = async (
  entry: PushQueueEntry,
  config: NonNullable<typeof workerState.config>
): Promise<PushOutcome> => {
  try {
    const { pushToRemote } = await import('../git/remote/push-to-remote')
    await pushToRemote(config)
    await dequeue(entry.sha)
    return { ok: true }
  } catch (error) {
    return { ok: false, error }
  }
}
