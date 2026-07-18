import type { D1Database } from '@cloudflare/workers-types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSettingsRepo, type SettingsRepo } from '../settings/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { handleScheduled, type ScheduledEnv } from './scheduled'

const MATCH_TICK = new Date('2026-06-06T09:00:00.000Z')

let db: D1Database
let env: ScheduledEnv
let settings: SettingsRepo

const summary = { sent: 0, failed: 0, skipped: 0, durationMs: 1 }

beforeEach(async () => {
  db = makeTestD1()
  env = { DB: db, RESEND_API_KEY: 'rk_test', UNSUBSCRIBE_SECRET: 'shhh' }
  settings = createSettingsRepo({ db })
  await settings.setSchedule(
    { cron: '0 12 * * 6', timezone: 'Europe/Moscow' },
    MATCH_TICK
  )
})

describe('handleScheduled — quota pause gate', () => {
  it('skips a matching tick while the pause is still in the future', async () => {
    await settings.setPausedUntil('2026-06-07T00:00:00.000Z')
    const dispatcher = vi.fn()
    const out = await handleScheduled(
      { scheduledTime: MATCH_TICK.getTime() },
      env,
      { dispatcher }
    )
    expect(out).toBeUndefined()
    expect(dispatcher).not.toHaveBeenCalled()
    // Pause is preserved so later ticks stay held too.
    expect(await settings.getPausedUntil()).toBe('2026-06-07T00:00:00.000Z')
  })

  it('resumes and clears the pause once the tick reaches the resume instant', async () => {
    await settings.setPausedUntil('2026-06-06T00:00:00.000Z')
    const dispatcher = vi.fn().mockResolvedValue(summary)
    const out = await handleScheduled(
      { scheduledTime: MATCH_TICK.getTime() },
      env,
      { dispatcher }
    )
    expect(dispatcher).toHaveBeenCalledOnce()
    expect(out).toMatchObject({ sent: 0 })
    expect(await settings.getPausedUntil()).toBeUndefined()
  })

  it('runs normally when no pause is set', async () => {
    const dispatcher = vi.fn().mockResolvedValue(summary)
    await handleScheduled({ scheduledTime: MATCH_TICK.getTime() }, env, {
      dispatcher,
    })
    expect(dispatcher).toHaveBeenCalledOnce()
  })
})
