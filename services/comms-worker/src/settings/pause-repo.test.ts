import { beforeEach, describe, expect, it } from 'vitest'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSettingsRepo, type SettingsRepo } from './repo'

let repo: SettingsRepo

beforeEach(() => {
  repo = createSettingsRepo({ db: makeTestD1() })
})

describe('SettingsRepo pausedUntil', () => {
  it('is undefined until a pause is set', async () => {
    expect(await repo.getPausedUntil()).toBeUndefined()
  })

  it('round-trips the resume instant', async () => {
    await repo.setPausedUntil('2026-06-07T00:00:00.000Z')
    expect(await repo.getPausedUntil()).toBe('2026-06-07T00:00:00.000Z')
  })

  it('overwrites a previous pause rather than duplicating it', async () => {
    await repo.setPausedUntil('2026-06-07T00:00:00.000Z')
    await repo.setPausedUntil('2026-07-01T00:00:00.000Z')
    expect(await repo.getPausedUntil()).toBe('2026-07-01T00:00:00.000Z')
  })

  it('clears the pause', async () => {
    await repo.setPausedUntil('2026-06-07T00:00:00.000Z')
    await repo.clearPausedUntil()
    expect(await repo.getPausedUntil()).toBeUndefined()
  })

  it('does not disturb the cutoff watermark', async () => {
    await repo.setCutoffAt('2026-06-06T09:00:00.000Z')
    await repo.setPausedUntil('2026-06-07T00:00:00.000Z')
    expect(await repo.getCutoffAt()).toBe('2026-06-06T09:00:00.000Z')
  })
})
