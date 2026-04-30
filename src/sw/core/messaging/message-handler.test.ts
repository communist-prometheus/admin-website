import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearLogEntries, log } from '../../logging/logger'
import { activeContext, setActiveContext } from '../../tracing/active-context'
import { handleMessage } from './message-handler'

vi.mock('./handle-init', () => ({
  handleInit: vi.fn(),
}))
vi.mock('./handle-fetch-message', () => ({
  handleFetchMessage: vi.fn(),
}))
vi.mock('./handle-invalidate', () => ({
  handleInvalidate: vi.fn(),
}))
vi.mock('../../state/build-status', () => ({
  buildStatus: () => ({ state: 'idle' }),
}))
vi.mock('../../logging/metrics', () => ({
  getMetrics: () => ({}),
}))

describe('handleMessage trace context', () => {
  beforeEach(() => {
    clearLogEntries()
    setActiveContext(undefined)
  })
  afterEach(() => {
    setActiveContext(undefined)
  })

  it('clears the trace context after dispatch', () => {
    const tp = '00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01'
    handleMessage({ type: 'SW_STATUS', traceparent: tp }, () => undefined)
    expect(activeContext()).toBeUndefined()
  })

  it('stamps logs emitted during dispatch with the traceId', () => {
    const tp = '00-cccccccccccccccccccccccccccccccc-dddddddddddddddd-01'
    let captured: string | undefined
    const reply = (): void => {
      log('info', 'lifecycle', 'inside')
      captured = activeContext()?.traceId
    }
    handleMessage({ type: 'SW_STATUS', traceparent: tp }, reply)
    expect(captured).toBe('cccccccccccccccccccccccccccccccc')
  })

  it('runs without a traceparent', () => {
    expect(() =>
      handleMessage({ type: 'SW_STATUS' }, () => undefined)
    ).not.toThrow()
    expect(activeContext()).toBeUndefined()
  })
})
