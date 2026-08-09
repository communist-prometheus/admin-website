import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { User } from '@/types/user'

const sendSWMessage = vi.fn()
const clearToken = vi.fn()
const clearSso = vi.fn()

vi.mock('@/composables/useSWBridge/send-message', () => ({
  sendSWMessage: (...args: readonly unknown[]) => sendSWMessage(...args),
}))
vi.mock('@/composables/useAuth/token-storage', () => ({
  clearToken: () => clearToken(),
}))
vi.mock('@/composables/useAuth/profile-cache', () => ({
  saveProfile: vi.fn(),
}))
vi.mock('@/features/action-history/recorder', () => ({
  recordAction: () => Promise.resolve(),
}))
vi.mock('./sso-roles-storage', () => ({
  clearSsoRolesStorage: () => clearSso(),
}))

const { createLogout } = await import('./auth-actions')

const someUser: User = {
  username: 'undeadliner',
  name: 'undeadliner',
  avatar: '',
  accessToken: 'tok',
}

describe('createLogout', () => {
  afterEach(() => vi.clearAllMocks())

  it('invalidates the SW so the next account does not inherit the clone/identity', () => {
    sendSWMessage.mockResolvedValue(undefined)
    const user = ref<User | null>(someUser)
    const loading = ref(true)

    createLogout(user, loading)()

    expect(clearToken).toHaveBeenCalledOnce()
    expect(sendSWMessage).toHaveBeenCalledWith({ type: 'SW_INVALIDATE' })
    expect(user.value).toBeNull()
    expect(loading.value).toBe(false)
  })
})
