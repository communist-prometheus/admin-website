import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { LogEntry } from '@/sw/protocol'
import { SW_LOG_CHANNEL } from '@/sw/protocol'
import {
  bufferedLogCount,
  flushLogs,
  resetLogExporter,
} from './exporter-logs'
import { bridgeSWLogs } from './use-log-bridge'

const entry: LogEntry = {
  ts: 1,
  level: 'info',
  cat: 'git',
  msg: 'pulled',
  spanId: 'aabb',
}

describe('bridgeSWLogs', () => {
  beforeEach(async () => {
    resetLogExporter()
    // Drain any pending BroadcastChannel deliveries from a prior test
    // before re-resetting so the buffer starts truly empty.
    await new Promise(resolve => setTimeout(resolve, 0))
    resetLogExporter()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    )
  })
  afterEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
    resetLogExporter()
    vi.unstubAllGlobals()
  })

  it('forwards SW logs into the exporter buffer', async () => {
    const close = bridgeSWLogs()
    const sender = new BroadcastChannel(SW_LOG_CHANNEL)
    sender.postMessage(entry)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bufferedLogCount()).toBe(1)
    sender.close()
    close()
  })

  it('reaches the collector after flush', async () => {
    const close = bridgeSWLogs()
    const sender = new BroadcastChannel(SW_LOG_CHANNEL)
    sender.postMessage(entry)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(await flushLogs()).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    sender.close()
    close()
  })

  it('disposer closes the channel', async () => {
    const close = bridgeSWLogs()
    close()
    const sender = new BroadcastChannel(SW_LOG_CHANNEL)
    sender.postMessage(entry)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(bufferedLogCount()).toBe(0)
    sender.close()
  })
})
