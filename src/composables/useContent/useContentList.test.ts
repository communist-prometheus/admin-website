import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContentList } from './useContentList'

global.fetch = vi.fn()

describe('useContentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty items', () => {
    const { items, selectedItem } = useContentList('blog')

    expect(items.value).toEqual([])
    expect(selectedItem.value).toBeNull()
  })

  it('loads content from API', async () => {
    const mockItems = [
      { path: 'blog/post1.md', title: 'Post 1', lang: 'en' },
      { path: 'blog/post2.md', title: 'Post 2', lang: 'en' },
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    } as Response)

    const { items, loadContent } = useContentList('blog')

    await loadContent()
    await nextTick()

    expect(fetch).toHaveBeenCalledWith('/api/github/content/blog')
    expect(items.value).toEqual(mockItems)
  })

  it('throws error when API fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    const { loadContent } = useContentList('blog')

    await expect(loadContent()).rejects.toThrow('Failed to load content: Not Found')
  })
})
