import { type Ref, ref } from 'vue'
import type { DetailError, TraceDetailBody } from './detail-types'
import { fetchDetail } from './fetch-detail'

/** Reactive surface returned by `useTraceDetail`. */
export type TraceDetailHandle = {
  readonly detail: Ref<TraceDetailBody | undefined>
  readonly loading: Ref<boolean>
  readonly error: Ref<DetailError>
  readonly load: (traceId: string) => Promise<void>
  readonly clear: () => void
}

/**
 * Fetch one trace detail and expose the result through reactive
 * refs. Errors surface as a small union (`forbidden` /
 * `not-found` / `unknown`) so the panel can render a banner
 * without throwing.
 * @returns Reactive detail body + load / clear actions.
 */
export const useTraceDetail = (): TraceDetailHandle => {
  const detail = ref<TraceDetailBody | undefined>(undefined)
  const loading = ref(false)
  const error = ref<DetailError>(undefined)
  const load = async (traceId: string): Promise<void> => {
    loading.value = true
    error.value = undefined
    const outcome = await fetchDetail(traceId)
    detail.value = outcome.body
    error.value = outcome.error
    loading.value = false
  }
  const clear = (): void => {
    detail.value = undefined
    error.value = undefined
  }
  return { detail, loading, error, load, clear }
}
