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
})
