import { ref } from 'vue'
import type { SWStatusResponse } from '@/sw/protocol'
import { sendSWMessage } from './send-message'

/**
 * Composable that provides reactive Service Worker status.
 * Call `refresh()` to re-query the SW.
 * @returns Status ref and refresh function
 */
export const useSWStatus = () => {
  const status = ref<SWStatusResponse | undefined>(undefined)
  const error = ref<string | undefined>(undefined)

  const refresh = async () => {
    try {
      status.value = await sendSWMessage<SWStatusResponse>({
        type: 'SW_STATUS',
      })
      error.value = undefined
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  return { status, error, refresh }
}
