import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { isRef } from 'vue'
import { useNotifications } from './use-notifications'

describe('useNotifications', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('returns a reactive entries ref and bound actions', () => {
    const api = useNotifications()
    expect(isRef(api.entries)).toBe(true)
    expect(api.entries.value).toEqual([])
    expect(typeof api.notify).toBe('function')
    expect(typeof api.dismiss).toBe('function')
    expect(typeof api.clear).toBe('function')
  })

  it('mutations through the composable propagate to entries', () => {
    const { entries, notify, dismiss, clear } = useNotifications()
    const id = notify({ kind: 'info', title: 'hi' })
    expect(entries.value).toHaveLength(1)
    dismiss(id)
    expect(entries.value).toHaveLength(0)
    notify({ kind: 'warn', title: 'a' })
    notify({ kind: 'warn', title: 'b' })
    clear()
    expect(entries.value).toEqual([])
  })

  it('two consumers share the same store', () => {
    const a = useNotifications()
    const b = useNotifications()
    a.notify({ kind: 'info', title: 'shared' })
    expect(b.entries.value).toHaveLength(1)
  })
})
