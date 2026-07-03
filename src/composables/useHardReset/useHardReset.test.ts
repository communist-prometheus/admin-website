import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runHardReset = vi.fn()
vi.mock('./hard-reset', () => ({
  runHardReset: (cb: (p: unknown) => void) => runHardReset(cb),
}))

describe('useHardReset', () => {
  beforeEach(() => {
    runHardReset.mockReset()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts idle: not running, no progress, no error', async () => {
    const { useHardReset } = await import('./useHardReset')
    const s = useHardReset()
    expect(s.running).toBe(false)
    expect(s.progress).toBeUndefined()
    expect(s.error).toBeUndefined()
  })

  it('flips running=true when start() is called and publishes progress from the routine', async () => {
    /* runHardReset invokes its onProgress callback with a sequence. */
    runHardReset.mockImplementation(async (cb: (p: unknown) => void) => {
      cb({ step: 1, total: 3, label: 'a' })
      cb({ step: 2, total: 3, label: 'b' })
      cb({ step: 3, total: 3, label: 'c' })
      /* Simulate the reload path by never resolving. */
      await new Promise(() => undefined)
    })

    const { useHardReset } = await import('./useHardReset')
    const s = useHardReset()
    void s.start()
    /* Microtask flush so the async chain reaches the onProgress calls. */
    await Promise.resolve()
    expect(s.running).toBe(true)
    expect(s.progress?.label).toBe('c')
    expect(s.progress?.step).toBe(3)
  })

  it('publishes error and resets running=false when the routine throws', async () => {
    runHardReset.mockRejectedValueOnce(new Error('boom'))
    const { useHardReset } = await import('./useHardReset')
    const s = useHardReset()
    await s.start()
    expect(s.error).toBe('boom')
    expect(s.running).toBe(false)
  })

  it('ignores start() while already running', async () => {
    runHardReset.mockImplementation(() => new Promise<void>(() => undefined))
    const { useHardReset } = await import('./useHardReset')
    const s = useHardReset()
    void s.start()
    void s.start()
    void s.start()
    expect(runHardReset).toHaveBeenCalledTimes(1)
  })
})
