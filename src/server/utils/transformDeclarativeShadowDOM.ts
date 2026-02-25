import { WEB_COMPONENTS_CONFIG } from './shadowDOM/config'
import { findAllTagMatches } from './shadowDOM/parser'
import { wrapWithShadowDOM } from './shadowDOM/wrapper'

/**
 * Transforms SSR-rendered HTML to inject Declarative Shadow DOM for Web Components
 * This enables Shadow DOM isolation with zero CLS (Cumulative Layout Shift)
 * @param html - SSR-rendered HTML string
 * @returns Transformed HTML with Declarative Shadow DOM templates
 */
export const transformDeclarativeShadowDOM = (html: string): string => {
  let transformed = html

  for (const config of WEB_COMPONENTS_CONFIG) {
    const matches = findAllTagMatches(transformed, config.tag)

    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]
      if (!match) continue

      const { index, content, attributes } = match
      const openTag = `<${config.tag}${attributes}>`
      const closeTag = `</${config.tag}>`
      const wrappedContent = wrapWithShadowDOM(
        config.tag,
        attributes,
        content,
        config.styles
      )

      const originalLength = openTag.length + content.length + closeTag.length
      transformed =
        transformed.substring(0, index) +
        wrappedContent +
        transformed.substring(index + originalLength)
    }
  }

  return transformed
}
