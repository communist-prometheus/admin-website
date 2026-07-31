import { beforeEach, describe, expect, it, vi } from 'vitest'
import { startTokenRefresh } from '@/composables/useAuth/refresh-scheduler'
import type { User } from '@/types/user'
import { createRefreshManager } from './auth-refresh'

vi.mock('@/composables/useAuth/refresh-scheduler', () => ({
  startTokenRefresh: vi.fn(),
}))

const startMock = vi.mocked(startTokenRefresh)
const user = (): User => ({
  username: 'u',
  name: 'U',
  avatar: 'a',
  accessToken: 't',
})

describe('createRefreshManager', () => {
  const stop = vi.fn()

  beforeEach(() => {
    startMock.mockReset()
    stop.mockReset()
    startMock.mockReturnValue(stop)
  })

  it('starts the scheduler once across repeated logged-in updates', () => {
    const manage = createRefreshManager({
      onRefreshed: vi.fn(),
      onDead: vi.fn(),
    })
    manage(user())
    manage(user())
    expect(startMock).toHaveBeenCalledOnce()
  })

  it('halts the scheduler on logout and can restart afterwards', () => {
    const manage = createRefreshManager({
      onRefreshed: vi.fn(),
      onDead: vi.fn(),
    })
    manage(user())
    manage(null)
    expect(stop).toHaveBeenCalledOnce()
    manage(user())
    expect(startMock).toHaveBeenCalledTimes(2)
  })

  it('does nothing when logged out from the start', () => {
    const manage = createRefreshManager({
      onRefreshed: vi.fn(),
      onDead: vi.fn(),
    })
    manage(null)
    expect(startMock).not.toHaveBeenCalled()
    expect(stop).not.toHaveBeenCalled()
  })
})
