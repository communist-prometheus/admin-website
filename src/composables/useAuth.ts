import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Authentication composable
 * @returns Reactive user state and auth methods
 */
export const useAuth = () => {
  const store = useAuthStore()
  const { loading } = storeToRefs(store)

  onMounted(store.checkAuth)

  return {
    user: store.user,
    loading,
    error: store.error,
    checkAuth: store.checkAuth,
  }
}
