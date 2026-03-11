const CONTENT_LIST = /^\/api\/github\/content\/(blog|pages|positions)$/
const CONTENT_ITEM =
  /^\/api\/github\/content\/(blog|pages|positions)\/([^/]+)\/([^/]+)$/

/** Matched content list route */
export interface ContentListMatch {
  readonly kind: 'list'
  readonly type: string
}

/** Matched content item route */
export interface ContentItemMatch {
  readonly kind: 'item'
  readonly type: string
  readonly slug: string
  readonly lang: string
}

/**
 * Try to match a content route from the pathname.
 * @param pathname - URL pathname
 * @returns Match result or undefined
 */
export const matchContent = (
  pathname: string
): ContentListMatch | ContentItemMatch | undefined => {
  const listMatch = pathname.match(CONTENT_LIST)
  if (listMatch?.[1]) {
    return { kind: 'list', type: listMatch[1] }
  }

  const itemMatch = pathname.match(CONTENT_ITEM)
  if (itemMatch?.[1] && itemMatch[2] && itemMatch[3]) {
    return {
      kind: 'item',
      type: itemMatch[1],
      slug: itemMatch[2],
      lang: itemMatch[3],
    }
  }

  return undefined
}
