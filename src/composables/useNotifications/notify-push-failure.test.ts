import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotificationsStore } from '@/stores/notifications'
import { notifyPushFailure } from './notify-push-failure'
import type { PushFailureReason } from './push-failure-types'

const REASONS: ReadonlyArray<PushFailureReason> = [
  'network',
  'auth',
  'non-fast-forward',
  'validation',
  'unknown',
]

describe('notifyPushFailure', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits an error entry for every reason', () => {
    for (const reason of REASONS) {
      const store = useNotificationsStore()
      store.clear()
      notifyPushFailure(reason)
      const entry = store.entries[0]
      expect(entry?.kind).toBe('error')
      expect(entry?.title.length).toBeGreaterThan(0)
      expect(entry?.message?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('appends the target ref to the message when supplied', () => {
    notifyPushFailure('network', 'origin/develop')
    const store = useNotificationsStore()
    expect(store.entries[0]?.message).toContain('origin/develop')
  })

  it('produces a distinct copy per reason', () => {
    const messages = new Set<string>()
    for (const reason of REASONS) {
      const store = useNotificationsStore()
      store.clear()
      notifyPushFailure(reason)
      messages.add(store.entries[0]?.message ?? '')
    }
    expect(messages.size).toBe(REASONS.length)
  })
})
