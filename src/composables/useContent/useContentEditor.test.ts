import { describe, expect, it, vi } from 'vitest'
import { useContentEditor } from './useContentEditor'

const mockGetFile = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../useGitHubApi', () => ({
  useGitHubApi: () => ({
    getFile: mockGetFile,
    update: mockUpdate,
  }),
}))

describe('useContentEditor', () => {
  it('initializes with empty content and frontmatter', () => {
    const { bodyContent, frontmatterData } = useContentEditor()

    expect(bodyContent.value).toBe('')
    expect(frontmatterData.value).toEqual({})
  })

  it('parses frontmatter and body when item is selected', async () => {
    mockGetFile.mockResolvedValueOnce({
      content: '---\ntitle: Test Post\nlang: en\n---\n\n# Test Content',
      sha: 'abc123',
    })

    const { bodyContent, frontmatterData, selectItem } = useContentEditor()

    await selectItem({
      path: 'blog/test.md',
      slug: 'test',
      lang: 'en',
      frontmatter: { lang: 'en', title: 'Test' },
    })

    expect(mockGetFile).toHaveBeenCalledWith('blog/test.md')
    expect(frontmatterData.value).toEqual({ title: 'Test Post', lang: 'en' })
    expect(bodyContent.value).toBe('# Test Content')
  })

  it('handles content without frontmatter', async () => {
    mockGetFile.mockResolvedValueOnce({
      content: '# Plain Content',
      sha: 'abc123',
    })

    const { bodyContent, frontmatterData, selectItem } = useContentEditor()

    await selectItem({
      path: 'blog/test.md',
      slug: 'test',
      lang: 'en',
      frontmatter: { lang: 'en', title: 'Test' },
    })

    expect(frontmatterData.value).toEqual({})
    expect(bodyContent.value).toBe('# Plain Content')
  })

  it('reconstructs frontmatter on save', async () => {
    mockGetFile.mockResolvedValueOnce({
      content: '---\ntitle: Old Title\nlang: en\n---\n\n# Old Content',
      sha: 'abc123',
    })
    mockUpdate.mockResolvedValueOnce({ success: true })

    const { bodyContent, frontmatterData, selectItem, saveContent } =
      useContentEditor()

    await selectItem({
      path: 'blog/test.md',
      slug: 'test',
      lang: 'en',
      frontmatter: { lang: 'en', title: 'Test' },
    })

    frontmatterData.value = { title: 'New Title', lang: 'en' }
    bodyContent.value = '# New Content'
    await saveContent('blog/test.md', 'Update content')

    expect(mockUpdate).toHaveBeenCalledWith(
      'blog/test.md',
      '---\ntitle: New Title\nlang: en\n---\n\n# New Content',
      'Update content',
      'abc123'
    )
  })
})
