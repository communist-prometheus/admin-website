import { describe, expect, it } from 'vitest'
import { generateToc } from './generate-toc'

describe('generateToc', () => {
  it('inserts a TOC when the doc has at least 3 H2 headings', () => {
    const md = ['## A', 'body', '## B', 'body', '## C', 'body'].join('\n')
    const out = generateToc(md)
    expect(out.startsWith('## Contents\n')).toBe(true)
    expect(out).toContain('- [A](#a)')
    expect(out).toContain('- [B](#b)')
    expect(out).toContain('- [C](#c)')
    expect(out).toMatch(/## Contents\n\n[\s\S]+\n\n## A/)
  })

  it('does nothing when fewer than 3 H2/H3 headings exist', () => {
    const md = '# Title\n\n## Only one\n\nbody'
    expect(generateToc(md)).toBe(md)
  })

  it('does nothing when the doc has only an H1', () => {
    const md = '# Title\n\nbody body body'
    expect(generateToc(md)).toBe(md)
  })

  it('skips H1 (article title) but counts H2 + H3', () => {
    const md = '# T\n\n## A\n\n### B\n\n### C\n\nbody'
    const out = generateToc(md)
    expect(out).toContain('## Contents')
    expect(out).not.toContain('- [T](#')
    expect(out).toContain('- [A](#a)')
    expect(out).toContain('  - [B](#b)')
    expect(out).toContain('  - [C](#c)')
  })

  it('does not double-insert when a TOC already exists', () => {
    const existing =
      '## Contents\n\n- [A](#a)\n\n## A\n\nbody\n\n## B\n\nbody\n\n## C\n\nbody'
    expect(generateToc(existing)).toBe(existing)
  })

  it('preserves Cyrillic in slugs', () => {
    const md = [
      '## Предисловие',
      'body',
      '## Партия',
      'body',
      '## Метод',
      'body',
    ].join('\n')
    const out = generateToc(md)
    expect(out).toContain('- [Предисловие](#предисловие)')
    expect(out).toContain('- [Партия](#партия)')
    expect(out).toContain('- [Метод](#метод)')
  })

  it('handles numbered headings like "1. Title"', () => {
    const md = [
      '## 1. First',
      'body',
      '## 2. Second',
      'body',
      '## 3. Third',
      'body',
    ].join('\n')
    const out = generateToc(md)
    expect(out).toContain('- [1. First](#1-first)')
    expect(out).toContain('- [2. Second](#2-second)')
    expect(out).toContain('- [3. Third](#3-third)')
  })

  it('disambiguates duplicate slugs with -1, -2 suffix', () => {
    const md = [
      '## Notes',
      'body',
      '## Notes',
      'body',
      '## Notes',
      'body',
    ].join('\n')
    const out = generateToc(md)
    expect(out).toContain('- [Notes](#notes)')
    expect(out).toContain('- [Notes](#notes-1)')
    expect(out).toContain('- [Notes](#notes-2)')
  })

  it('emits two-space indent for H3 entries', () => {
    const md = '## Top\n\nbody\n\n### Sub\n\nbody\n\n### Another\n\nbody'
    const out = generateToc(md)
    expect(out).toContain(
      '- [Top](#top)\n  - [Sub](#sub)\n  - [Another](#another)'
    )
  })
})
