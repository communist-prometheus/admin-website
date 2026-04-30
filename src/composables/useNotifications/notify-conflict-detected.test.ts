import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNotificationsStore } from '@/stores/notifications'
import { notifyConflictDetected } from './notify-conflict-detected'

describe('notifyConflictDetected', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('emits a conflict entry mentioning the file count', () => {
    notifyConflictDetected(['a.md', 'b.md', 'c.md'])
    const store = useNotificationsStore()
    const entry = store.entries[0]
    expect(entry?.kind).toBe('conflict')
    expect(entry?.message).toContain('3')
  })

  it('attaches a Resolve cta when an action is supplied', () => {
    const onResolve = vi.fn()
    notifyConflictDetected(['a.md'], onResolve)
    const store = useNotificationsStore()
    const entry = store.entries[0]
    expect(entry?.cta?.label).toBe('Resolve')
    entry?.cta?.action()
    expect(onResolve).toHaveBeenCalledTimes(1)
  })

  it('omits the cta when no action is supplied', () => {
    notifyConflictDetected(['a.md'])
    const store = useNotificationsStore()
    expect(store.entries[0]?.cta).toBeUndefined()
  })
})
