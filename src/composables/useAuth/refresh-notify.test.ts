import { describe, expect, it, vi } from 'vitest'
import { applyToken, type SchedulerState } from './refresh-notify'

const hooks = () => ({ onRefreshed: vi.fn(), onDead: vi.fn() })

describe('applyToken', () => {
  it('fires onDead for a dead session (undefined token)', () => {
    const h = hooks()
    const state: SchedulerState = { lastToken: 'x', stopped: false }
    applyToken(undefined, state, h)
    expect(h.onDead).toHaveBeenCalledOnce()
    expect(h.onRefreshed).not.toHaveBeenCalled()
  })

  it('notifies once for a new token and records it', () => {
    const h = hooks()
    const state: SchedulerState = { lastToken: undefined, stopped: false }
    applyToken('t1', state, h)
    expect(h.onRefreshed).toHaveBeenCalledWith('t1')
    expect(state.lastToken).toBe('t1')
  })

  it('stays silent when the token is unchanged', () => {
    const h = hooks()
    const state: SchedulerState = { lastToken: 't1', stopped: false }
    applyToken('t1', state, h)
    expect(h.onRefreshed).not.toHaveBeenCalled()
    expect(h.onDead).not.toHaveBeenCalled()
  })
})
