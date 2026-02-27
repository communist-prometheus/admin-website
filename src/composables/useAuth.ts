import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

/**
 * Authentication composable
 * @returns User state and auth methods from Pinia store
 */
export const useAuth = () => {
  const store = useAuthStore()

  onMounted(store.checkAuth)

  return {
    user: store.user,
    loading: store.loading,
    error: store.error,
    checkAuth: store.checkAuth,
  }
}
