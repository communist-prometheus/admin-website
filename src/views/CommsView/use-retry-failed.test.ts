import { describe, expect, it, vi } from 'vitest'
import type { ForceDispatchResult } from '@/stores/dispatch-api'
import type { FailedRecipient } from '@/validation/schemas/run-log'
import { useRetryFailed } from './use-retry-failed'

const recipient = (id: number, email: string): FailedRecipient => ({
  id,
  email,
  tickAt: '2026-07-11T09:00:39.000Z',
  error: 'resend 409',
})

const summary: ForceDispatchResult = {
  sent: 2,
  failed: 0,
  skipped: 0,
  durationMs: 10,
}

const build = (
  recipients: readonly FailedRecipient[],
  dispatch = vi.fn(async () => summary)
) => {
  const onDone = vi.fn()
  const list = vi.fn(async () => ({ recipients }))
  return {
    s: useRetryFailed({ list, dispatch, onDone }),
    dispatch,
    onDone,
    list,
  }
}

describe('useRetryFailed', () => {
  it('loads the addresses whose last attempt failed', async () => {
    const { s } = build([recipient(1, 'a@b.c'), recipient(2, 'd@e.f')])
    await s.load()
    expect(s.recipients.value.map(r => r.email)).toEqual(['a@b.c', 'd@e.f'])
  })

  /*
   * The whole point of the button: it targets exactly the failed set, so a
   * recipient who already got the digest cannot be mailed it again.
   */
  it('dispatches to exactly those ids and nobody else', async () => {
    const { s, dispatch } = build([
      recipient(7, 'a@b.c'),
      recipient(9, 'd@e.f'),
    ])
    await s.load()
    await s.run()
    expect(dispatch).toHaveBeenCalledWith([7, 9])
    expect(s.result.value).toEqual(summary)
    expect(s.phase.value).toBe('done')
  })

  it('reloads the set after a run, so a delivered address disappears', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ recipients: [recipient(1, 'a@b.c')] })
      .mockResolvedValueOnce({ recipients: [] })
    const s = useRetryFailed({
      list,
      dispatch: vi.fn(async () => summary),
      onDone: vi.fn(),
    })
    await s.load()
    await s.run()
    expect(s.recipients.value).toEqual([])
  })

  it('tells the parent to refresh the log after a run', async () => {
    const { s, onDone } = build([recipient(1, 'a@b.c')])
    await s.load()
    await s.run()
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('surfaces a dispatch failure instead of claiming success', async () => {
    const dispatch = vi.fn(async () => {
      throw new Error('worker exploded')
    })
    const { s } = build([recipient(1, 'a@b.c')], dispatch)
    await s.load()
    await s.run()
    expect(s.phase.value).toBe('error')
    expect(s.error.value).toBe('worker exploded')
  })

  it('confirms before sending — no mail on a stray click', async () => {
    const { s, dispatch } = build([recipient(1, 'a@b.c')])
    await s.load()
    s.ask()
    expect(s.phase.value).toBe('confirm')
    expect(dispatch).not.toHaveBeenCalled()
    s.cancel()
    expect(s.phase.value).toBe('idle')
    expect(dispatch).not.toHaveBeenCalled()
  })
})
