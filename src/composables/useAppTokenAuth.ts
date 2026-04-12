import { type Ref, ref } from 'vue'
import type { User } from '@/types/user'
import { requestAppToken } from './useAppTokenAuth/request-token'
import { saveToken } from './useAuth/token-storage'

const buildSyntheticUser = (token: string): User => ({
  username: 'admin',
  name: 'Admin',
  avatar: '',
  accessToken: token,
})

const handleResult = (
  result: Awaited<ReturnType<typeof requestAppToken>>,
  onSuccess: (user: User) => void,
  onError: ((message: string) => void) | undefined
): void => {
  if ('error' in result) {
    onError?.(result.error_description ?? result.error)
    return
  }
  saveToken(result.token)
  onSuccess(buildSyntheticUser(result.token))
}

interface AuthResult {
  readonly loading: Ref<boolean>
  readonly login: (password: string) => Promise<void>
}

/**
 * Minimal auth flow that exchanges an admin password for a GitHub App
 * installation access token via the worker's `/api/auth/app-token`
 * endpoint. Sidesteps the OAuth redirect_uri flow entirely.
 * @param onSuccess - Called with the synthetic user on successful login
 * @param onError - Optional error callback with a human-readable message
 * @returns Reactive loading state + `login(password)` function
 */
export const useAppTokenAuth = (
  onSuccess: (user: User) => void,
  onError?: (message: string) => void
): AuthResult => {
  const loading = ref(false)
  const login = async (password: string): Promise<void> => {
    loading.value = true
    try {
      handleResult(await requestAppToken(password), onSuccess, onError)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Login failed')
    } finally {
      loading.value = false
    }
  }
  return { loading, login }
}
