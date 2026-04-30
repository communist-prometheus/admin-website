import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bufferedLogCount,
  flushLogs,
  recordLog,
  resetLogExporter,
} from './exporter-logs'
import type { LogRecord } from './log-record'

const log = (msg: string): LogRecord => ({
  traceId: undefined,
  spanId: undefined,
  level: 'info',
  message: msg,
  at: 1,
  attributes: {},
})

describe('exporter-logs', () => {
  beforeEach(() => {
    resetLogExporter()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    )
    vi.useFakeTimers()
  })
  afterEach(() => {
    resetLogExporter()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('buffers entries and flushes on demand', async () => {
    recordLog(log('a'))
    recordLog(log('b'))
    expect(bufferedLogCount()).toBe(2)
    expect(await flushLogs()).toBe(true)
    expect(bufferedLogCount()).toBe(0)
  })

  it('returns false when flushing an empty buffer', async () => {
    expect(await flushLogs()).toBe(false)
  })

  it('drops the buffer on send failure (best-effort)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    )
    recordLog(log('x'))
    expect(await flushLogs()).toBe(false)
    expect(bufferedLogCount()).toBe(0)
  })
})
