import GithubSlugger from 'github-slugger'

const HEADING_RE = /^(#{1,3})\s+(.+?)\s*$/gm
const TOC_THRESHOLD = 3

interface Heading {
  readonly level: 1 | 2 | 3
  readonly text: string
}

const collect = (markdown: string): readonly Heading[] =>
  Array.from(markdown.matchAll(HEADING_RE), m => ({
    level: (m[1]?.length ?? 1) as 1 | 2 | 3,
    text: m[2] ?? '',
  }))

const indentFor = (level: 1 | 2 | 3): string => (level === 3 ? '  ' : '')

const tocLine = (h: Heading, slug: string): string =>
  `${indentFor(h.level)}- [${h.text}](#${slug})`

const buildBlock = (headings: readonly Heading[]): string => {
  const slugger = new GithubSlugger()
  const lines = headings.map(h => tocLine(h, slugger.slug(h.text)))
  return ['## Contents', '', ...lines].join('\n')
}

const hasContents = (markdown: string): boolean =>
  /^##\s+Contents\s*$/m.test(markdown)

/**
 * Build a markdown table-of-contents block from `##`/`###` headings
 * in the given body and prepend it. Skips when the body has fewer
 * than `TOC_THRESHOLD` qualifying headings or already contains a
 * `## Contents` block.
 *
 * @param markdown final imported markdown (post-turndown)
 * @returns markdown with TOC prepended, or unchanged input
 */
export const generateToc = (markdown: string): string => {
  const headings = hasContents(markdown)
    ? []
    : collect(markdown).filter(h => h.level === 2 || h.level === 3)
  return headings.length < TOC_THRESHOLD
    ? markdown
    : `${buildBlock(headings)}\n\n${markdown}`
}
