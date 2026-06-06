import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScheduleWithNext } from '@/validation/schemas/schedule'
import { apiGetSchedule, apiPutSchedule } from './schedule-api'

const okSchedule: ScheduleWithNext = {
  cron: '0 12 * * 6',
  timezone: 'Europe/Moscow',
  nextRunAt: '2026-06-06T09:00:00.000Z',
}

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  mockFetch.mockReset()
})

const okJson = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

describe('apiGetSchedule', () => {
  it('GETs /api/schedule with credentials and parses the payload', async () => {
    mockFetch.mockResolvedValue(okJson(okSchedule))
    const res = await apiGetSchedule()
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/schedule$/)
    expect(init.credentials).toBe('include')
    expect(res.cron).toBe('0 12 * * 6')
    expect(res.nextRunAt).toBe('2026-06-06T09:00:00.000Z')
  })
})

describe('apiPutSchedule', () => {
  it('PUTs the cron + timezone and returns the new ScheduleWithNext', async () => {
    mockFetch.mockResolvedValue(okJson(okSchedule))
    const res = await apiPutSchedule({
      cron: '0 12 * * 6',
      timezone: 'Europe/Moscow',
    })
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/schedule$/)
    expect(init.method).toBe('PUT')
    expect(init.body).toBe(
      JSON.stringify({ cron: '0 12 * * 6', timezone: 'Europe/Moscow' })
    )
    expect(res.timezone).toBe('Europe/Moscow')
  })

  it('throws with the worker error message on 422', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid cron' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    await expect(
      apiPutSchedule({ cron: 'bad', timezone: 'Etc/UTC' })
    ).rejects.toThrow(/invalid cron/)
  })
})
