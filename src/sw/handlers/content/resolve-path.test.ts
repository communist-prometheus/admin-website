import { describe, expect, it, vi } from 'vitest'
import { resolveContentPath } from './resolve-path'

vi.mock('../../git/io/list-files', () => ({
  listFilesUnder: vi.fn(),
}))

vi.mock('../../state/state', () => ({
  workerState: { config: { contentPath: '' } },
}))

const { listFilesUnder } = await import('../../git/io/list-files')
const mockList = vi.mocked(listFilesUnder)

describe('resolveContentPath', () => {
  it('resolves blog index.{lang}.md path', async () => {
    mockList.mockResolvedValueOnce([
      'blog/media-showcase/index.en.md',
      'blog/media-showcase/index.ru.md',
    ])
    const result = await resolveContentPath('blog', 'media-showcase', 'en')
    expect(result).toBe('blog/media-showcase/index.en.md')
  })

  it('resolves flat page path', async () => {
    mockList.mockResolvedValueOnce([
      'pages/manifest.en.md',
      'pages/manifest.ru.md',
    ])
    const result = await resolveContentPath('pages', 'manifest', 'ru')
    expect(result).toBe('pages/manifest.ru.md')
  })

  it('returns undefined when not found', async () => {
    mockList.mockResolvedValueOnce(['blog/other/index.en.md'])
    const result = await resolveContentPath('blog', 'missing', 'en')
    expect(result).toBeUndefined()
  })

  it('prefers index over flat path', async () => {
    mockList.mockResolvedValueOnce([
      'blog/post/index.en.md',
      'blog/post.en.md',
    ])
    const result = await resolveContentPath('blog', 'post', 'en')
    expect(result).toBe('blog/post/index.en.md')
  })
})
