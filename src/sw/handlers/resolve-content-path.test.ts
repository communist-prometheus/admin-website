import { describe, expect, it, vi } from 'vitest'
import { resolveContentPath } from './resolve-content-path'

vi.mock('../git/list-files', () => ({
  listFilesUnder: vi.fn(),
}))

vi.mock('../state', () => ({
  workerState: { config: { contentPath: 'src/content' } },
}))

const { listFilesUnder } = await import('../git/list-files')
const mockList = vi.mocked(listFilesUnder)

describe('resolveContentPath', () => {
  it('resolves blog index.{lang}.md path', async () => {
    mockList.mockResolvedValueOnce([
      'src/content/blog/media-showcase/index.en.md',
      'src/content/blog/media-showcase/index.ru.md',
    ])
    const result = await resolveContentPath('blog', 'media-showcase', 'en')
    expect(result).toBe('src/content/blog/media-showcase/index.en.md')
  })

  it('resolves flat page path', async () => {
    mockList.mockResolvedValueOnce([
      'src/content/pages/manifest.en.md',
      'src/content/pages/manifest.ru.md',
    ])
    const result = await resolveContentPath('pages', 'manifest', 'ru')
    expect(result).toBe('src/content/pages/manifest.ru.md')
  })

  it('returns undefined when file not found', async () => {
    mockList.mockResolvedValueOnce(['src/content/blog/other/index.en.md'])
    const result = await resolveContentPath('blog', 'missing', 'en')
    expect(result).toBeUndefined()
  })

  it('prefers index.{lang}.md over flat path', async () => {
    mockList.mockResolvedValueOnce([
      'src/content/blog/post/index.en.md',
      'src/content/blog/post.en.md',
    ])
    const result = await resolveContentPath('blog', 'post', 'en')
    expect(result).toBe('src/content/blog/post/index.en.md')
  })
})
