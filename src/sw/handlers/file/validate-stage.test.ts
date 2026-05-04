import { describe, expect, it } from 'vitest'
import { guardStagePayload } from './validate-stage'

const goodBlog = `---
title: Hello
description: World
category: General
pubDate: 2026-01-01
lang: en
---

body`

const emptyTitleBlog = `---
title:
description: World
category: General
pubDate: 2026-01-01
lang: en
---

body`

describe('guardStagePayload', () => {
  it('ignores non-content paths (assets, labels.json, etc.)', () => {
    expect(
      guardStagePayload('src/content/blog/foo/assets/cover.jpg', 'BIN')
    ).toBeUndefined()
    expect(guardStagePayload('settings/languages.json', '{}')).toBeUndefined()
  })

  it('accepts a content md file with valid frontmatter', () => {
    expect(
      guardStagePayload('src/content/blog/hello/index.en.md', goodBlog)
    ).toBeUndefined()
  })

  it('rejects empty title on a content md file', () => {
    const reason = guardStagePayload(
      'src/content/blog/hello/index.en.md',
      emptyTitleBlog
    )
    expect(reason).toBeTruthy()
    expect(reason).toMatch(/title/i)
  })

  it('passes for unknown content types (forward-compat)', () => {
    expect(
      guardStagePayload(
        'src/content/experiments/x/index.en.md',
        'no frontmatter'
      )
    ).toBeUndefined()
  })

  /*
   * The from-manchester-to-global regression: a description with an
   * unquoted colon emits "predatoria: ha …" which Astro's parser
   * sees as a new mapping key with bad indentation. The stage guard
   * MUST reject this payload before it reaches git so prod never
   * goes red on a frontmatter parse error again.
   */
  it('rejects a content md whose frontmatter does not parse as YAML', () => {
    const broken = [
      '---',
      'title: A',
      'description: capital changed: scaled up to the entire planet',
      'category: General',
      'pubDate: 2026-01-01',
      'lang: en',
      '---',
      '',
      'body',
    ].join('\n')

    const reason = guardStagePayload('src/content/blog/x/index.en.md', broken)

    expect(reason).toBeTruthy()
    expect(reason).toMatch(/frontmatter is not valid YAML/i)
  })

  it('accepts the same description once it is single-quoted', () => {
    const fixed = [
      '---',
      'title: A',
      `description: 'capital changed: scaled up to the entire planet'`,
      'category: General',
      'pubDate: 2026-01-01',
      'lang: en',
      '---',
      '',
      'body',
    ].join('\n')

    expect(
      guardStagePayload('src/content/blog/x/index.en.md', fixed)
    ).toBeUndefined()
  })

  it('accepts the same description once it is a folded scalar', () => {
    const fixed = [
      '---',
      'title: A',
      'description: >-',
      '  capital changed: scaled up to the entire planet',
      'category: General',
      'pubDate: 2026-01-01',
      'lang: en',
      '---',
      '',
      'body',
    ].join('\n')

    expect(
      guardStagePayload('src/content/blog/x/index.en.md', fixed)
    ).toBeUndefined()
  })
})
