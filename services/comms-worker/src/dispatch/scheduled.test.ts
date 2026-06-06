import type { D1Database } from '@cloudflare/workers-types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSettingsRepo } from '../settings/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { handleScheduled, type ScheduledEnv } from './scheduled'

const FROZEN_NOW = new Date('2026-06-06T09:00:00.000Z')

let db: D1Database
let env: ScheduledEnv

beforeEach(() => {
  db = makeTestD1()
  env = {
    DB: db,
    RESEND_API_KEY: 'rk_test',
    UNSUBSCRIBE_SECRET: 'shhh',
  }
})

describe('handleScheduled', () => {
  it('returns undefined when no schedule has ever been persisted', async () => {
    await db.prepare('DELETE FROM settings').run()
    const dispatcher = vi.fn()
    const out = await handleScheduled(
      { scheduledTime: FROZEN_NOW.getTime() },
      env,
      { dispatcher }
    )
    expect(out).toBeUndefined()
    expect(dispatcher).not.toHaveBeenCalled()
  })

  it('returns undefined when the tick does not match the schedule', async () => {
    const settings = createSettingsRepo({ db })
    await settings.setSchedule(
      { cron: '0 12 * * 6', timezone: 'Europe/Moscow' },
      FROZEN_NOW
    )
    const fridayTick = new Date('2026-06-05T09:00:00.000Z').getTime()
    const dispatcher = vi.fn()
    const out = await handleScheduled({ scheduledTime: fridayTick }, env, {
      dispatcher,
    })
    expect(out).toBeUndefined()
    expect(dispatcher).not.toHaveBeenCalled()
  })

  it('invokes the dispatcher with the tickAt when the schedule matches', async () => {
    const settings = createSettingsRepo({ db })
    await settings.setSchedule(
      { cron: '0 12 * * 6', timezone: 'Europe/Moscow' },
      FROZEN_NOW
    )
    const dispatcher = vi
      .fn()
      .mockResolvedValue({ sent: 0, failed: 0, skipped: 0, durationMs: 1 })
    const out = await handleScheduled(
      { scheduledTime: FROZEN_NOW.getTime() },
      env,
      { dispatcher }
    )
    expect(dispatcher).toHaveBeenCalledOnce()
    const [passedEnv, passedTick] = dispatcher.mock.calls[0] ?? []
    expect(passedEnv).toBe(env)
    expect(passedTick.toISOString()).toBe(FROZEN_NOW.toISOString())
    expect(out).toMatchObject({ sent: 0, failed: 0 })
  })
})
