/*
 * Guard the sequential contract of the hard-reset routine:
 *   - progress is emitted BEFORE each step runs (so the UI can render
 *     the label while the step's async work is in flight)
 *   - steps run in strict order
 *   - a failing step still fires the reload tick? no — a throw
 *     propagates to the caller. The composable catches it into the
 *     `error` ref; that path is covered by useHardReset.test.
 *   - `location.reload()` is called exactly once at the end
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendSWMessage = vi.fn(async (_msg: unknown) => ({ ok: true }))
vi.mock('../useSWBridge/send-message', () => ({
  sendSWMessage: (msg: unknown) => sendSWMessage(msg),
}))

interface FakeCaches {
  keys: () => Promise<readonly string[]>
  delete: (k: string) => Promise<boolean>
}

const setupWindow = (): {
  readonly reload: ReturnType<typeof vi.fn>
  readonly regsUnregister: readonly ReturnType<typeof vi.fn>[]
  readonly cachesDelete: ReturnType<typeof vi.fn>
  readonly idbDelete: ReturnType<typeof vi.fn>
} => {
  const reload = vi.fn()
  const locationStub = { reload }
  vi.stubGlobal('location', locationStub)

  const cachesDelete = vi.fn(async () => true)
  const cachesStub: FakeCaches = {
    keys: async () => ['a', 'b'],
    delete: cachesDelete,
  }
  vi.stubGlobal('caches', cachesStub)

  const idbDelete = vi.fn((_name: string) => {
    const req = {
      onsuccess: (): void => undefined,
      onerror: (): void => undefined,
      onblocked: (): void => undefined,
    }
    setTimeout(() => req.onsuccess(), 0)
    return req
  })
  vi.stubGlobal('indexedDB', {
    databases: async () => [{ name: 'sw-git' }, { name: 'extra' }],
    deleteDatabase: idbDelete,
  })

  const regsUnregister = [vi.fn(async () => true), vi.fn(async () => true)]
  vi.stubGlobal('navigator', {
    serviceWorker: {
      getRegistrations: async () =>
        regsUnregister.map(unregister => ({ unregister })),
    },
    storage: {},
  })
  const localStorageMap = new Map<string, string>([
    ['gh_token', 'x'],
    ['profile', 'y'],
  ])
  const sessionStorageMap = new Map<string, string>()
  const asStorage = (m: Map<string, string>): Storage => ({
    clear: () => m.clear(),
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v)
    },
    removeItem: k => {
      m.delete(k)
    },
    key: () => null,
    get length() {
      return m.size
    },
  })
  vi.stubGlobal('localStorage', asStorage(localStorageMap))
  vi.stubGlobal('sessionStorage', asStorage(sessionStorageMap))

  return { reload, regsUnregister, cachesDelete, idbDelete }
}

describe('runHardReset', () => {
  let ctx: ReturnType<typeof setupWindow>
  beforeEach(() => {
    sendSWMessage.mockClear()
    ctx = setupWindow()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('emits a progress tick before each step, in order, plus a final Reloading tick', async () => {
    const { runHardReset } = await import('./hard-reset')
    const ticks: string[] = []
    await runHardReset(p => ticks.push(p.label))
    expect(ticks).toEqual([
      'Wiping git repository…',
      'Clearing HTTP caches…',
      'Clearing local databases…',
      'Clearing local storage…',
      'Unregistering service worker…',
      'Reloading…',
    ])
  })

  it('increments step counters against a fixed total', async () => {
    const { runHardReset } = await import('./hard-reset')
    const ticks: readonly { step: number; total: number }[] = []
    await runHardReset(p =>
      (ticks as { step: number; total: number }[]).push(p)
    )
    /* 5 real steps + the terminal Reloading tick = 6 ticks, total = 6. */
    expect(ticks.map(t => t.step)).toEqual([1, 2, 3, 4, 5, 6])
    expect(new Set(ticks.map(t => t.total))).toEqual(new Set([6]))
  })

  it('sends SW_INVALIDATE, drops every listed cache, deletes every IDB, unregisters every worker, and reloads', async () => {
    const { runHardReset } = await import('./hard-reset')
    await runHardReset(() => undefined)
    expect(sendSWMessage).toHaveBeenCalledWith({ type: 'SW_INVALIDATE' })
    expect(ctx.cachesDelete).toHaveBeenCalledWith('a')
    expect(ctx.cachesDelete).toHaveBeenCalledWith('b')
    /*
     * KNOWN_DB_NAMES ('sw-git', 'sw-meta') get merged with what
     * indexedDB.databases() returned ('sw-git', 'extra'); sw-git dedupes.
     */
    const deletedNames = ctx.idbDelete.mock.calls.map(c => c[0] as string)
    expect(new Set(deletedNames)).toEqual(
      new Set(['sw-git', 'sw-meta', 'extra'])
    )
    expect(ctx.regsUnregister.every(u => u.mock.calls.length === 1)).toBe(
      true
    )
    expect(ctx.reload).toHaveBeenCalledTimes(1)
  })

  it('clears local + session storage', async () => {
    const { runHardReset } = await import('./hard-reset')
    localStorage.setItem('gh_token', 'x')
    sessionStorage.setItem('scratch', 'y')
    await runHardReset(() => undefined)
    expect(localStorage.getItem('gh_token')).toBeNull()
    expect(sessionStorage.getItem('scratch')).toBeNull()
  })

  it('swallows SW_INVALIDATE errors so a bad SW does not block the rest', async () => {
    sendSWMessage.mockRejectedValueOnce(new Error('sw offline'))
    const { runHardReset } = await import('./hard-reset')
    await runHardReset(() => undefined)
    expect(ctx.reload).toHaveBeenCalledTimes(1)
  })
})
