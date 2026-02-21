import { ref } from 'vue'
import type { User } from '@/types/user'
import {
  createMessageHandler,
  createPopupMonitor,
} from './useOAuthPopup/handlers'

const createPopupWindow = () => {
  const width = 600
  const height = 700
  const left = (globalThis.screen.width - width) / 2
  const top = (globalThis.screen.height - height) / 2
  return globalThis.open(
    '/api/auth/github',
    'github-oauth',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
  )
}

/**
 * Vue composable for GitHub OAuth popup window flow.
 * @param onSuccess - Callback when OAuth succeeds with user data
 * @param onError - Optional callback when OAuth fails
 * @returns Loading state and popup opener function
 */
export const useOAuthPopup = (
  onSuccess: (user: User) => void,
  onError?: (error: string) => void
) => {
  const loading = ref(false)
  const openPopup = () => {
    if (typeof globalThis === 'undefined') return
    loading.value = true
    const popup = createPopupWindow()
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
