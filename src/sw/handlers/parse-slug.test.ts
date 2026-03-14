import { describe, expect, it } from 'vitest'
import { parseSlugFromPath } from './parse-slug'

describe('parseSlugFromPath', () => {
  it('extracts slug from blog index file', () => {
    const path = 'src/content/blog/media-showcase/index.en.md'
    expect(parseSlugFromPath(path)).toBe('media-showcase')
  })

  it('extracts slug from blog index in other languages', () => {
    expect(parseSlugFromPath('src/content/blog/my-post/index.ru.md')).toBe(
      'my-post'
    )
    expect(parseSlugFromPath('src/content/blog/my-post/index.it.md')).toBe(
      'my-post'
    )
    expect(parseSlugFromPath('src/content/blog/my-post/index.es.md')).toBe(
      'my-post'
    )
  })

  it('extracts slug from flat page file', () => {
    expect(parseSlugFromPath('src/content/pages/manifest.en.md')).toBe(
      'manifest'
    )
  })

  it('extracts slug from flat position file', () => {
    expect(
      parseSlugFromPath('src/content/positions/digital-sovereignty.ru.md')
    ).toBe('digital-sovereignty')
  })

  it('handles legacy slug-named blog files', () => {
    const path = 'src/content/blog/welcome/welcome-to-prometheus.en.md'
    expect(parseSlugFromPath(path)).toBe('welcome-to-prometheus')
  })
})
