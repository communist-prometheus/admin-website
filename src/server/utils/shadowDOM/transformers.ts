import { WEB_COMPONENTS_CONFIG } from './config'
import { findAllTagMatches } from './parser'
import { wrapWithShadowDOM } from './wrapper'

const APP_LAYOUT_TAG = 'app-layout'

/**
 * Transforms app-layout wrapper with Declarative Shadow DOM
 * @param html - SSR-rendered HTML string
 * @returns Transformed HTML with app-layout wrapped in DSD
 */
export const transformLayoutWrapper = (html: string): string => {
  let transformed = html
  const layoutConfig = WEB_COMPONENTS_CONFIG.find(
    c => c.tag === APP_LAYOUT_TAG
  )
  if (!layoutConfig) return transformed

  const layoutMatches = findAllTagMatches(transformed, APP_LAYOUT_TAG)
  for (let i = layoutMatches.length - 1; i >= 0; i--) {
    const match = layoutMatches[i]
    if (!match) continue

    const { index, content, attributes } = match
    const openTag = `<${APP_LAYOUT_TAG}${attributes}>`
    const closeTag = `</${APP_LAYOUT_TAG}>`
    const wrappedContent = wrapWithShadowDOM(
      APP_LAYOUT_TAG,
      attributes,
      content,
      layoutConfig.styles
    )

    const originalLength = openTag.length + content.length + closeTag.length
    transformed =
      transformed.substring(0, index) +
      wrappedContent +
      transformed.substring(index + originalLength)
  }

  return transformed
}

/**
 * Transforms divs with data-wc attributes into semantic custom elements with DSD
 * @param html - HTML string with data-wc marked divs
 * @returns Transformed HTML with semantic custom elements
 */
export const transformSemanticElements = (html: string): string => {
  let transformed = html

  for (const config of WEB_COMPONENTS_CONFIG) {
    // Skip app-layout as it's already processed
    if (config.tag === APP_LAYOUT_TAG) continue

    const regex = new RegExp(
      `<div\\s+data-wc="${config.tag}"([^>]*)>([\\s\\S]*?)</div>`,
      'gi'
    )

    transformed = transformed.replace(regex, (_, attrs, content) => {
      return wrapWithShadowDOM(
        config.tag,
        attrs,
        content.trim(),
        config.styles
      )
    })
  }

  return transformed
}
