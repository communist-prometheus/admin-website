import { watch } from 'vue'
import { isOnline } from '@/composables/useConnectivity'
import { drainQueuedBatches } from './drain-queued'
import { recordSpan } from './exporter'
import { onFinishSpan } from './spans-store'

/**
 * Wire the tracing pipeline at app boot:
 *   - every finished span flows into the exporter buffer
 *   - every transition `offline → online` drains queued batches
 * Mount once near the app root.
 * @returns void
 */
export const useExporterBootstrap = (): void => {
  onFinishSpan(recordSpan)
  watch(
    isOnline,
    (next, prev) => {
      const becameOnline = prev !== true && next === true
      const drain = becameOnline
        ? () => {
            void drainQueuedBatches()
          }
        : (): void => undefined
      drain()
    },
    { immediate: false }
  )
}
