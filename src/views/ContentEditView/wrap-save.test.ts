import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { wrapSave } from './wrap-save'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('wrapSave', () => {
  it('flips saving true during the call and back to false on success', async () => {
    const saving = ref(false)
    const saved = ref(false)
    let observedSaving = false
    const raw = vi.fn(async () => {
      observedSaving = saving.value
    })
    const wrapped = wrapSave(raw, saving, saved)
    await wrapped()
    expect(observedSaving).toBe(true)
    expect(saving.value).toBe(false)
    expect(saved.value).toBe(true)
  })

  it('clears `saved` two seconds after a successful save', async () => {
    const saving = ref(false)
    const saved = ref(false)
    const wrapped = wrapSave(async () => undefined, saving, saved)
    await wrapped()
    expect(saved.value).toBe(true)
    vi.advanceTimersByTime(1999)
    expect(saved.value).toBe(true)
    vi.advanceTimersByTime(1)
    expect(saved.value).toBe(false)
  })

  // Regression: prior to the try/finally fix, any thrown error from
  // `rawSave` left `saving = true` forever. The save button stayed
  // disabled and the user had to reload the page.
  it('resets `saving` even when rawSave throws', async () => {
    const saving = ref(false)
    const saved = ref(false)
    const wrapped = wrapSave(
      async () => {
        throw new Error('boom')
      },
      saving,
      saved
    )
    await expect(wrapped()).rejects.toThrow('boom')
    expect(saving.value).toBe(false)
    expect(saved.value).toBe(false)
  })

  it('propagates the original error for the caller to surface', async () => {
    const saving = ref(false)
    const saved = ref(false)
    const err = new Error('push rejected')
    const wrapped = wrapSave(
      async () => {
        throw err
      },
      saving,
      saved
    )
    await expect(wrapped()).rejects.toBe(err)
  })
})
