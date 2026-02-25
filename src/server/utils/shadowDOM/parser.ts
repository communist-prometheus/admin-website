import type { TagMatch } from './types'

/**
 * Finds the matching closing tag for a custom element
 * @param html - HTML string to search in
 * @param tagName - Name of the tag to find closing tag for
 * @param startIndex - Index to start searching from
 * @returns Index of the closing tag or -1 if not found
 */
export const findMatchingCloseTag = (
  html: string,
  tagName: string,
  startIndex: number
): number => {
  let depth = 1
  let currentIndex = startIndex

  while (depth > 0 && currentIndex < html.length) {
    const nextOpen = html.indexOf(`<${tagName}`, currentIndex)
    const nextClose = html.indexOf(`</${tagName}>`, currentIndex)

    if (nextClose === -1) return -1

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      currentIndex = nextOpen + tagName.length + 1
    } else {
      depth--
      if (depth === 0) return nextClose
      currentIndex = nextClose + tagName.length + 3
    }
  }

  return -1
}

/**
 * Finds all matches of a custom element tag in HTML
 * @param html - HTML string to search in
 * @param tagName - Name of the tag to find
 * @returns Array of matched tags with their positions and content
 */
export const findAllTagMatches = (
  html: string,
  tagName: string
): readonly TagMatch[] => {
  const matches: TagMatch[] = []
  const openTagPattern = new RegExp(`<${tagName}([^>]*)>`, 'g')
  let match = openTagPattern.exec(html)

  while (match !== null) {
    const openTagIndex = match.index
    const attributes = match[1] || ''
    const openTagEnd = openTagIndex + match[0].length
    const closeTagIndex = findMatchingCloseTag(html, tagName, openTagEnd)

    if (closeTagIndex !== -1) {
      const content = html.substring(openTagEnd, closeTagIndex)
      matches.push({ index: openTagIndex, content, attributes })
    }

    match = openTagPattern.exec(html)
  }

  return matches
}
