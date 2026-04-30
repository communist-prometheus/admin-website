import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationsStore } from '@/stores/notifications'
import { notifyNetworkDown } from './notify-network-down'

describe('notifyNetworkDown', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits a network entry with no cta when called without a retry', () => {
    notifyNetworkDown()
    const store = useNotificationsStore()
    const entry = store.entries[0]
    expect(entry?.kind).toBe('network')
    expect(entry?.cta).toBeUndefined()
  })

  it('attaches a Retry cta wired to the supplied callback', () => {
    const onRetry = vi.fn()
    notifyNetworkDown(onRetry)
    const store = useNotificationsStore()
    const entry = store.entries[0]
    expect(entry?.cta?.label).toBe('Retry')
    expect(entry?.cta?.action).toBe(onRetry)
    entry?.cta?.action()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
