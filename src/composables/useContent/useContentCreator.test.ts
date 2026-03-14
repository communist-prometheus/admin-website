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
      'src/content/blog/test-post/index.en.md',
      expect.stringContaining('title: Test Post'),
      'Create index.en.md'
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
      'src/content/pages/about.ru.md',
      expect.stringContaining('title: О нас'),
      'Create about.ru.md'
    )
  })

  it('creates positions content with order', async () => {
    mockCreate.mockResolvedValueOnce({ success: true })

    const { createContent } = useContentCreator('positions')

    await createContent({
      slug: 'developer',
      lang: 'en',
      title: 'Senior Developer',
      description: 'Full-time position',
      order: 1,
    })

    expect(mockCreate).toHaveBeenCalledWith(
      'src/content/positions/developer.en.md',
      expect.stringContaining('order: 1'),
      'Create developer.en.md'
    )
  })
})
