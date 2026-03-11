import { ref } from 'vue'
import type { SWMetricsResponse } from '@/sw/protocol'
import { sendSWMessage } from './send-message'

/**
 * Composable for reactive Service Worker metrics.
 * Call `refresh()` to re-query the SW.
 * @returns Metrics ref and refresh function
 */
export const useSWMetrics = () => {
  const metrics = ref<SWMetricsResponse | undefined>(undefined)

  const refresh = async () => {
    try {
      metrics.value = await sendSWMessage<SWMetricsResponse>({
        type: 'SW_METRICS',
      })
    } catch {
      /* SW not available — ignore */
    }
  }

  return { metrics, refresh }
}
