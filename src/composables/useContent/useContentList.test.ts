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
      { path: 'blog/post1.md', slug: 'post1', frontmatter: { lang: 'en', title: 'Post 1' } },
      { path: 'blog/post2.md', slug: 'post2', frontmatter: { lang: 'en', title: 'Post 2' } },
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockItems }),
    } as Response)

    const { items, loadContent } = useContentList('blog')

    await loadContent()
    await nextTick()

    expect(fetch).toHaveBeenCalledWith('/api/github/content/blog')
    expect(items.value).toHaveLength(2)
    expect(items.value[0]?.path).toBe('blog/post1.md')
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
