import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createPoll } from './poll-deploy'
import type { DeployInfo } from './types'

const mockFetch = (data: unknown, ok = true) =>
  vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  })

describe('createPoll', () => {
  it('sets success when isNew is true', async () => {
    const info = ref<DeployInfo>({ stage: 'building' })
    const stop = vi.fn()
    globalThis.fetch = mockFetch({
      isNew: true,
      version: 5,
      createdOn: '2026-03-29T12:00:00Z',
    })
    const poll = createPoll(info, () => 4, stop)
    await poll()
    expect(info.value.stage).toBe('success')
    expect(info.value.version).toBe(5)
    expect(stop).toHaveBeenCalled()
  })

  it('stays building when isNew is false', async () => {
    const info = ref<DeployInfo>({ stage: 'building' })
    const stop = vi.fn()
    globalThis.fetch = mockFetch({
      isNew: false,
      version: 4,
      createdOn: '2026-03-29T12:00:00Z',
    })
    const poll = createPoll(info, () => 4, stop)
    await poll()
    expect(info.value.stage).toBe('building')
    expect(stop).not.toHaveBeenCalled()
  })

  it('sets not-found on failed fetch', async () => {
    const info = ref<DeployInfo>({ stage: 'building' })
    globalThis.fetch = mockFetch({}, false)
    const poll = createPoll(info, () => 0, vi.fn())
    await poll()
    expect(info.value.stage).toBe('not-found')
  })
})
