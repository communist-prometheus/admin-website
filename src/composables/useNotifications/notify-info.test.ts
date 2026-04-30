import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotificationsStore } from '@/stores/notifications'
import { notifyInfo } from './notify-info'

describe('notifyInfo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits an info entry with the supplied message', () => {
    notifyInfo('Synced 3 changes')
    const store = useNotificationsStore()
    expect(store.entries).toHaveLength(1)
    const entry = store.entries[0]
    expect(entry?.kind).toBe('info')
    expect(entry?.message).toBe('Synced 3 changes')
  })

  it('returns the entry id so callers can dismiss programmatically', () => {
    const id = notifyInfo('hello')
    const store = useNotificationsStore()
    expect(id).toBe(store.entries[0]?.id)
  })

  it('does not attach a cta', () => {
    notifyInfo('plain')
    const store = useNotificationsStore()
    expect(store.entries[0]?.cta).toBeUndefined()
  })
})
