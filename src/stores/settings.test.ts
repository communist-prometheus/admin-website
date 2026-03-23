import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSettingsStore } from './settings'

const mockSwFetch = vi.fn()

vi.mock('@/composables/useSWBridge/sw-fetch', () => ({
  swFetch: (...args: readonly unknown[]) => mockSwFetch(...args),
}))

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty languages', () => {
    const store = useSettingsStore()
    expect(store.languages).toEqual([])
    expect(store.loaded).toBe(false)
  })

  it('loads languages from file API', async () => {
    mockSwFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: '[{"code":"en","label":"English"},{"code":"ru","label":"Русский"}]',
        sha: 'abc123',
      }),
    })

    const store = useSettingsStore()
    await store.loadLanguages()

    expect(store.languages).toHaveLength(2)
    expect(store.languages[0]).toEqual({ code: 'en', label: 'English' })
    expect(store.loaded).toBe(true)
  })

  it('computes languageCodes from loaded languages', async () => {
    mockSwFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: '[{"code":"en","label":"English"},{"code":"it","label":"Italiano"}]',
        sha: 'def456',
      }),
    })

    const store = useSettingsStore()
    await store.loadLanguages()

    expect(store.languageCodes).toEqual(['en', 'it'])
  })

  it('handles fetch failure gracefully', async () => {
    mockSwFetch.mockResolvedValueOnce({ ok: false })

    const store = useSettingsStore()
    await store.loadLanguages()

    expect(store.languages).toEqual([])
    expect(store.loaded).toBe(true)
  })

  it('saves languages with SHA', async () => {
    // Load first to get SHA
    mockSwFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: '[{"code":"en","label":"English"}]',
        sha: 'sha1',
      }),
    })

    const store = useSettingsStore()
    await store.loadLanguages()

    // Save
    mockSwFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: { sha: 'sha2' } }),
    })

    const newLangs = [
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' },
    ]
    const ok = await store.updateLanguages(newLangs)

    expect(ok).toBe(true)
    expect(store.languages).toEqual(newLangs)

    // Verify PUT was called with SHA
    const putCall = mockSwFetch.mock.calls[1]
    expect(putCall).toBeDefined()
    expect(putCall![0]).toBe('/api/github/file')
    const body = JSON.parse(putCall![1].body)
    expect(body.sha).toBe('sha1')
    expect(body.path).toBe('settings/languages.json')
  })

  it('ensureLoaded only loads once', async () => {
    mockSwFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: '[{"code":"en","label":"English"}]',
        sha: 'x',
      }),
    })

    const store = useSettingsStore()
    await store.ensureLoaded()
    await store.ensureLoaded()
    await store.ensureLoaded()

    expect(mockSwFetch).toHaveBeenCalledTimes(1)
  })
})
