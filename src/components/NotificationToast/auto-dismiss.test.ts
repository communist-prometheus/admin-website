import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTO_DISMISS_MS, scheduleAutoDismiss } from './auto-dismiss'

describe('scheduleAutoDismiss', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires dismiss after the timeout for transient kinds', () => {
    const dismiss = vi.fn()
    scheduleAutoDismiss('info', dismiss)
    vi.advanceTimersByTime(AUTO_DISMISS_MS - 1)
    expect(dismiss).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(dismiss).toHaveBeenCalledTimes(1)
  })

  it('does not fire for sticky kinds', () => {
    const dismiss = vi.fn()
    const cleanup = scheduleAutoDismiss('error', dismiss)
    vi.advanceTimersByTime(AUTO_DISMISS_MS * 4)
    expect(dismiss).not.toHaveBeenCalled()
    cleanup()
  })

  it('cleanup cancels a pending dismiss', () => {
    const dismiss = vi.fn()
    const cleanup = scheduleAutoDismiss('warn', dismiss)
    vi.advanceTimersByTime(AUTO_DISMISS_MS - 100)
    cleanup()
    vi.advanceTimersByTime(AUTO_DISMISS_MS * 2)
    expect(dismiss).not.toHaveBeenCalled()
  })

  it('cleanup is idempotent for sticky kinds', () => {
    const cleanup = scheduleAutoDismiss('conflict', vi.fn())
    expect(() => {
      cleanup()
      cleanup()
    }).not.toThrow()
  })
})
