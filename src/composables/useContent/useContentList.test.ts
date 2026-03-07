import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useContentList } from './useContentList'

global.fetch = vi.fn()

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

  it('loads content from API and filters by type', async () => {
    const blogItems = [
      {
        path: 'src/content/blog/post1.md',
        slug: 'post1',
        frontmatter: { lang: 'en', title: 'Post 1' },
      },
      {
        path: 'src/content/blog/post2.md',
        slug: 'post2',
        frontmatter: { lang: 'en', title: 'Post 2' },
      },
    ]
    const pageItems = [
      {
        path: 'src/content/pages/about.md',
        slug: 'about',
        frontmatter: { lang: 'en', title: 'About' },
      },
    ]
    const posItems: readonly unknown[] = []

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: blogItems }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: pageItems }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: posItems }),
      } as Response)

    const { items, loadContent } = useContentList('blog')

    await loadContent()
    await nextTick()

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(items.value).toHaveLength(2)
    expect(items.value[0]?.path).toBe('src/content/blog/post1.md')
  })

  it('sets loadingList to true during loading and false after', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    } as unknown as Response)

    const { loadingList, loadContent } = useContentList('blog')

    expect(loadingList.value).toBe(false)
    const promise = loadContent()
    expect(loadingList.value).toBe(true)
    await promise
    expect(loadingList.value).toBe(false)
  })

  it('sets loadingList to false even when API fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    const { loadingList, loadContent } = useContentList('blog')

    await expect(loadContent()).rejects.toThrow(
      'Failed to load content: Not Found'
    )
    expect(loadingList.value).toBe(false)
  })

  it('throws error when API fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response)

    const { loadContent } = useContentList('blog')

    await expect(loadContent()).rejects.toThrow(
      'Failed to load content: Not Found'
    )
  })
})
