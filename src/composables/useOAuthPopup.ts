import { ref } from 'vue'
import type { User } from '@/types/user'
import { buildAuthorizeUrl } from './useOAuthPopup/authorize-url'
import { createMessageHandler } from './useOAuthPopup/handlers'
import { createPopupMonitor } from './useOAuthPopup/popup-monitor'
import { createPopupWindow } from './useOAuthPopup/popup-window'

/**
 * Vue composable for GitHub OAuth popup window flow.
 * @param onSuccess - Callback when OAuth succeeds with user
 * @param onError - Optional callback when OAuth fails
 * @returns Loading state and popup opener function
 */
export const useOAuthPopup = (
  onSuccess: (user: User) => void,
  onError?: (error: string) => void
) => {
  const loading = ref(false)
  const openPopup = async () => {
    if (typeof globalThis === 'undefined') return
    loading.value = true
    const url = await buildAuthorizeUrl()
    const popup = createPopupWindow(url)
    const cleanup = () => {
      loading.value = false
      globalThis.removeEventListener('message', handleMessage)
      popup?.close()
    }
    const handleMessage = createMessageHandler(onSuccess, onError, cleanup)
    globalThis.addEventListener('message', handleMessage)
    createPopupMonitor(popup, () => {
      loading.value = false
      globalThis.removeEventListener('message', handleMessage)
    })
  }
  return { loading, openPopup }
}
