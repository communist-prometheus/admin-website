import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContentList } from './useContentList'

const mockSwFetch = vi.fn()

vi.mock('@/composables/useSWBridge/sw-fetch', () => ({
  swFetch: (...args: readonly unknown[]) => mockSwFetch(...args),
}))

describe('useContentList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty items', () => {
    const { items, selectedItem } = useContentList('blog')
    expect(items.value).toEqual([])
    expect(selectedItem.value).toBeNull()
  })

  it('loads content and filters by type', async () => {
    const blog = [
      {
        path: 'src/content/blog/p1/index.en.md',
        slug: 'p1',
        frontmatter: { lang: 'en', title: 'P1' },
      },
    ]
    mockSwFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: blog }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      })

    const { items, loadContent } = useContentList('blog')
    await loadContent()

    expect(mockSwFetch).toHaveBeenCalledTimes(3)
    expect(items.value).toHaveLength(1)
  })

  it('sets loading flag during load', async () => {
    mockSwFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    })

    const { loadingList, loadContent } = useContentList('blog')
    expect(loadingList.value).toBe(false)
    const promise = loadContent()
    expect(loadingList.value).toBe(true)
    await promise
    expect(loadingList.value).toBe(false)
  })

  it('resets loading on API failure', async () => {
    mockSwFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    })

    const { loadingList, loadContent } = useContentList('blog')
    await expect(loadContent()).rejects.toThrow()
    expect(loadingList.value).toBe(false)
  })
})
