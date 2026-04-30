import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useNotificationsStore } from './notifications'

describe('notifications store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty entries', () => {
    const store = useNotificationsStore()
    expect(store.entries).toEqual([])
  })

  it('notify pushes an entry and returns its id', () => {
    const store = useNotificationsStore()
    const id = store.notify({ kind: 'info', title: 'hello' })
    expect(id).toMatch(/.+/)
    expect(store.entries).toHaveLength(1)
    const entry = store.entries[0]
    expect(entry?.id).toBe(id)
    expect(entry?.kind).toBe('info')
    expect(entry?.title).toBe('hello')
  })

  it('notify assigns unique ids', () => {
    const store = useNotificationsStore()
    const a = store.notify({ kind: 'info', title: 'a' })
    const b = store.notify({ kind: 'info', title: 'b' })
    expect(a).not.toBe(b)
  })

  it('notify stamps createdAt to a current timestamp', () => {
    const before = Date.now()
    const store = useNotificationsStore()
    store.notify({ kind: 'warn', title: 'tick' })
    const ts = store.entries[0]?.createdAt ?? 0
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(Date.now())
  })

  it('notify preserves an attached cta', () => {
    const store = useNotificationsStore()
    const action = (): void => undefined
    store.notify({
      kind: 'network',
      title: 'down',
      cta: { label: 'Retry', action },
    })
    const entry = store.entries[0]
    expect(entry?.cta?.label).toBe('Retry')
    expect(entry?.cta?.action).toBe(action)
  })

  it('notify accepts every category without type errors', () => {
    const store = useNotificationsStore()
    const kinds = ['info', 'warn', 'error', 'conflict', 'network'] as const
    for (const kind of kinds) {
      store.notify({ kind, title: kind })
    }
    expect(store.entries.map(e => e.kind)).toEqual([...kinds])
  })

  it('dismiss removes the entry with the given id', () => {
    const store = useNotificationsStore()
    const id = store.notify({ kind: 'info', title: 'x' })
    store.notify({ kind: 'error', title: 'y' })
    store.dismiss(id)
    expect(store.entries).toHaveLength(1)
    expect(store.entries[0]?.title).toBe('y')
  })

  it('dismiss with an unknown id is a no-op', () => {
    const store = useNotificationsStore()
    store.notify({ kind: 'info', title: 'x' })
    store.dismiss('does-not-exist')
    expect(store.entries).toHaveLength(1)
  })

  it('clear empties all entries', () => {
    const store = useNotificationsStore()
    store.notify({ kind: 'info', title: 'x' })
    store.notify({ kind: 'info', title: 'y' })
    store.clear()
    expect(store.entries).toEqual([])
  })

  it('exposes entries as a frozen view of the queue', () => {
    const store = useNotificationsStore()
    store.notify({ kind: 'info', title: 'x' })
    const snapshot = store.entries
    store.notify({ kind: 'info', title: 'y' })
    expect(snapshot).not.toBe(store.entries)
  })
})
