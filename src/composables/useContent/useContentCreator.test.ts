import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContentCreator } from './useContentCreator'

const mockCreate = vi.fn()

vi.mock('../useGitHubApi', () => ({
  useGitHubApi: () => ({
    create: mockCreate,
  }),
}))

describe('useContentCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates blog content with frontmatter', async () => {
    mockCreate.mockResolvedValueOnce({ success: true })
    const { createContent } = useContentCreator('blog')
    await createContent({
      slug: 'test-post',
      lang: 'en',
      title: 'Test Post',
      description: 'Test description',
      category: 'tech',
    })
    expect(mockCreate).toHaveBeenCalledWith(
      'blog/test-post/index.en.md',
      expect.stringContaining('title: Test Post'),
      'Create test-post in blog'
    )
  })

  it('creates pages content without description', async () => {
    mockCreate.mockResolvedValueOnce({ success: true })
    const { createContent } = useContentCreator('pages')
    await createContent({
      slug: 'about',
      lang: 'ru',
      title: 'О нас',
    })
    expect(mockCreate).toHaveBeenCalledWith(
      'pages/about/index.ru.md',
      expect.stringContaining('title: О нас'),
      'Create about in pages'
    )
  })

  it('creates positions content without any date field', async () => {
    mockCreate.mockResolvedValueOnce({ success: true })
    const { createContent } = useContentCreator('positions')
    await createContent({
      slug: 'developer',
      lang: 'en',
      title: 'Senior Developer',
      description: 'Full-time position',
    })
    const firstCall = mockCreate.mock.calls[0] ?? []
    const body = String(firstCall[1] ?? '')
    expect(body).not.toMatch(/^pubDate:/m)
    expect(body).not.toMatch(/^publishDate:/m)
  })

  it('creates blog content without any date field', async () => {
    mockCreate.mockResolvedValueOnce({ success: true })
    const { createContent } = useContentCreator('blog')
    await createContent({
      slug: 'no-dates',
      lang: 'en',
      title: 'No dates',
      description: 'desc',
      category: 'tech',
    })
    const firstCall = mockCreate.mock.calls[0] ?? []
    const body = String(firstCall[1] ?? '')
    expect(body).not.toMatch(/^pubDate:/m)
    expect(body).not.toMatch(/^publishDate:/m)
  })

  it('creates magazine content without any date field', async () => {
    mockCreate.mockResolvedValueOnce({ success: true })
    const { createContent } = useContentCreator('magazine')
    await createContent({
      slug: 'week-1',
      lang: 'en',
      title: 'Week 1',
      description: 'weekly digest',
    })
    const firstCall = mockCreate.mock.calls[0] ?? []
    const body = String(firstCall[1] ?? '')
    expect(body).not.toMatch(/^pubDate:/m)
    expect(body).not.toMatch(/^publishDate:/m)
  })
})
