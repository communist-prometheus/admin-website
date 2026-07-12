import { ref } from 'vue'
import type { ForceDispatchResult } from '@/stores/dispatch-api'
import type { FailedRecipient } from '@/validation/schemas/run-log'
import {
  createLoadFailed,
  createRunRetry,
  type RetryDeps,
  type RetryPhase,
  type RetryRefs,
} from './retry-failed-actions'

export type { RetryPhase } from './retry-failed-actions'

/**
 * Drive the "re-send to failed" panel.
 *
 * The recipient set comes from the worker — active addresses whose most
 * recent attempt failed — and the dispatch targets exactly those ids. A
 * successful send writes a newer log row, so the address leaves the set:
 * pressing the button twice cannot deliver the same digest twice.
 * @param d Injected API calls + the parent's refresh callback.
 * @returns Reactive state and actions.
 */
export const useRetryFailed = (d: RetryDeps) => {
  const r: RetryRefs = {
    recipients: ref<readonly FailedRecipient[]>([]),
    phase: ref<RetryPhase>('idle'),
    loading: ref(false),
    error: ref<string | undefined>(undefined),
    result: ref<ForceDispatchResult | undefined>(undefined),
  }
  const load = createLoadFailed(r, d)
  const ask = (): void => {
    r.phase.value = 'confirm'
  }
  const cancel = (): void => {
    r.phase.value = 'idle'
  }
  return { ...r, load, ask, cancel, run: createRunRetry(r, d, load) }
}
