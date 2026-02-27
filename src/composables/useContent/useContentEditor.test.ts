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
  it('initializes with empty content', () => {
    const { fileContent } = useContentEditor()

    expect(fileContent.value).toBe('')
  })

  it('loads file content when item is selected', async () => {
    mockGetFile.mockResolvedValueOnce({
      content: '# Test Content',
      sha: 'abc123',
    })

    const { fileContent, selectItem } = useContentEditor()

    await selectItem({ path: 'blog/test.md', slug: 'test', frontmatter: { lang: 'en' } })

    expect(mockGetFile).toHaveBeenCalledWith('blog/test.md')
    expect(fileContent.value).toBe('# Test Content')
  })

  it('saves content with commit message', async () => {
    mockGetFile.mockResolvedValueOnce({
      content: '# Old Content',
      sha: 'abc123',
    })
    mockUpdate.mockResolvedValueOnce({ success: true })

    const { fileContent, selectItem, saveContent } = useContentEditor()

    await selectItem({ path: 'blog/test.md', slug: 'test', frontmatter: { lang: 'en' } })
    fileContent.value = '# New Content'
    await saveContent('blog/test.md', 'Update content')

    expect(mockUpdate).toHaveBeenCalledWith('blog/test.md', '# New Content', 'Update content', 'abc123')
  })
})
