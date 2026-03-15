const CONTENT_LIST = /^\/api\/github\/content\/(blog|pages|positions)$/
const CONTENT_ITEM =
  /^\/api\/github\/content\/(blog|pages|positions)\/([^/]+)\/([^/]+)$/
const CONTENT_SLUG =
  /^\/api\/github\/content\/(blog|pages|positions)\/([^/]+)$/

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

/** Matched content slug route (no lang) */
export interface ContentSlugMatch {
  readonly kind: 'slug'
  readonly type: string
  readonly slug: string
}

/**
 * Try to match a content route from the pathname.
 * @param pathname - URL pathname
 * @returns Match result or undefined
 */
export const matchContent = (
  pathname: string
): ContentListMatch | ContentItemMatch | ContentSlugMatch | undefined => {
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

  const slugMatch = pathname.match(CONTENT_SLUG)
  if (slugMatch?.[1] && slugMatch[2]) {
    return { kind: 'slug', type: slugMatch[1], slug: slugMatch[2] }
  }

  return undefined
}
