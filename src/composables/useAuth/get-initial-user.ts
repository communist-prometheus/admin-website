import { inject } from 'vue'
import type { InitialState, User } from '@/types/user'
import { getMockUser } from './mock-user'

/**
 * Get initial user from SSR state or mock
 * @returns User or null
 */
export const getInitialUser = (): User | null => {
  if (import.meta.env.VITE_MOCK_AUTH === 'true') {
    return getMockUser()
  }
  const ssrState = inject<InitialState | null>('initialState', null)
  if (ssrState?.user) return ssrState.user
  if (typeof window !== 'undefined') {
    const initialState = (
      globalThis as unknown as { __INITIAL_STATE__?: InitialState }
    ).__INITIAL_STATE__
    return initialState?.user || null
  }
  return null
}
