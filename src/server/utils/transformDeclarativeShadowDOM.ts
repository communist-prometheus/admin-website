import {
  transformLayoutWrapper,
  transformSemanticElements,
} from './shadowDOM/transformers'

/**
 * Transforms SSR-rendered HTML to inject Declarative Shadow DOM for Web Components
 * Finds divs with data-wc attribute and wraps them in semantic custom elements
 * @param html - SSR-rendered HTML string
 * @returns Transformed HTML with Declarative Shadow DOM templates
 */
export const transformDeclarativeShadowDOM = (html: string): string => {
  const withLayout = transformLayoutWrapper(html)
  return transformSemanticElements(withLayout)
}
