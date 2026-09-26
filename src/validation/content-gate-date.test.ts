import { describe, expect, it } from 'vitest'
import { validateContentFile } from './content-gate'

/**
 * An editor typed `publishDate: 2026-15-09` in the github.com web editor.
 * There is no month 15, so Astro's schema refused the entry and the build's
 * quarantine dropped the file — the article was a 404 for twelve days while
 * every deploy stayed green. YAML parses it happily (it is just a string), and
 * the per-type schema accepts any string, so nothing upstream objected.
 *
 * A date that is not a date is now refused at the gate, on both write paths.
 */
/**
 * A minimal blog file with one extra frontmatter line.
 * @param extra - the frontmatter line under test
 * @returns the full file body
 */
const article = (extra: string): string =>
  `---\ntitle: "T"\nlang: ru\ncategory: history\n${extra}\n---\n\nBody\n`

const PATH = 'blog/x/index.ru.md'

describe('a date that is not a date never reaches the repository', () => {
  it('refuses an impossible month', () => {
    const reason = validateContentFile(
      PATH,
      article('publishDate: 2026-15-09')
    )
    expect(reason).toMatch(/publishDate/)
    expect(reason).toMatch(/2026-15-09/)
  })

  it('refuses an impossible day', () => {
    expect(validateContentFile(PATH, article('pubDate: 2026-02-31'))).toMatch(
      /pubDate/
    )
  })

  it('refuses a value that is not a date at all', () => {
    expect(validateContentFile(PATH, article('date: tomorrow'))).toMatch(
      /date/
    )
  })

  it('accepts the ISO date the editor actually writes', () => {
    expect(
      validateContentFile(PATH, article('publishDate: 2026-09-15'))
    ).toBeUndefined()
  })

  it('accepts a date YAML already parsed into a Date', () => {
    expect(
      validateContentFile(PATH, article('publishDate: 2026-09-15 00:00:00'))
    ).toBeUndefined()
  })

  it('leaves a material with no date alone', () => {
    expect(
      validateContentFile(PATH, article('published: true'))
    ).toBeUndefined()
  })

  it('checks every date key a file may carry, not just the first', () => {
    const both = article('pubDate: 2026-09-15\npublishDate: 2026-15-09')
    expect(validateContentFile(PATH, both)).toMatch(/publishDate/)
  })
})
